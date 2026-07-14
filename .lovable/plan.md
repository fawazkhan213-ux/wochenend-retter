
# How to publish your project as an "app"

Your project is a **web app** built with React. When you press Publish in Lovable, it always gives you a URL — that's how the web works. To make it *feel* or *behave* like an app, you have three options. Here's what each one is, what it costs, and how much work it is.

---

## Option 1 — Installable web app (PWA)

**What it is:** Same web app, but users tap "Add to Home Screen" on their phone. It gets an icon, opens fullscreen (no browser bar), and looks/feels native. This is what Twitter, Starbucks, and Uber use on mobile web.

**Pros**
- Free. No app store. No review.
- One codebase, works on iPhone, Android, desktop.
- Updates instantly when you republish — no waiting.
- Ready in ~5 minutes of work in Lovable.

**Cons**
- Users have to know to tap "Add to Home Screen" (iPhone hides this in the Share menu).
- No listing in the App Store / Play Store.
- Limited access to some native features (deep hardware, background push on iOS is limited).

**Steps**
1. Ask me to "make it installable as a PWA." I add a manifest + icons.
2. Click Publish in Lovable (top-right web icon).
3. (Optional) Connect a custom domain in Project Settings → Domains.
4. On your phone, open the URL → Share → "Add to Home Screen."

---

## Option 2 — Real native app in the App Store / Play Store (Capacitor)

**What it is:** We wrap your web app in a native shell (Capacitor) and submit it to Apple and Google as a real installable app.

**Pros**
- Real App Store / Play Store listing.
- Full access to native features (push, camera, biometrics, background).
- Feels 100% native.

**Cons — this is a real project, not a click:**
- **Apple Developer account: $99/year.** Google Play: $25 one-time.
- **You need a Mac with Xcode** to build and submit the iOS app. There is no way around this — Apple requires it.
- Store review takes **1–7 days**, and Apple may reject and ask for changes.
- Every update goes through review again.
- Export code from Lovable to GitHub → clone locally → run Capacitor build commands.

**Steps (high level)**
1. In Lovable: click the **+** menu → **GitHub** → connect and push your project.
2. On your Mac: clone the repo, run `npm install`, add Capacitor (`npx cap add ios` / `npx cap add android`).
3. Buy Apple Developer + Google Play accounts.
4. Open in Xcode (iOS) / Android Studio, set app name, icon, bundle ID.
5. Build, upload to App Store Connect / Play Console, fill listing (screenshots, description, privacy policy).
6. Submit for review, wait, publish.

Realistically: **1–2 weekends of work** for a first-time submission, plus ongoing account fees.

---

## Option 3 — Custom domain only (stay a web app)

**What it is:** Keep it as a website but publish it under your own domain like `sonntagsplan.de` instead of `something.lovable.app`. No install, just a nicer URL.

**Pros**
- ~10 minutes of work.
- Looks professional.
- Can be combined with Option 1 (PWA on your own domain — best of both).

**Cons**
- Not an "app" — still opens in a browser tab unless combined with PWA.
- Domain costs ~$10–15/year.

**Steps**
1. Click Publish in Lovable.
2. Project Settings → Project → Domains → **Buy new domain** (or connect one you already own).
3. Follow the DNS setup (Lovable walks you through it).

---

## My honest recommendation for a first project

Start with **Option 1 (PWA)** — optionally on your own domain (Option 3). You'll have a real "app on your phone" today, for free, no Mac, no review. If people actually use it and you outgrow PWA, *then* invest the time and money in Option 2 to get on the App Store.

**Tell me which option you want** (or "PWA + custom domain") and I'll set it up.
