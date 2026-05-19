# Galaxy Toyota Trip Calculator

A premium, mobile-first **Progressive Web App** built for company trips — track group contributions, split expenses, and view live analytics. Designed to feel like a native iOS/Android app, with offline support, dark mode, and an installable home-screen experience.

> **Default passcode:** `1234`

---

## ✨ Features

### Core
- 🔐 **Passcode login** — simple 4-digit lock, locally stored
- 📊 **Live dashboard** — animated balance, collected, spent, per-person stats
- 💳 **QR payment collection** — display a UPI QR code, upload your own, log contributions in real time
- 🧾 **Expense management** — six categories (Food, Fuel, Hotel, Toll Tax, Emergency, Misc) with icons, search, and filters
- 📈 **Analytics** — donut chart by category, 7-day expense trend, top contributors ranking
- 👥 **Per-person split** — automatic share calculation across all members
- 📄 **PDF export** — one-tap professional trip summary report
- 💾 **JSON backup & restore** — never lose your data

### UI / UX
- 📱 **Mobile-first** — locked to a phone-sized container, touch-optimised everywhere
- 🌗 **Dark / Light mode** — system-aware, persisted
- 🎨 **Glassmorphism + premium gradients** — Toyota-inspired red + galaxy navy
- 🧭 **Sticky bottom navigation** — 5 tabs with animated active indicator
- ➕ **Floating Action Buttons** for instant add
- ✨ **Framer Motion micro-interactions** — page transitions, staggered cards, count-up numbers
- 🔄 **Pull-to-refresh** on the dashboard
- 🔔 **Toast notifications** for every action
- ❓ **Confirmation modals** for destructive actions

### PWA
- 📲 **Installable** on iOS, Android, and desktop
- ⚡ **Offline-first** via service worker + cache-first strategy
- 💽 **Local persistence** via `localStorage` (zustand persist middleware)
- 🎯 Custom splash, theme color, app shortcuts

---

## 🛠 Tech Stack

| Layer        | Technology |
|--------------|------------|
| Framework    | **Next.js 14** (App Router) |
| Language     | **TypeScript** |
| Styling      | **Tailwind CSS** + custom design tokens |
| UI Primitives | **Radix UI** (shadcn-style) |
| Animation    | **Framer Motion** |
| State        | **Zustand** + persist middleware |
| Charts       | **Recharts** |
| QR codes     | `qrcode.react` |
| PDF export   | `jspdf` + `jspdf-autotable` |
| Notifications | `react-hot-toast` |
| Icons        | `lucide-react` |
| Theme        | `next-themes` |
| PWA          | Native service worker + `manifest.json` |

---

## 📂 Folder Structure

```
galaxy-toyota-trip-calculator/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── favicon.svg
│   └── icons/
│       └── icon.svg            # Base monogram (add PNGs for full install)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout + fonts + viewport
│   │   ├── providers.tsx       # Theme + Toaster + SW registration
│   │   ├── globals.css         # Tailwind layers + design tokens
│   │   ├── page.tsx            # 🔐 Passcode login screen
│   │   ├── dashboard/page.tsx  # 🏠 Home dashboard
│   │   ├── collection/page.tsx # 💳 QR + add contribution
│   │   ├── expense/page.tsx    # 🧾 Expense list + add
│   │   ├── analytics/page.tsx  # 📈 Charts + insights
│   │   └── settings/page.tsx   # ⚙️ Title / passcode / backup / PDF
│   ├── components/
│   │   ├── ui/                 # Button, Input, Dialog, Select, etc.
│   │   ├── layout/             # AppHeader, BottomNav, FAB, AuthGuard, etc.
│   │   ├── cards/              # BalanceCard, ContributionCard, ExpenseCard, QRDisplay
│   │   └── charts/             # PieChart, DailyChart, TopContributors
│   ├── store/
│   │   └── useTripStore.ts     # Zustand store + sample data
│   ├── hooks/
│   │   ├── useCountUp.ts
│   │   └── useMounted.ts
│   ├── lib/
│   │   └── utils.ts            # formatCurrency, formatDate, downloadJSON, etc.
│   └── types/
│       └── index.ts            # ExpenseCategory, Contribution, Expense types
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── postcss.config.js
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js 18.17+** (or 20.x recommended)
- **npm** (or `pnpm` / `yarn`)

### 2. Install dependencies
```bash
npm install
```

### 3. Run in development
```bash
npm run dev
```
Open **http://localhost:3000** in your browser. On mobile, open in your phone's browser on the same network and use the **default passcode `1234`** to enter.

### 4. Build for production
```bash
npm run build
npm start
```

> 💡 The service worker only registers in **production**, so PWA install + offline support only work after `npm run build`.

---

## ☁️ Deploy to Vercel

This app is fully optimised for **Vercel** — zero configuration needed.

### Option A — One-click (recommended)
1. Push this project to a **GitHub / GitLab / Bitbucket** repository.
2. Go to **[vercel.com/new](https://vercel.com/new)** and **Import** the repository.
3. Vercel auto-detects Next.js. Leave everything default and click **Deploy**.
4. Done — your app is live on `https://<your-project>.vercel.app`.

### Option B — Vercel CLI
```bash
npm install -g vercel
vercel
# follow the prompts, then for production:
vercel --prod
```

### Environment variables
**None required.** Everything is local-first. If you later add APIs, define them in Vercel's **Project Settings → Environment Variables**.

### Custom domain
In Vercel dashboard → your project → **Settings → Domains** → add your domain (e.g. `trip.galaxytoyota.com`).

---

## 📲 Install as a PWA

### iOS (Safari)
1. Open the deployed URL in **Safari**.
2. Tap **Share** → **Add to Home Screen**.
3. Launch from the new icon — it runs full-screen, no browser chrome.

### Android (Chrome / Edge)
1. Open the URL in Chrome.
2. Tap the **⋮ menu** → **Install app** (or **Add to Home Screen**).
3. Launch it like a native app.

### Desktop (Chrome / Edge)
Look for the **install ⊕ icon** in the address bar → click → install.

> 💡 For the richest install experience, add PNG icons (72, 96, 128, 144, 152, 192, 384, 512 px) to `/public/icons/`. The manifest already references them.

---

## 🎨 Customisation

| What | Where |
|------|-------|
| Brand colors / gradients | `tailwind.config.ts` → `theme.extend.colors` |
| Trip title default | `src/store/useTripStore.ts` → `INITIAL_SETTINGS` |
| Default passcode | `src/store/useTripStore.ts` → `passcode: '1234'` |
| UPI ID in QR | `src/components/cards/QRDisplay.tsx` → `pa=galaxytoyota@upi` |
| Expense categories | `src/types/index.ts` + `src/components/cards/ExpenseCard.tsx` (`CATEGORY_META`) |
| Sample data | `src/store/useTripStore.ts` → `SAMPLE_CONTRIBUTIONS` / `SAMPLE_EXPENSES` |

---

## 🧪 Sample Data

The app ships with realistic dummy data so you can demo immediately:
- **6 contributors** at ₹5,000 each (Rohit, Priya, Arjun, Sneha, Vikram, Anjali)
- **5 expenses** across Food, Fuel, Hotel, Toll Tax, and Misc categories

Wipe it any time from **Settings → Reset trip data**.

---

## 📜 Available Scripts

```bash
npm run dev      # Start dev server on :3000
npm run build    # Production build
npm start        # Run production build
npm run lint     # Lint the codebase
```

---

## 🔒 Privacy

**100% local.** No analytics, no tracking, no backend. All data lives in your browser's `localStorage`. Export a JSON backup anytime from **Settings**.

---

## 📄 License

MIT — use it, fork it, ship it.

---

**Built for the road. Designed for the journey.** 🚗💨
