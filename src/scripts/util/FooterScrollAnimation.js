import { MediaQueries } from './MediaQueries';

/**
 * "Garage door" footer reveal (desktop only).
 *
 * The footer is fixed behind the page (see `src/styles/footer.css`); the main
 * content scrolls up over it and reveals it like a garage door opening. All
 * this class does is keep `--footer-reveal-height` in sync with the footer's
 * rendered height so `.site-main` reserves exactly that much scroll room.
 *
 * Mobile (< md) falls back to normal document flow via the CSS media query;
 * the custom property is harmless there.
 */
export default class FooterScrollAnimation {
  /**
   * @param {HTMLElement|null} footer `#site-footer`
   */
  constructor(footer) {
    this.footer = footer;
    this.resizeObserver = null;
    this.handleBreakpointChange = this.handleBreakpointChange.bind(this);
  }

  init() {
    if (!this.footer) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.setup());
    this.resizeObserver.observe(this.footer);

    MediaQueries.MD.addEventListener('change', this.handleBreakpointChange);

    this.setup();
  }

  handleBreakpointChange() {
    this.setup();
  }

  /**
   * Re-measure the footer and update the reveal offset. Called on init,
   * footer resize, breakpoint change, and every Swup `page:view`.
   *
   * @returns {void}
   */
  setup() {
    if (!this.footer) {
      return;
    }

    document.documentElement.style.setProperty(
      '--footer-reveal-height',
      `${Math.ceil(this.footer.getBoundingClientRect().height)}px`
    );
  }
}
