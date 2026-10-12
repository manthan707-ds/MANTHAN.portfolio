// POST /api/chat   body: { messages: [{ role: 'user' | 'assistant', content }] }   ->   { reply, go? }
// The Gemini key lives only here (process.env.GEMINI_API_KEY). It is never sent to the browser.
import { SYSTEM_PROMPT } from './_knowledge.js'
import { cleanMessages, trimToSentence, pickGo } from './_lib.js'

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

// Best-effort per-visitor limit (memory is per serverless instance, so it only slows down casual abuse).
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20
const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k)
  return recent.length > MAX_PER_WINDOW
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  if (limited(ip)) return res.status(429).json({ error: 'Too many requests' })

  const turns = cleanMessages(req.body?.messages)
  if (turns.length === 0) return res.status(400).json({ error: 'No user message' })

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set')
    return res.status(500).json({ error: 'Assistant is not configured' })
  }

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY, // header, not URL, so it never lands in logs
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 }, // short chat answers: do not spend the token budget on hidden thinking
        },
      }),
    })

    if (!geminiRes.ok) {
      // Log the real error server-side only; never send it to the browser.
      console.error('Gemini API error:', geminiRes.status, await geminiRes.text())
      return res.status(502).json({ error: 'Upstream error' })
    }

    const data = await geminiRes.json()
    const candidate = data.candidates?.[0]
    let reply = candidate?.content?.parts?.map((p) => p.text || '').join('').trim() || ''
    if (!reply) return res.status(200).json({ reply: "I'm drawing a blank on that one. Try rephrasing?" })
    if (candidate?.finishReason === 'MAX_TOKENS') reply = trimToSentence(reply)

    const lastUser = [...turns].reverse().find((t) => t.role === 'user')?.text
    return res.status(200).json({ reply, go: pickGo(lastUser, reply) })
  } catch (err) {
    console.error('Chat API error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
