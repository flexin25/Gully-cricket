# 🏏 CricHub.in — Gully Cricket Scorer

**Score like a pro.**

A fast, no-frills, ball-by-ball scoring app built for gully (street) cricket — made so you can actually see a scorecard without wading through ten pop-up ads to get there.

🔗 **Live Demo:** [siliguri-chhad-riders.vercel.app](https://siliguri-chhad-riders.vercel.app/)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel&logoColor=white)

---

## 📖 Table of Contents

- [Why This Exists](#-why-this-exists)
- [About the Build](#-about-the-build)
- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Roadmap](#-roadmap)
- [Author](#-author)
- [License](#-license)

---

## 🤨 Why This Exists

The honestly kind of awkward origin story: most free gully cricket scorecard sites are unusable — full-screen ads, redirect pop-ups, and a scorecard buried three "click to continue" screens deep just to see who's on strike. CricHub was built purely out of frustration with that experience — a clean, ad-free scorer for casual street/turf matches that just shows the score.

## 🎪 About the Build

This project started life as a **Vibeathon** submission — a hackathon-style event where the goal is to ship something fun, fast, and a little chaotic. True to that spirit:

- **Half the codebase was written from scratch by hand**, and **half was "vibe coded"** (built rapidly with AI-assisted pair-programming) — but the underlying scoring logic is consistent throughout, regardless of which half wrote it.
- It was built under event time pressure, so expect some rough edges — this was about proving the concept and getting a working scorer in front of players, not shipping a polished production app.

## 🌦️ About

CricHub is a lightweight, single-page web app for scoring casual cricket matches in real time — built for the kind of games played in a lane, a park, or a local turf, where you just want to track the score on someone's phone without any fuss.

## ✨ Features

> Note: exact feature set may evolve — this reflects the core scoring experience the app is built around.

- 🏏 **Ball-by-ball scoring** — log runs, wickets, and extras as the match happens
- 📊 **Live scorecard** — real-time team score, overs, and match state
- ⚡ **Fast, minimal UI** — built for quick taps mid-match, not spreadsheet-style data entry
- 🌓 **Dark, distraction-free theme** — easy on the eyes for outdoor/evening games
- 🚫 **Zero ads** — the entire reason this exists
- 📱 **Mobile-first & responsive** — designed to be used one-handed, courtside
- 🔗 **Client-side routing** — smooth navigation between setup, live scoring, and scorecard views without full page reloads

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vitejs.dev/) |
| Routing | [React Router DOM 7](https://reactrouter.com/) |
| State Management | [Zustand 5](https://github.com/pmndrs/zustand) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`) |
| Icons | [Lucide React](https://lucide.dev/) |
| Linting | [ESLint 10](https://eslint.org/) with React Hooks & React Refresh plugins |
| Font | [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (Google Fonts) |
| Hosting / Deployment | [Vercel](https://vercel.com) |

No backend — CricHub is a fully client-side single-page app; all match state lives in the browser via Zustand.

## 📂 Project Structure

```
Gully-cricket/
├── public/              # Static assets (favicon/cricket.svg, etc.)
├── src/                 # App source — components, pages, and the Zustand store
│   └── main.jsx         # App entry point, mounted to #root
├── index.html           # Vite HTML entry (loads src/main.jsx)
├── vite.config.js        # Vite build/dev config (incl. Tailwind plugin)
├── eslint.config.js       # ESLint configuration
├── package.json
├── package-lock.json
└── .gitignore
```

## 🚀 Getting Started

CricHub is a standard Vite + React project — no environment variables or external API keys are required to run it.

### 1. Clone the repository

```bash
git clone https://github.com/flexin25/Gully-cricket.git
cd Gully-cricket
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`) — open it in your browser.

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with hot reload |
| `npm run build` | Builds an optimized production bundle |
| `npm run lint` | Runs ESLint across the project |
| `npm run preview` | Serves the production build locally for a final check |

## 🗺️ Roadmap

- [ ] Clean up and unify the "scratch" and "vibe coded" halves of the codebase into one consistent style
- [ ] Add persistent match history (local storage or backend)
- [ ] Add a proper LICENSE file
- [ ] Write component/unit tests

## 👤 Author

**Abhishek Bardhan** ([@flexin25](https://github.com/flexin25))

- GitHub: [github.com/flexin25](https://github.com/flexin25)
- Instagram: [@flexin25_](https://www.instagram.com/flexin25_)
- X (Twitter): [@1mflexin_](https://twitter.com/1mflexin_)

## 📄 License

No license file is currently included in this repository. All rights are reserved by the author unless a license is added.

---

<p align="center">Built at a Vibeathon, out of pure spite for ad-filled scorecards 🏏</p>
