# 🏏 CricHub.in — Gully Cricket Scorer

**Score like a pro.**

A fast, no-frills, ball-by-ball scoring app built for gully (street) cricket — made so you can actually see a scorecard without wading through ten pop-up ads to get there.

🔗 **Live Demo:** [siliguri-chhad-riders.vercel.app](https://siliguri-chhad-riders.vercel.app/)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui-000000?style=flat)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel&logoColor=white)

---

## 📖 Table of Contents

- [Why This Exists](#-why-this-exists)
- [About the Build](#-about-the-build)
- [About](#-about)
- [Features](#-features)
- [The Toss](#-the-toss)
- [Theming & Accessibility](#-theming--accessibility)
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

Since the event it has been hardened: match state now survives a reload, undo restores a real snapshot instead of approximating, the scorecard PDF is a generated document rather than a screenshot, and the app performs the toss itself.

## 🌦️ About

CricHub is a lightweight, single-page web app for scoring casual cricket matches in real time — built for the kind of games played in a lane, a park, or a local turf, where you just want to track the score on someone's phone without any fuss.

## ✨ Features

**Scoring**
- 🏏 **Ball-by-ball scoring** — runs, wides, no-balls, byes and leg byes, wickets with fielder credit
- 🪙 **Real coin toss** — the app flips it; see [The Toss](#-the-toss)
- ⏪ **True undo** — restores a full snapshot of the previous ball, correct across a wicket, an over boundary and an innings change
- 🔄 **Auto strike rotation** — odd runs and end-of-over changeovers handled for you
- 🎯 **Powerplay tracking** — configurable powerplay overs per match
- 🆓 **Free hit** — after a no-ball, only a run out can dismiss the striker
- ⏸ **Timeout / drinks break** — a 2-minute timer that blocks scoring until it is resolved
- 📊 **Live scorecard** — CRR, RRR, target, batsman SR, bowler economy, 4s/6s
- 👑 **Captain / vice-captain** — marked in the setup and shown on the batting card

**Match lifecycle**
- 💾 **Survives a reload** — match state is persisted to `localStorage`, so a dead battery or an accidental refresh mid-over does not lose the match
- 🏆 **Match history** — finished matches are saved locally and can be reopened
- 📥 **PDF scorecard** — a real generated document (jsPDF + AutoTable), not a screenshot
- ✅ **Setup validation** — team names must contain letters and no special characters; each side needs at least 3 players, so a side always has more than one wicket to lose

**Interface**
- 🎨 **Six themes** — the high-contrast **Daylight** default plus 5 curated darks
- 📱 **Mobile-first** — designed for one-handed use courtside; pinch-zoom is not blocked
- 🚫 **Zero ads, no accounts, no backend** — the entire reason this exists
- ♿ **Reduced-motion aware** — the coin cross-fades instead of spinning

## 🪙 The Toss

The app used to ask you to *declare* who won the toss. Now it performs one.

1. Pick which side calls it.
2. They call **heads** or **tails**.
3. Tap **FLIP** — a 3D CSS coin spins and lands.
4. The **winner** elects to bat or bowl.

Details that matter:

- **Fairness** — the result comes from `crypto.getRandomValues()`, not `Math.random()`.
- **Decided before it spins** — the outcome is computed and stored first, and the animation is a *reveal* of an already-fixed value. There is no "refresh to re-roll", and reduced-motion is a trivial branch rather than a separate code path.
- **The winner is derived, never asked for** — `tossCall === tossResult ? tossCaller : theOtherSide`.
- **Manual override** — flipped your own coin in real life? Record it directly; it is stored with `tossMethod: 'manual'`.
- **It is remembered** — the toss appears on the scoreboard, the summary, the saved history entry and the PDF.

## 🎨 Theming & Accessibility

The active theme is projected onto `:root` as CSS custom properties, which is what lets Tailwind utilities and shadcn/ui components reach the theme colours at all. Tokens are mapped onto shadcn's variable names, with two collisions worth knowing about if you touch the theme code:

| App token | shadcn variable | Note |
|---|---|---|
| `accent` | `--primary`, `--ring` | **not** `--accent` |
| `surface` | `--secondary`, `--muted`, `--accent` | shadcn's `--accent` is a subtle *hover background* |
| `muted` | `--muted-foreground` | app `muted` is *text*; shadcn's `--muted` is a *background* |

Contrast was measured rather than eyeballed. `muted` text was failing WCAG AA in all five dark themes and was re-derived; a separate `input` token was added for control outlines because `border` sits at 1.3–1.6:1 and is only fit for decorative rules. The `yellow` token is fill-only — it is never used as a text colour.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vitejs.dev/) |
| Routing | [React Router DOM 7](https://reactrouter.com/) |
| State Management | [Zustand 5](https://github.com/pmndrs/zustand) with `persist` |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`, no config file) |
| Components | [shadcn/ui](https://ui.shadcn.com/) on [Radix UI](https://www.radix-ui.com/) + [CVA](https://cva.style/) |
| Animation | [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) |
| Icons | [Lucide React](https://lucide.dev/) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| Linting | [ESLint 10](https://eslint.org/) with React Hooks & React Refresh plugins |
| Fonts | [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (figures) + [Archivo](https://fonts.google.com/specimen/Archivo) (display) |
| Hosting / Deployment | [Vercel](https://vercel.com) |

No backend — CricHub is a fully client-side single-page app. Match state lives in `localStorage` under `crichub-match-v2` and the chosen theme under `crichub-theme`.

## 📂 Project Structure

```
Gully-cricket/
├── public/                   # Static assets (cricket.svg, etc.)
├── src/
│   ├── components/
│   │   ├── MatchSetup.jsx    # 3-step wizard: info → players → toss
│   │   ├── TossCoin.jsx      # The coin flip, and the manual override
│   │   ├── Scoreboard.jsx    # Score, run rates, over-by-over strip
│   │   ├── ScoreButtons.jsx  # The scoring keypad
│   │   ├── BatsmanStats.jsx  # Batting card
│   │   ├── BowlerStats.jsx   # Bowling card
│   │   ├── BreakTimer.jsx    # Timeout / drinks break
│   │   └── ui/               # shadcn/ui primitives
│   ├── pages/                # Home, Match, Summary, MatchHistory, About, Contact
│   ├── store/
│   │   ├── useMatchStore.js  # Scoring engine, persistence, undo stack
│   │   └── useThemeStore.js  # 6 themes + the :root CSS-variable bridge
│   ├── utils/
│   │   ├── calculations.js   # Pure cricket math (rates, overs, results, toss text)
│   │   └── pdf.js            # Scorecard PDF generation
│   ├── lib/utils.js          # cn() — clsx + tailwind-merge
│   ├── index.css             # Theme tokens, @theme scale, component classes
│   └── main.jsx              # App entry point, mounted to #root
├── index.html                # Vite HTML entry
├── components.json           # shadcn/ui config (JSX, not TSX)
├── jsconfig.json             # `@/*` path alias for the editor
├── vite.config.js            # Vite config (Tailwind plugin + `@` alias)
├── eslint.config.js
├── package.json
└── package-lock.json
```

> **Note on shadcn/ui:** it was installed by hand (`components.json`, `jsconfig.json`, `cn()`, and the Vite alias) rather than with `npx shadcn init`, because `init` instructs you to replace the entire contents of `src/index.css` — which would delete the theme tokens and the shared component classes the app depends on. `npx shadcn@latest add <component>` works normally.

## 🚀 Getting Started

CricHub is a standard Vite + React project — no environment variables or external API keys are required to run it.

### 1. Clone the repository

```bash
git clone https://github.com/flexin25/Gully-cricket.git
```

```bash
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

- [x] Add persistent match history (local storage)
- [x] Persist an in-progress match across a reload
- [x] Replace the screenshot scorecard with a real generated PDF
- [x] Make the app perform the toss instead of asking who won it
- [x] A light, high-contrast theme for playing in sunlight
- [ ] Finish converting the match-flow screens to Tailwind + shadcn/ui
- [ ] Clean up and unify the "scratch" and "vibe coded" halves of the codebase into one consistent style
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
