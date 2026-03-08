# Frontend — Immigration AI Agent

Premium React web interface for the Immigration AI Agent. Built with **Vite**, styled with **Tailwind CSS**, featuring glassmorphism design and Telegram integration.

## Directory Structure

```
frontend/
├── src/
│   ├── App.jsx                       # Main app (state-based routing)
│   ├── main.jsx                      # React entry point
│   ├── index.css                     # Global styles
│   └── components/
│       ├── Layout.jsx                # Premium dark layout with nav
│       ├── RegistrationForm.jsx      # Registration + Telegram opt-in
│       └── SuccessPage.jsx           # Post-registration with link code
├── index.html                        # HTML entry (Tailwind CDN + Google Fonts)
├── vite.config.js                    # Vite config with API proxy
└── package.json
```

## Features

- 🎨 **Premium Design** — Dark mode, glassmorphism, gold accents
- 📝 **Registration** — Name, email, password, country, location
- 📱 **Telegram Opt-In** — Toggle to enable Telegram, shows link code after signup
- 🔐 **Supabase Auth** — Secure JWT-based authentication
- 💬 **Chat Interface** — Ask immigration questions directly (coming soon)

## Running

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000` with API requests proxied to `http://localhost:8000`.

## API Proxy

The Vite config proxies `/api` requests to the backend:

```js
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

## Design System

| Token | Value |
|-------|-------|
| Background | `#0f172a` (premium dark) |
| Accent | `#fbbf24` (gold) |
| Primary | `#1e40af` (deep blue) |
| Font | Outfit (Google Fonts) |
| Cards | Glassmorphism (`backdrop-filter: blur`) |
