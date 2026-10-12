// Lets `npm run dev` serve the files in /api (the same ones Vercel runs in production).
// Used by vite.config.js. Not part of the website bundle.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function devApi(root, env = {}) {
  return async function devApiMiddleware(req, res, next) {
    if (!req.url || !req.url.startsWith('/api/')) return next()
    const name = req.url.split('?')[0].slice(5).replace(/\/$/, '')
    if (!/^[a-z0-9-]+$/i.test(name)) return next() // also rejects names starting with "_" (private helpers)
    const file = path.join(root, 'api', name + '.js')
    if (!fs.existsSync(file)) return next()

    let raw = ''
    for await (const chunk of req) raw += chunk
    try { req.body = raw ? JSON.parse(raw) : {} } catch { req.body = {} }
    res.status = (code) => { res.statusCode = code; return res }
    res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return res }

    Object.assign(process.env, env)
    try {
      const mod = await import(pathToFileURL(file).href + '?t=' + fs.statSync(file).mtimeMs) // picks up edits to chat.js
      await mod.default(req, res)
    } catch (err) {
      console.error('[dev-api]', err)
      if (!res.headersSent) res.status(500).json({ error: 'Server error' })
    }
  }
}
