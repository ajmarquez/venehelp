# VeneHelp

VeneHelp is a static, crawler-friendly public directory of platforms for searching for, reporting, and marking missing people as found after the Venezuela earthquake.

The goal of this project is not to become a new authoritative database or collect reports directly. Instead, it creates one public entrypoint where families, volunteers, journalists, and LLM agents can compare the active public places where the same case may be searched, reported, or escalated through a humanitarian tracing path.

## What this repo includes

- A public root page in Spanish plus a dedicated English version
- A Spanish site at `docs/es/` and an English site at `docs/en/`
- Individual pages for each known source in both languages
- A machine-readable JSON export at `docs/data/sources.json`
- `robots.txt`, `sitemap.xml`, and `llms.txt` for discoverability
- A simple build script that regenerates the static site from one data file

## Project structure

- `data/sources.json` contains the canonical source list
- `scripts/build.mjs` generates the localized static site into `docs/`
- `docs/` is the publishable output for GitHub Pages

## Source verification

The initial data in this repository was compiled from direct site checks plus external reporting. Every source should still be manually reviewed before the directory is treated as production-quality.

Recommended verification workflow:

1. Confirm the URL loads and is relevant to missing-person search, reporting, or family tracing after the earthquake.
2. Confirm what it actually offers: public search, report intake, found or safe updates, or humanitarian family tracing.
3. Record whether login is required and whether public search is available.
4. Update `status`, `last_checked_at`, `accepts_new_reports`, `public_search`, `report_found`, and `notes`.
5. Remove stale or misleading entries.

## Build

```bash
npm run build
```

The default build target is:

```bash
https://directorioterremotovenezuela.org
```

If you need to override the final domain, build with:

```bash
SITE_URL="https://your-domain.org" npm run build
```

If you plan to publish to a GitHub Pages project URL such as `https://username.github.io/venehelp/`, also set the path prefix:

```bash
SITE_URL="https://username.github.io" SITE_PATH="/venehelp" npm run build
```

Cloudflare Web Analytics is enabled by default for `directorioterremotovenezuela.org`.

To override the token for another deployment, pass it when building:

```bash
CLOUDFLARE_ANALYTICS_TOKEN="your-token" npm run build
```

To disable the analytics snippet for a build, pass an empty token:

```bash
CLOUDFLARE_ANALYTICS_TOKEN="" npm run build
```

## Publish on GitHub Pages

1. Push the repository to GitHub.
2. In repository settings, enable GitHub Pages.
3. Choose `Deploy from a branch`.
4. Select your default branch and the `/docs` folder.
5. In the Pages custom domain setting, use `directorioterremotovenezuela.org`.
6. Point the domain DNS to GitHub Pages and wait for certificate issuance.

## Suggested next steps

1. Keep enriching source metadata so families can quickly judge trust and usefulness.
2. Add a public corrections channel for broken links or changed capabilities.
3. Add more official and humanitarian missing-person tracing resources when they are publicly relevant.
4. Add periodic checks for downtime, redirects, and changes to search or report flows.
