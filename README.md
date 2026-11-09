# Luna AI — production deployment package

Luna AI is a Next.js application with a ChatGPT-inspired workspace and an initial basketball quarter-analysis interface.

## Included in this build
- Responsive Luna AI workspace UI
- Server-side OpenAI chat endpoint (API key is never sent to the browser)
- Basketball quarter pace calculator with an explicit non-probability disclaimer
- Explore and file-workspace UI foundations
- Basic browser security headers and Vercel deployment configuration

## Honest feature status
The application is a deployable foundation, not yet a complete clone of ChatGPT/Grok. The following require external services and further integration before they can be advertised as available: user authentication, persistent chat history, live web search, private file storage and image/document analysis, live basketball scores/play-by-play, verified historical quarter splits, usage billing and admin controls. The basketball calculator is a simple pace illustration, not a calibrated betting model.

## Deploy publicly on Vercel
1. Create or sign in to a Vercel account.
2. Put this project in a GitHub repository and import that repository into Vercel, or deploy with the Vercel CLI from a machine signed in to Vercel.
3. Add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in the Vercel project's Environment Variables. Never put secrets in client-side code or commit them to Git.
4. Deploy. Vercel will provide a public `*.vercel.app` URL. Add a custom domain later if desired.

## Local development
Requires Node.js 20+.

```bash
cp .env.example .env.local
# Set OPENAI_API_KEY in .env.local
npm install
npm run dev
