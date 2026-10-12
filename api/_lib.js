// Small pure helpers shared by api/chat.js. The leading underscore keeps Vercel from exposing this file as a route.

export const MAX_MESSAGES = 12   // only the most recent turns are sent to the model
export const MAX_USER_CHARS = 500
export const MAX_BOT_CHARS = 1200

// Accepts both shapes: the portfolio assistant sends { role: 'user' | 'assistant', content },
// the older widget sent { from: 'user' | 'bot', text }.
// Returns clean turns [{ role: 'user' | 'model', text }] that start with a user turn and alternate.
export function cleanMessages(messages) {
  if (!Array.isArray(messages)) return []
  const turns = []
  for (const m of messages) {
    if (!m || typeof m !== 'object') continue
    const raw = typeof m.content === 'string' ? m.content : typeof m.text === 'string' ? m.text : ''
    const text = raw.trim()
    if (!text) continue
    const isUser = m.role === 'user' || m.from === 'user'
    const role = isUser ? 'user' : 'model'
    const clipped = text.slice(0, isUser ? MAX_USER_CHARS : MAX_BOT_CHARS)
    const last = turns[turns.length - 1]
    if (last && last.role === role) last.text += '\n' + clipped // merge same-role neighbours
    else turns.push({ role, text: clipped })
  }
  const recent = turns.slice(-MAX_MESSAGES)
  while (recent.length && recent[0].role !== 'user') recent.shift() // the model needs a user turn first
  return recent
}

// If the answer was cut off by the token limit, keep everything up to the last full sentence.
export function trimToSentence(reply) {
  const last = Math.max(reply.lastIndexOf('.'), reply.lastIndexOf('!'), reply.lastIndexOf('?'))
  return last > 0 ? reply.slice(0, last + 1) : reply
}

// Adds an "Open contact" button under the answer when the topic is reaching Manthan.
// The label must match the one used in src/data/assistant.js.
const CONTACT_TOPIC = /(contact|reach|e-?mail|get in touch|message|hire|hiring|recruit|intern|freelance|avail|collaborat|work with)/i
const CONTACT_REPLY = /(contact (page|form)|ask manthan|reach (out|him))/i
export function pickGo(lastUserText, reply) {
  return CONTACT_TOPIC.test(lastUserText || '') || CONTACT_REPLY.test(reply || '') ? 'Open contact' : undefined
}
