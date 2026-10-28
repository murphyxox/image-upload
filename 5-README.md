# Morrow Market

A responsive, original-brand storefront concept made as a front-end portfolio project. Morrow Market is an independent fictional concept store and is **not affiliated with Amazon or any other marketplace**.

## Run locally

No build step, package manager, backend, or API key is required. Open `index.html` in a browser, or serve the folder locally with Python:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploy with GitHub + Vercel

1. Create a GitHub repository and upload the contents of this folder (keep `index.html` at the repository root).
2. In Vercel, choose **Add New → Project**, import that GitHub repository, and leave the Framework Preset as **Other**.
3. Leave the build command and output directory blank; Vercel can serve this plain static site directly from the root.
4. Deploy. Future pushes to the connected branch will trigger new deployments.

There is no environment configuration. The project intentionally contains only static site files and image assets.

## What’s included

- Responsive editorial storefront, product cards, category filters, live search and price sorting.
- Product quick-view dialog, favorites, demo cart with quantity controls, local storage persistence, and shipping-threshold feedback.
- Newsletter demo interaction and accessible mobile navigation.
- Original generated product photography in `assets/`.

The checkout and newsletter are front-end demos only. They do not submit data, collect payment, or connect to a backend. Cart contents stay in the current browser via `localStorage`.

## Project files

```text
index.html
styles.css
script.js
favicon.svg
assets/web/
  hero-interior.jpg
  headphones.jpg
  lamp.jpg
  coffee-maker.jpg
  tote.jpg
```
