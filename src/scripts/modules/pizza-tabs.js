import gsap from 'gsap';

import { MediaQueries } from '../util/MediaQueries';

/**
 * Pizza market tabs (Canada / USA), with a GSAP switch animation.
 *
 * Root element: [data-module="pizza-tabs"] (the Our Pizzas section).
 * - [data-tab="<handle>"]        tab buttons in the sticky bar
 * - [data-tab-panel="<handle>"]  any element toggled by the tabs — both the
 *   pizza grids and the per-market retailer lists use this, so a market's
 *   retailers switch together with its pizzas.
 * - [data-tab-card]              pizza cards (staggered in/out)
 * - [data-tab-retailer]          retailer logos (staggered in)
 *
 * Switch sequence:
 * 1. Outgoing cards fade out + drop down, staggered; the outgoing retailers
 *    panel drops out with them as one block.
 * 2. Panels swap (`hidden` toggles).
 * 3. Incoming cards fade in + rise, staggered; simultaneously the incoming
 *    retailers panel rises in as a block while its logos stagger in with
 *    the same fade-and-rise.
 */
export default class PizzaTabs {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.section = element;
    this.tabs = [...element.querySelectorAll('[data-tab]')];
    this.panels = [...element.querySelectorAll('[data-tab-panel]')];

    if (!this.tabs.length || !this.panels.length) {
      return;
    }

    this.activeHandle = this.tabs[0].dataset.tab;
    this.timeline = null;

    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.activate(tab.dataset.tab));
    });

    this.swap(this.activeHandle);
  }

  /**
   * Instant state swap — aria + hidden attributes only.
   * @param {string} handle
   */
  swap(handle) {
    this.tabs.forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab.dataset.tab === handle));
    });

    this.panels.forEach((panel) => {
      panel.toggleAttribute('hidden', panel.dataset.tabPanel !== handle);
    });

    this.section
      .querySelectorAll('[data-module="pizza-media"]')
      .forEach(card => card.dispatchEvent(new CustomEvent('pizza-media:refresh')));
  }

  /**
   * @param {string} handle
   * @returns {{ cards: Element[], retailerPanel: Element|null, retailers: Element[] }}
   */
  partsFor(handle) {
    const panels = this.panels.filter((p) => p.dataset.tabPanel === handle);
    // Pizza grid vs retailers list: cards live in one panel, logos in the other.
    const cardPanel = panels.find((p) => p.querySelector('[data-tab-card]'));
    const retailerPanel =
      panels.find((p) => p.querySelector('[data-tab-retailer]')) ??
      panels.find((p) => p !== cardPanel) ??
      null;

    return {
      cards: cardPanel
        ? [...cardPanel.querySelectorAll('[data-tab-card]')]
        : [],
      retailerPanel,
      retailers: retailerPanel
        ? [...retailerPanel.querySelectorAll('[data-tab-retailer]')]
        : [],
    };
  }

  /**
   * @param {string} handle Market handle, e.g. "canada"
   * @returns {void}
   */
  activate(handle) {
    if (handle === this.activeHandle) {
      return;
    }

    const out = this.partsFor(this.activeHandle);
    const inc = this.partsFor(handle);
    this.activeHandle = handle;

    if (MediaQueries.MOTION_QUERY.matches) {
      this.swap(handle);
      return;
    }

    // Interrupted mid-switch: jump the previous timeline to its end state
    // (panels swapped, props cleared) before starting the new one.
    this.timeline?.progress(1).kill();

    const animated = [
      ...out.cards,
      out.retailerPanel,
      ...inc.cards,
      inc.retailerPanel,
      ...inc.retailers,
    ].filter(Boolean);

    this.timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(animated, { clearProps: 'all' });
        this.timeline = null;
      },
    });

    // Phase 1 — out: cards staggered, retailers block along with them.
    if (out.cards.length) {
      this.timeline.to(out.cards, {
        opacity: 0,
        y: 14,
        duration: 0.25,
        ease: 'power2.in',
        stagger: 0.08,
      });
    }

    if (out.retailerPanel) {
      this.timeline.to(
        out.retailerPanel,
        { opacity: 0, y: 14, duration: 0.25, ease: 'power2.in' },
        out.cards.length ? '<' : 0
      );
    }

    this.timeline.add(() => this.swap(handle)).add('in');

    // Phase 2 — in: cards staggered; retailers block rises in at the same
    // time while its logos stagger in with the same fade-and-rise.
    if (inc.cards.length) {
      this.timeline.fromTo(
        inc.cards,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.1 },
        'in'
      );
    }

    if (inc.retailerPanel) {
      this.timeline.fromTo(
        inc.retailerPanel,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        'in'
      );
    }

    if (inc.retailers.length) {
      this.timeline.fromTo(
        inc.retailers,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.05,
        },
        'in'
      );
    }
  }
}
