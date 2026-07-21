import gsap from 'gsap';

import { MediaQueries } from '../util/MediaQueries';

/**
 * Subtle scroll parallax inside a clipping container.
 *
 * Root element: [data-module="parallax"] with overflow-hidden.
 * Media child: [data-parallax-media], oversized vertically (e.g. h-[120%],
 * -top-[10%]) so the movement never reveals the container edges. The shift
 * is ±8% of the media's own height, which stays inside a 10% overscan.
 *
 * The ScrollTrigger is killed globally on Swup `content:replace` and the
 * module is re-created on `page:view` (see main.js), so no teardown needed.
 */
export default class Parallax {
  constructor(element) {
    this.media = element.querySelector('[data-parallax-media]');

    if (!this.media || MediaQueries.MOTION_QUERY.matches) {
      return;
    }

    gsap.fromTo(
      this.media,
      { yPercent: -12 },
      {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  }
}
