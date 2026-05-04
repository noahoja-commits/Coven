# Coven

A social app for the alt/goth nightlife community. Built with React + Vite + Tailwind.

---

## 🚀 Get it running locally (5 min)

You need **Node.js** installed. If you don't have it, grab it: https://nodejs.org (download the LTS version, click through the installer).

Then in your terminal:

```bash
cd coven
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173). That's your app.

---

## 🌐 Put it on the internet (free, ~3 min)

### Easiest: Vercel drag-and-drop

1. Run `npm run build` in the project folder. This creates a `dist/` folder.
2. Go to https://vercel.com and sign up (free, use GitHub or email).
3. Click **Add New → Project → Deploy** → drag the `dist/` folder onto the page.
4. Done. You get a URL like `coven-xyz.vercel.app`.

### Cleaner: GitHub + Vercel auto-deploy

1. Make a free GitHub account at https://github.com if you don't have one.
2. Create a new empty repo called `coven`.
3. In your terminal:
   ```bash
   cd coven
   git init
   git add .
   git commit -m "first"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/coven.git
   git push -u origin main
   ```
4. Go to vercel.com → **Add New → Project** → pick your `coven` repo → click Deploy.
5. Now every time you `git push`, Vercel rebuilds and redeploys. Free forever for projects like this.

### Alternatives that work the same way

- **Netlify** (netlify.com) — same drag-and-drop or GitHub flow
- **Cloudflare Pages** (pages.cloudflare.com) — same idea, fastest CDN
- **GitHub Pages** — free but more setup, skip unless you already use GitHub heavily

---

## 📱 When you're ready to make it a real app (later)

The whole codebase here will move with you. Two paths:

- **Capacitor** (capacitorjs.com) — wraps this exact React code into a real iOS/Android app you can submit to the App Store. ~1 hour of setup the first time.
- **PWA** — add a manifest file and people can "Add to Home Screen" from their browser and it behaves like an app, no app store needed. ~15 min.

Don't do either until you've got friends actually using the web version. Test the vibe first.

---

## 🗂 What's in here

```
coven/
├── src/
│   ├── App.jsx       ← the entire app, edit this
│   ├── main.jsx      ← React entry point, leave alone
│   └── index.css     ← global styles, Tailwind imports
├── public/
│   └── favicon.svg   ← the little C in the browser tab
├── index.html        ← the HTML shell
├── package.json      ← dependencies
├── vite.config.js    ← build config
├── tailwind.config.js
└── postcss.config.js
```

Edit `src/App.jsx` to change anything. Save, the browser refreshes automatically.

---

## ✏️ Common edits

**Change the app name** → search `Coven` in `src/App.jsx`, replace.

**Add/remove communities** → find the `COMMUNITIES` array near the top of `App.jsx`.

**Change colors** → search for the hex codes (`#8B0000` is the oxblood red, `#7B2CBF` is the violet). Find/replace globally.

**Add a new screen** → copy any existing screen function (like `EventsScreen`), give it a new name, then add a new tab in the `BottomNav` items array and a case in the `App` switch statement.
