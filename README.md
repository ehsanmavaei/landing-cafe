# Bean & Bloom Café — scroll-sequence landing page

A config-driven Next.js (App Router) landing page with a pinned canvas hero that scrubs through a WebP image sequence on scroll. Built for **Vercel** deploy out of the box.

## Stack

- Next.js 15, TypeScript, Tailwind CSS v4
- GSAP + ScrollTrigger (scroll-driven frames)
- Native scroll + ScrollTrigger (no smooth-scroll library)
- All café content lives in **`src/config/cafe.ts`**

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Portrait frames live in `public/frames-mobile/`; optional landscape set in `public/frames-desktop/`.

## Swap the hero video for your own sequence

1. Put your source video in the project root (e.g. `input.mp4`).
2. Install [ffmpeg](https://ffmpeg.org/) if needed.
3. Run:

```bash
chmod +x scripts/make-frames.sh
./scripts/make-frames.sh input.mp4
```

This exports **24 fps**, **1280px wide** WebP frames:

`public/frames-mobile/f_0001.webp` … `f_0240.webp` (portrait). Add a matching set under `public/frames-desktop/` for landscape desktops (cover-fit); until then, portrait frames are letterboxed with a blurred backdrop.

Regenerate placeholders only (no ffmpeg):

```bash
node scripts/generate-placeholders.mjs
```

## Customize the café

Edit **`src/config/cafe.ts`** only:

- Brand name, tagline, colors, fonts (labels; Google fonts wired in `layout.tsx`)
- `frames.mobile` / `frames.desktop` (folder, frameCount, aspectRatio), extension, `scrollLengthVh`, scrub
- Story steps (text + scroll progress windows)
- Menu, about, hours, address, phone, WhatsApp, Instagram, map embed
- Gallery URLs and alt text
- SEO title, description, OG image path, `siteUrl`

No café copy should live in components—import `cafeConfig` or pass `config` props derived from it.

## Behavior notes

- **Loading screen**: preloads frames and shows progress %; main UI appears when ready.
- **Mobile**: loads every 2nd frame to save bandwidth; scroll still snaps to whole logical frames.
- **Reduced motion**: last frame only, no pin/scrub (respects `prefers-reduced-motion`).
- **Canvas**: portrait vs landscape frame sets by viewport aspect ratio; cover-fit or letterbox + blurred backdrop; `devicePixelRatio` capped at 1.5.

## Deploy to Vercel

1. Push this repo to GitHub (or import the folder).
2. [Import the project in Vercel](https://vercel.com/new); framework preset **Next.js**.
3. Set **`NEXT_PUBLIC`** nothing required—update `seo.siteUrl` in `cafe.ts` to your production URL (or set it after first deploy).
4. Deploy. Add your full `public/frames` set to the repo or use Git LFS for large assets.

Optional: add `public/og.jpg` (1200×630) matching `seo.ogImage` in config.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `./scripts/make-frames.sh` | Extract WebP sequence from video |

## License

Private / your café—use and adapt freely.
