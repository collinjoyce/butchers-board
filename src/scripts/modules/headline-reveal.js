import gsap from 'gsap';

import { MediaQueries } from '../util/MediaQueries';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ANIMATION = {
  opacity: 1,
  scale: 1,
  duration: 0.3,
  delay: 0.5,
  stagger: 0.16,
  ease: 'power2.out',
};

export default class HeadlineReveal {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.words = [...element.querySelectorAll('[data-headline-word]')];

    if (!this.words.length || MediaQueries.MOTION_QUERY.matches) {
      return;
    }

    document.fonts.ready.then(() => {
      if (element.isConnected) {
        this.init(element);
      }
    });
  }

  /**
   * @param {HTMLElement} element
   */
  init(element) {
    if (this.words[0] instanceof SVGElement) {
      this.words = this.createSvgWordGroups(this.words);
    }

    gsap.set(this.words, {
      opacity: 0,
      scale: 0.96,
      transformOrigin: '50% 50%',
    });

    gsap.to(this.words, {
      ...ANIMATION,
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        once: true,
      },
    });
  }

  /**
   * SVG tspans cannot reliably transform around their own center. Rebuild
   * each measured word inside a transformable group without changing layout.
   *
   * @param {SVGElement[]} sources
   * @returns {SVGGElement[]}
   */
  createSvgWordGroups(sources) {
    return sources.map((source) => {
      const bounds = source.getBBox();
      const line = source.parentElement;
      const group = document.createElementNS(SVG_NS, 'g');
      const word = document.createElementNS(SVG_NS, 'text');

      word.textContent = source.textContent.trim();
      word.setAttribute('x', bounds.x);
      word.setAttribute('y', line.getAttribute('y'));
      word.setAttribute('font-size', source.dataset.fontSize);
      word.setAttribute('textLength', bounds.width);
      word.setAttribute('lengthAdjust', 'spacingAndGlyphs');

      group.append(word);
      line.parentElement.append(group);

      return group;
    });
  }
}
