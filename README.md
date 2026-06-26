# VeneHelp

VeneHelp is a static, crawler-friendly directory for missing-person reporting resources related to the Venezuela earthquake emergency.

The goal of this project is not to become a new authoritative database. Instead, it creates one public entrypoint where families, volunteers, journalists, and LLM agents can discover the main registries, forms, and reporting platforms without depending on fragmented posts or scattered links.

## What this repo includes

- A public root page that chooses a language based on browser preference
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

The initial data in this repository was compiled from user-provided research and third-party summaries. Every source should be manually reviewed before the directory is treated as production-quality.

Recommended verification workflow:

1. Confirm the URL loads and is relevant to the earthquake response.
2. Confirm whether it supports reporting, searching, or both.
3. Record whether login is required.
4. Update `last_verified_at`, `status`, and `notes`.
5. Remove stale or misleading entries.

## Build

```bash
npm run build
```

The registry and counters are hidden by default in production builds. To review them locally or in staging, enable them explicitly:

```bash
SHOW_REGISTRY=true npm run build
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

Example staging-style build with the registry visible:

```bash
SITE_URL="https://staging.example.org" SHOW_REGISTRY=true npm run build
```

## Publish on GitHub Pages

1. Push the repository to GitHub.
2. In repository settings, enable GitHub Pages.
3. Choose `Deploy from a branch`.
4. Select your default branch and the `/docs` folder.
5. In the Pages custom domain setting, use `directorioterremotovenezuela.org`.
6. Point the domain DNS to GitHub Pages and wait for certificate issuance.

## Suggested next steps

1. Verify each resource manually.
2. Add a contact/corrections channel.
3. Add a submission flow for new sources.
4. Add periodic checks for downtime and redirects.
