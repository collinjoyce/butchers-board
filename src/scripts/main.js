import 'lazysizes';

import Swup from 'swup';
import SwupHeadPlugin from '@swup/head-plugin';
import SwupA11yPlugin from '@swup/a11y-plugin';
import SwupScriptsPlugin from '@swup/scripts-plugin';
import SwupScrollPlugin from '@swup/scroll-plugin';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { MediaQueries } from './util/MediaQueries';
import FooterScrollAnimation from './util/FooterScrollAnimation';
import PizzaTabs from './modules/pizza-tabs.js';
import PizzaMedia from './modules/pizza-media.js';
import Parallax from './modules/parallax.js';
import HeadlineReveal from './modules/headline-reveal.js';
import App from './App';

gsap.registerPlugin(ScrollTrigger);

const DynamicModules = [];

const InitialModules = {
  'pizza-tabs': PizzaTabs,
  'pizza-media': PizzaMedia,
  parallax: Parallax,
  'headline-reveal': HeadlineReveal,
};

/**
 * Initialise all [data-module] elements within a given DOM scope.
 *
 * First load: scope = document.documentElement so persistent elements
 * (site header, footer) are also initialised.
 * Swup navigations: scope is restricted to the replaced containers so
 * those persistent elements are never re-initialised.
 */
function initModules(scope = document.documentElement) {
  new App({ DynamicModules, InitialModules, scope });
}

/**
 * Re-initialise page-specific content after Swup replaces the containers.
 * Called on every `page:view` event.
 *
 * GSAP defers trigger position calculation to its own ticker (the rAF after
 * create()), so st.start = 0 immediately after ScrollTrigger.create(). Calling
 * ScrollTrigger.refresh() synchronously in the same execution block as
 * initModules() forces an immediate recalculation — the correct start position
 * is written before GSAP's ticker processes the trigger for the first time.
 */
function initPageContent() {
  requestAnimationFrame(() => {
    const mainContent = document.getElementById('main-content');

    if (mainContent) initModules(mainContent);

    footerScrollAnimation.setup();

    if (MediaQueries.MOTION_QUERY.matches) {
      mainContent?.querySelectorAll('video').forEach((v) => v.pause());
    }
  });
}

// ─── First load ────────────────────────────────────────────────────────────

document.documentElement.classList.remove('no-js');

// Full-scope init: catches site-header, main content, and any modals.
initModules();

const footerScrollAnimation = new FooterScrollAnimation(
  document.getElementById('site-footer')
);
footerScrollAnimation.init();

if (MediaQueries.MOTION_QUERY.matches) {
  document.querySelectorAll('video').forEach((v) => v.pause());
}

// Reveal page content. Double-rAF lets the browser commit the initial
// opacity:0/scale:0.98 state before the transition kicks in, so the
// CSS transition plays rather than being skipped on first paint.
document.fonts.ready.then(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('is-page-loading');
    });
  });
});

// ─── Swup ──────────────────────────────────────────────────────────────────

const swup = new Swup({
  containers: ['#main-content'],
  animationSelector: '[data-swup-transition]',
  plugins: [
    new SwupScriptsPlugin({
      head: true,
      body: false,
    }),
    // persistTags keeps already-loaded stylesheets and scripts from reloading.
    new SwupHeadPlugin({
      awaitAssets: true,
      persistTags: 'style',
    }),
    // Announces navigation to screen readers via an aria-live region.
    new SwupA11yPlugin(),
    // Smooth scroll for same-page hash links (e.g. header /#about) and
    // hash targets after a Swup navigation. Section scroll-margin in
    // main.css offsets sticky chrome.
    new SwupScrollPlugin({
      animateScroll: MediaQueries.MOTION_QUERY.matches
        ? false
        : {
            betweenPages: false,
            samePage: true,
            samePageWithHash: true,
          },
    }),
  ],
});

// Only disable browser scroll restoration during Swup navigations. Setting
// it to `manual` on first paint (reload) would prevent the browser from
// restoring the previous scroll position.
swup.hooks.on('visit:start', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
});

// After the leave animation and DOM swap (content still invisible under
// `is-animating`): reset scroll and kill ALL ScrollTrigger instances.
// Killing here — while the page is invisible — ensures zero stale trigger
// state by the time new modules initialize during `page:view`. Triggers
// tied to persistent elements (footer) are recreated by footerScrollAnimation.setup().
swup.hooks.on('content:replace', () => {
  window.scrollTo(0, 0);
  ScrollTrigger.getAll().forEach((t) => t.kill(true));
});

swup.hooks.on('page:view', initPageContent);
