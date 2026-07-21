# Agent Guide - Butcher's Board

This file gives AI agents (Cursor, Claude, etc.) the full context needed to work effectively in this codebase. Read it before making any changes.

---

## What This Project Is

A reusable starter for **Craft CMS 5** marketing sites. Content is authored in the Craft control panel and rendered server-side via **Twig** templates. Front-end assets are compiled by **Vite**. Styling uses **Tailwind CSS v4** (utility-first) plus co-located feature CSS files imported from `main.css`. Interactivity is handled with **small ES-module classes** (see `src/scripts/App.js` and `src/scripts/modules/`), backed by libraries such as **GSAP**, **Swup**, **focus-trap**, and others listed in `package.json`. The local development environment is managed by **DDEV**.

This is the Butcher's Board website, built on a Craft CMS 5 starter. It ships the foundations (DDEV + Vite + Tailwind 4 + Swup + Imager X + the `asset-media` partial). The site is intentionally small: a single homepage (`index.twig`) plus a handful of misc pages (Privacy Policy, Terms, etc.) rendered from a simple `pages` section — there is no Page Builder / Matrix block system.

The site is maintained by a team — code must be readable, consistent, and well-structured for people who did not write the original code.

---

## Repository Layout

```
.
|- app/                          # Craft application root (composer_root for DDEV)
|  |- composer.json              # PHP dependencies live here (not repo root)
|  |- config/                    # Craft config files (general.php, routes.php, imager-x.php, ...)
|  |  `- project/                # Craft project config (created on first `craft install`)
|  |- modules/                   # Custom Craft modules (PHP)
|  |  `- SiteModule.php          # CKEditor <i>->"<em>" + auto-postDate on nested entries
|  |- templates/                 # Twig templates
|  |  |- _layout.twig            # Primary site layout (`{% extends '_layout' %}`)
|  |  |- index.twig              # Homepage template (routed via `app/config/routes.php`)
|  |  |- _macros/                # Twig macros
|  |  |- _partials/              # Layout chrome, generated + authored partials
|  |  |- _svgs/                  # Inline SVG snippets
|  |  |- pages/                  # Misc-page entry template (`_entry.twig`) for the `pages` section
|  |  |- 404.twig, offline.twig
|  `- web/                       # Public webroot (docroot; Vite emits to web/dist/)
|- src/
|  |- scripts/
|  |  |- main.js                 # Bootstraps `App`, registers DOM modules, wires up Swup
|  |  |- App.js                  # Finds `[data-module]` nodes and initializes module classes
|  |  |- modules/                # Interactive DOM modules (pizza-tabs)
|  |  `- util/                   # Helpers (MediaQueries, FooterScrollAnimation)
|  |- styles/
|  |  |- main.css                # Tailwind + @import chain (feature *.css siblings)
|  |  |- theme.css               # @theme {} tokens
|  |  `- *.css                   # Typography, footer, buttons, ...
|  |- entry.html                 # Vite/Rollup JS entry glue for vite-plugin-craftcms
|  `- static/                    # Fonts, icons, manifests — surfaced via /static/ + vite.url()
|- .cursor/
|  `- rules.mdc                  # Cursor IDE rules
|- vite.config.js
|- package.json
`- .ddev/config.yaml             # composer_root: app, docroot: app/web
```

---

## Key Technologies

| Layer           | Tool                          | Notes                                              |
| --------------- | ----------------------------- | -------------------------------------------------- |
| CMS             | Craft CMS 5                   | PHP, content modelling via control panel           |
| Dev environment | DDEV                          | All CLI commands run via `ddev`                    |
| Templates       | Twig 3                        | Server-rendered, lives in `app/templates/`         |
| Build           | Vite + `vite-plugin-craftcms` | Single JS + CSS entry point                        |
| CSS             | Tailwind CSS 4                | Utility-first, tokens in `@theme {}`, no JS config |
| JS              | ES modules + `App`            | Orchestrates `data-module` bundles; see `App.js`   |
| SPA transitions | Swup + plugins                | Head, Scripts, A11y plugins (see `main.js`)        |
| Linting         | ESLint + Prettier             | Run before committing                              |

### Craft Plugins Shipped

| Plugin                                                                       | Purpose                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------ |
| [Servd Assets and Helpers](https://plugins.craftcms.com/servd-asset-storage) | Asset storage and CDN delivery via Servd hosting |
| [CKEditor](https://plugins.craftcms.com/ckeditor)                            | Rich text editing for content fields             |
| [SEOMatic](https://plugins.craftcms.com/seomatic)                            | SEO meta, sitemaps, and structured data          |
| [Typogrify](https://plugins.craftcms.com/typogrify)                          | Smart typography filters for Twig output         |
| [Imager X](https://plugins.craftcms.com/imager-x)                            | Image transforms, srcsets, and optimisation      |
| [Expanded Singles](https://plugins.craftcms.com/expanded-singles)            | Treats singleton sections like structure entries in the CP |

---

## Local Development with DDEV

This project uses [DDEV](https://ddev.com/) for local development. All PHP and Node commands must be run through DDEV — do not run `composer` or `npm` directly outside the containers.

Composer and Craft live under **`app/`** (see `.ddev/config.yaml`: `composer_root: app`, `docroot: app/web`). Repo root holds Node/Vite tooling only.

### First-time setup

```bash
ddev start
ddev composer install
ddev npm install

# Bootstrap a fresh Craft install (creates the admin account, security key, app id, etc.).
# This is required because the starter ships without a project.yaml.
ddev craft install

ddev npm run start
ddev launch
```

After `craft install` completes, build the minimal CMS model in the control panel (Settings -> Sections, Fields, etc.):

- One `home` Single section for the homepage (rendered by `app/templates/index.twig`, routed via `app/config/routes.php`).
- One `pages` section (Channel or Structure) for misc pages — About, Privacy Policy, Terms, etc. — rendered by `app/templates/pages/_entry.twig`. Give its entry type a `bodyContent` CKEditor field (or whatever fields the page needs).
- One Asset Volume named `media` (use a local FS for development; switch to Servd when deploying — see "Servd swap" below).

Once the model is in place, commit `app/config/project/` so the next teammate can `ddev craft project-config/apply` instead of repeating these clicks.

### Daily workflow

```bash
ddev start
ddev npm run start
ddev launch

# Production build
ddev npm run build

# Lint JS
ddev npm run lint

# Clear Craft caches
ddev craft clear-caches/all
```

### Useful DDEV reference

- `.ddev/config.yaml` contains the project configuration — do not edit it without understanding the impact.
- `ddev describe` shows the project URL, database credentials, and service status.
- `ddev ssh` drops you into the web container shell for direct PHP access.
- `ddev import-db --file=backup.sql.gz` imports a database dump.
- DDEV injects DB credentials into the environment automatically on `ddev start` — do not hardcode database values in `.env` or config files.

---

## Spinning up a new project from this starter

1. Copy or clone this repo into a new directory.
2. Update `name` in `.ddev/config.yaml` and `package.json`. Update `description`, etc.
3. Update `PRIMARY_SITE_URL` in `app/.env.example` (and your local `.env`).
4. Run the first-time setup above.
5. Replace the brand tokens in `src/styles/theme.css` (`--color-brand-*`, `--color-ink-*`, etc.).
6. Wire up your real font in `src/styles/_webfonts.css` and update `--font-sans` in `theme.css`. Add matching `<link rel="preload">` tags in `_layout.twig` for above-the-fold weights.
7. Drop in your logo (replace `<header>` text + favicon at `src/static/favicon.svg`).
8. Build out `index.twig` and add misc pages to the `pages` section as needed. Each new interactive piece gets a JS module in `src/scripts/modules/<handle>.js` registered in `main.js`.

### Servd swap (production)

The starter is host-agnostic by default. To target Servd:

- Fill in `SERVD_PROJECT_SLUG`, `SERVD_SECURITY_KEY`, and the `SERVD_SMTP_*` values in `.env`.
- In the CP, switch the `media` asset volume's filesystem to a Servd FS.
- In `app/config/imager-x.php`, set `'transformer' => 'servd'`.

---

## Twig Template Conventions

- **`_layout.twig`** defines the global HTML structure and blocks (`{% block content %}`). Templates extend it with `{% extends '_layout' %}` (no `_layouts/` directory in this codebase).
- **`index.twig`** is the homepage template, routed via `app/config/routes.php` (`'' => ['template' => 'index']`). It looks up the `home` Single entry itself (`craft.entries().section('home').one()`) and falls back to a placeholder if it doesn't exist yet.
- **`pages/_entry.twig`** renders every misc page (About, Privacy Policy, Terms, etc.) in the `pages` section. There is no per-entry-type dispatch — keep it as one template unless pages genuinely diverge in structure.
- **`_partials/`**: `vite.twig` is **generated** by `vite-plugin-craftcms` — do not hand-edit it. Other files (`header`, `footer`, etc.) are normal authored partials, edit as needed.
- **Macros** in `_macros/` centralize repeatable markup (text helpers, etc.).
- **Matrix-like nested blocks** (if you add any in the future) use `{% switch block.type.handle %}` when iterating a Craft Matrix field, dispatching to a partial with `{% include ... only %}`.

### Common Craft patterns

```twig
{# Fetch entries safely #}
{% set items = craft.entries().section('news').limit(6).orderBy('postDate desc').all() %}

{# Guard against empty fields #}
{{ entry.summary|default(null) }}

{# Matrix / repeatable blocks keyed by handle (switch when partials diverge heavily) #}
{% for block in entry.contentBlocks.all() %}
  {% switch block.type.handle %}
    {% case 'richText' %}
      {% include '_partials/blocks/richText' ignore missing with { block: block } only %}
    {% case 'myBlock' %}
      {% include '_partials/blocks/myBlock' ignore missing with { block: block } only %}
  {% endswitch %}
{% endfor %}
```

### Plugin-specific patterns

**Images — Imager X + `_partials/asset-media.twig`**

Always render images and videos through `_partials/asset-media.twig`, which wraps Imager X transforms with sensible defaults (lazysizes, srcset, mobile-image override, video support, etc.):

```twig
{% include '_partials/asset-media' with {
  asset: entry.image.one(),
  options: {
    sizes: '100vw',
    defaultWidth: 1920,
    widths: [640, 960, 1280, 1600, 1920],
    mobileWidths: [480, 640, 768],
  },
} only %}
```

For one-off transforms outside the partial, use Imager X directly (do not use Craft's native `getUrl()` with transform parameters).

**Rich text — CKEditor**

CKEditor fields return HTML. Always pipe through `|raw` and Typogrify:

```twig
{{ entry.bodyContent|typogrify|raw }}
```

When CKEditor content needs to live inside a heading or other inline-only context, use the `text.inline()` macro (`_macros/text.twig`) which strips block-level wrappers while preserving inline formatting.

**SEO — SEOMatic**

`_layout.twig` includes `{% hook 'seomaticRender' %}` inside `<head>`. SEOMatic injects `<title>`, meta tags, Open Graph, JSON-LD, etc. — do not write those by hand.

**Assets — Servd (production)**

When the project is deployed to Servd, asset URLs are managed by Servd. Always retrieve URLs via `asset.url` or Imager X transforms — never construct asset paths manually.

---

## JavaScript: `App` and DOM modules

`src/scripts/main.js` instantiates **`App`** with an `InitialModules` map keyed by **`data-module` attribute values**:

```js
import App from './App';
import PizzaTabs from './modules/pizza-tabs.js';

const InitialModules = {
  'pizza-tabs': PizzaTabs,
};
```

**How modules register**

1. Mark a root DOM node with `[data-module="pizza-tabs"]` (or another registered name).
2. Export a **`default` class constructor** from `src/scripts/modules/<name>.js`. `App` passes the element (+ optional parsed JSON options) into `new Module(element, options)`.
3. Optional **`data-module-options`** on the element must be JSON; parse errors are logged to the console.

**Dynamic modules**

Names listed in `DynamicModules` lazy-import `./modules/${name}.js` at runtime. Empty by default; reserve for splitting rarely needed widgets.

**Other initializers**

`main.js` also constructs `FooterScrollAnimation` (the fixed-footer "garage door" reveal — it keeps `--footer-reveal-height` in sync with the footer's rendered height, see `src/styles/footer.css`) and global video / reduced-motion handling outside `App`. They are persistent (not re-run on Swup navigations); `footerScrollAnimation.setup()` re-measures the footer on each `page:view`.

**Page navigations (Swup)**

The starter uses Swup with three plugins: `SwupScriptsPlugin`, `SwupHeadPlugin`, `SwupA11yPlugin`. Swup swaps `#main-content`. On every navigation:

1. `content:replace` resets `window.scrollTo(0, 0)` and kills all ScrollTrigger instances.
2. `page:view` (handled by `initPageContent`) re-inits modules in the swapped containers and recreates the footer ScrollTrigger.

If you add globally persistent modules or animations (e.g. site header dropdown state), audit them alongside this lifecycle.

---

## Tailwind 4 Conventions

The CSS entry point is `src/styles/main.css`. It imports Tailwind **and** layered feature sheets. Match any bespoke class hooks (e.g. `.btn`) with a sibling `*.css` file listed in the import chain.

```css
@import 'tailwindcss';
@import './theme.css';
@import './_webfonts.css';
@import './transitions.css';
@import './typography.css';
/* ...full list lives in src/styles/main.css */
```

Design tokens live in `src/styles/theme.css`:

```css
@theme {
  --color-brand-500: #4f46e5;
  --color-ink-950: #1e2a29;
  --font-sans: ui-sans-serif, system-ui, ...;
  --spacing-2xl: clamp(3.75rem, 1.7857vw + 3.3929rem, 5rem);
}
```

`@theme {}` blocks may be spread across multiple imported files — this is intentional. There is no `tailwind.config.js`; do not create one.

- Use utilities directly in Twig markup.
- Avoid `@apply` for one-off Twig patterns — factor repeated structures into Twig partials/macros instead. Minimal `@apply` in global CSS (lazysizes states, etc.) is acceptable when utilities would be noisy.
- Responsive: mobile-first (`sm:` -> `md:` -> `lg:`).
- Avoid arbitrary values (`[23px]`) — add a token to `@theme {}` instead.

---

## Vite & Asset Injection

This project uses `vite-plugin-craftcms`. Asset tags are injected via a generated partial at `app/templates/_partials/vite.twig`, which is included from `_layout.twig` (the `vite.url()` macro is also resolved from this partial).

**Before modifying anything related to asset injection:**

1. Open `vite.config.js` to understand the configured entry point (`./src/entry.html`) and plugin options.
2. Open `app/templates/_partials/vite.twig` to see how script and style tags are output. The plugin overwrites this file on every `npm run start` / `npm run build`.

Do **not** hardcode `<script>` or `<link>` tags for compiled assets. The `vite.twig` partial handles the Vite dev client in development and hashed, cache-busted URLs in production.

Static files (fonts, favicons) go in `src/static/` and are served from `/static/`. Reference them via `vite.url('/path')` so they pick up the right base URL in dev vs prod.

---

## What Agents Should Do

- **Adding a new misc page**: create the entry in the `pages` section in the control panel; `pages/_entry.twig` renders it automatically as long as it has the fields the template expects (e.g. `bodyContent`).
- **Adding interactivity**: place a `default` export in `src/scripts/modules/<handle>.js`, register it in `InitialModules` (or `DynamicModules`) inside `main.js`, and mark the Twig root with `[data-module="<handle>"]` plus optional `data-module-options` JSON (`data-module-options='{"muted":false}'`).
- **Adding a Matrix-like field** (if a page needs repeatable content): add the block types in Craft, iterate in Twig (`{% switch %}` or handle-based includes), passing each block with `{ block } only`.
- **Adding styles**: default to Tailwind utilities in the template. If a token is needed, add it to `theme.css` inside `@theme {}`. If a new token is very close (e.g., 1px difference) to an existing one, ask whether to add or reuse the existing token.
- **Adding images / video**: render through `_partials/asset-media.twig` so Imager X transforms and lazysizes wiring stay consistent.
- **Comments**: do not add descriptive block comments that narrate layout, structure, or behavior (e.g. “Site footer — black band with…”, “On desktop it is fixed behind the page…”). This especially applies when porting Figma designs — the markup and nearby CSS/JS should be self-explanatory. Prefer no comment over a summary of what the template looks like. Short comments are fine only for non-obvious constraints, gotchas, or CMS wiring that the code alone does not make clear.
- **Never**: introduce jQuery, full Vue / React SPA stacks, or ad-hoc bundlers beside Vite. Never write inline `<style>` blocks. Never hardcode asset URLs.

---

## Design Conventions and CSS Preferences

- **Layout**: for major layout styling, default to a 12-column desktop grid and 2-column mobile grid using CSS grid syntax. For smaller layouts (like navs), use flex. Intuit for other situations.
- **Spacing**: section/block spacing outside of inner content should be added as margin values. Spacing between distinct elements within a block should be added as margin values. Padding should be used as spacing when it is added inside an element (cell, button). Spacing should use the spacing utilities driven by tokens in `theme.css`. Do not add vertical spacing using grid `gap` values unless the content is an actual grid of items.
- **No "bulk sibling" spacing selectors**: do not implement stack spacing with parent arbitrary variants such as `[&>*:not(:first-child)]:mt-*`, `[&>*+*]:mt-*`, or other "every child but the first" Tailwind patterns. Each spaced element should carry its own explicit margin utilities (add Twig conditionals when blocks are optional so margins only apply when there is a preceding sibling in the authored order).

---

## Gotchas & Maintenance Notes

- Craft's template cache can mask Twig changes locally — run `ddev craft clear-caches/all` when templates seem stale.
- After a Swup navigation, ScrollTrigger instances tied to swapped DOM are killed in `content:replace`. Triggers on persistent elements (footer) must be recreated in `page:view` (see `footerScrollAnimation.setup()`).
- Tailwind 4 uses CSS-native `@theme` — there is no `tailwind.config.js`. Do not create one.
- Vanilla modules have no SPA devtools hooks; use sparing `console.warn` probes for debugging — strip before merging.
- Servd-specific configuration (FS, SMTP, transformer) should only be enabled once Servd env vars are set — leaving them on in a fresh local install will cause asset/email failures.
