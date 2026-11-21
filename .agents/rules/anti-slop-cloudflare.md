---
trigger: always_on
description: Workspace Anti-Slop Engineering & Cloudflare Security Standards
---

# Anti-Slop & Cloudflare Security Rules

1. Ikuti standar anti-slop di `GEMINI.md`, `.agents/skills/design-taste-frontend/SKILL.md`, dan `.agents/skills/emil-design-eng/SKILL.md`.
2. Gunakan `min-h-[100dvh]` untuk layout viewport tinggi penuh, hindari animasi `scale(0)`, dan jaga kontras aksesibilitas.
3. Setiap perubahan pada `nutristok-rs.html` harus disinkronkan ke `deploy-nutristok/index.html` dan dipastikan tidak melanggar kebijakan `Content-Security-Policy` di `deploy-nutristok/_headers` maupun `deploy-nutristok/functions/_middleware.js`.
4. Jangan pernah menanamkan secret/API token Cloudflare (`CF_API_TOKEN`, `TURNSTILE_SECRET`) secara hardcoded ke dalam kode. Gunakan environment variables / `wrangler pages secret put`.
