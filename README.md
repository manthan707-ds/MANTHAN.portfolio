# Portfolio: all sections together

Order on the page: Hero > About > Tech stack > Work > Contact (last page).
Navbar and buttons scroll to `#hero #about #tech-stack #work #contact`.

## Run it locally (Windows, Mac, Linux)
1. Install Node.js 18 or newer (the "LTS" version) from https://nodejs.org. Check it worked: `node -v`
2. Unzip this folder, open a terminal inside it (in VS Code: Terminal > New Terminal).
3. Install the packages (once, needs internet): `npm install`
4. Add your Gemini key so the assistant can answer (the site works without it, only the assistant stays silent):
   - Windows: `copy .env.example .env`   |   Mac/Linux: `cp .env.example .env`
   - Open `.env` and replace `your_key_here` with your key from https://aistudio.google.com/apikey
5. Start it: `npm run dev`
6. Open the address it prints (usually http://localhost:5173).

Stop it with Ctrl + C. If you change `.env` or `api/_knowledge.js`, stop and start it again.

Troubleshooting
- Blank black page: press F12, open Console, and read the first red error. Make sure you ran `npm install`.
- The assistant says "Something went wrong": the key in `.env` is missing or wrong, or you are offline.
- Port 5173 busy: Vite picks the next one and prints it.
- Build for production: `npm run build` (output in `dist/`).

Already have a Vite + React project? Copy `src/`, `api/`, `index.html`, `dev-api.js` and `vite.config.js` over it, then
`npm install gsap three@0.160.0`. Tailwind is not used by any section, so it is not needed.

## Where things live
| Change | Edit |
|---|---|
| Colours | `src/styles/tokens.css` (also its rgb lines) |
| Name, role, nav, hero buttons | `src/data/profile.js` |
| About text + tree labels | `src/data/about.js` |
| Tech stack tools | top of `src/sections/TechStack/TechStack.jsx` (`STACK`) |
| Projects | `src/data/projects.js` (real images go in `public/work/`) |
| Email, links, resume | `src/data/contact.js` |
| Assistant answers | `src/data/assistant.js` |

## Two font families on purpose
Hero, navbar, menu, preloader use Syncopate / Rajdhani / Orbitron.
About, Tech stack, Work use Pixelify Sans / DM Sans. Contact has its own two `--ca-font-*` lines.
The scoped override is at the bottom of `tokens.css`. To use one family everywhere, delete that block
and set `--font-head` / `--font-body` once.

## The assistant backend (Gemini)
`api/chat.js` is a Vercel serverless function. The assistant on the site calls `POST /api/chat`, the function adds the
knowledge in `api/_knowledge.js` and asks Gemini. The key never reaches the browser.

| File | What it does |
|---|---|
| `api/chat.js` | the endpoint: cleans the chat history, calls Gemini, trims cut-off answers, adds the "Open contact" button when it fits, rate-limits (20 per minute per visitor) |
| `api/_knowledge.js` | **everything the assistant knows about you.** Edit this to "retrain" it: facts, projects, tone, availability |
| `api/_lib.js` | small helpers used by `chat.js` |
| `dev-api.js` + `vite.config.js` | make `npm run dev` serve the `/api` files too, so it works locally |

**Set up**
1. Get a free key at https://aistudio.google.com/apikey
2. Locally: copy `.env.example` to `.env`, paste the key after `GEMINI_API_KEY=`, run `npm run dev`.
3. On Vercel: Project > Settings > Environment Variables > add `GEMINI_API_KEY`, then redeploy.

Notes: after editing `_knowledge.js` restart `npm run dev`. `npm run preview` does not run `/api`; use `vercel dev` for a production-like test.
The model is `gemini-2.5-flash` (change it with an optional `GEMINI_MODEL` variable).
Tone of the answers comes from the PERSONALITY and RESPONSE RULES at the top of `_knowledge.js`.

## Still to do
- `api/contact.js` (sends the contact form as an email) does not exist yet. Until it does, the form shows "Preview mode"
  and sends nothing. When ready, set `ENDPOINTS.contact = "/api/contact"` in `src/data/contact.js`.
- `public/`: add favicon, `resume.pdf`, og-image, and put its URL in `contact.js` (`resume`).
- `src/data/projects.js`: links set to `'#'` show as "soon" until you add real URLs.
