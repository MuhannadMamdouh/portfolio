# HONDA Portfolio

A React + TypeScript + Vite creative portfolio for Muhannad Mamdouh — Video Editor & Telecommunications Engineer.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The dashboard is available at `/admin`.

## Included features

- HONDA branding and editable profile, hero, about, email, and accent settings.
- Dashboard project management, editable categories, draft/published controls, and featured projects.
- Project format selector: Landscape / Long Video (16:9) or Vertical Reel / Short (9:16).
- YouTube videos open in an embedded modal on the portfolio rather than navigating away to YouTube. A video may still be unavailable to embed if its owner disables embedding or restricts playback.
- Custom SVG cursor dashboard with SVG upload, sanitization, live preview, path selection, editable path geometry (`d`), fill, stroke, stroke width, opacity, reset controls, hotspot settings, enable/disable, and SVG export.
- Custom cursor is disabled on touch-only devices and is not applied to the dashboard.

## Important storage note

This starter uses browser `localStorage`. Projects and settings persist in the current browser profile only; they are not shared between browsers, devices, or visitors. Before using this as a production multi-user CMS, add an authenticated backend and suitable database/storage access policies.

SVG uploads are limited to 250 KB. SVG markup is sanitized before preview and use; unsupported elements and external references are removed for safety.
