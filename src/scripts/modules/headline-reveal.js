import gsap from 'gsap';

import { MediaQueries } from '../util/MediaQueries';

const SVG_NS = 'http://www.w3.org/2000/svg';

export default class HeadlineReveal {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.words = [...element.querySelectorAll('[data-headline-word]')];
    this.svgLines = [...element.querySelectorAll('[data-headline-line]')];
    this.stickers = [
      ...(element.closest('section')?.querySelectorAll('[data-headline-sticker]') ??
        []),
    ];

    if (
      (!this.words.length && !this.svgLines.length) ||
      MediaQueries.MOTION_QUERY.matches
    ) {
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
    if (this.svgLines.length) {
      this.words = this.createSvgWordGroups(this.svgLines);
    }

    gsap.set(this.words, {
      opacity: 0,
      scale: 0.96,
      transformOrigin: '50% 50%',
    });

    gsap.set(this.stickers, {
      opacity: 0,
      scale: 0.9,
      transformOrigin: '50% 50%',
    });

    const timeline = gsap.timeline({
      delay: 0.5,
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        once: true,
      },
    });

    timeline.to(this.words, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      stagger: 0.16,
      ease: 'power2.out',
    });

    if (this.stickers.length) {
      timeline.to(this.stickers, {
        opacity: 1,
        scale: 1,
        duration: 0.28,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }

  /**
   * @param {SVGTextElement[]} lines
   * @returns {SVGGElement[]}
   */
  createSvgWordGroups(lines) {
    return lines.flatMap((line) => {
      const content = line.textContent;
      const matches = [...content.matchAll(/\S+/g)];
      const firstStart = matches[0].index;
      const lastMatch = matches.at(-1);
      const lastEnd = lastMatch.index + lastMatch[0].length - 1;
      const measuredStart = line.getStartPositionOfChar(firstStart).x;
      const measuredEnd = line.getEndPositionOfChar(lastEnd).x;
      const targetWidth = parseFloat(line.getAttribute('textLength'));
      const widthScale = targetWidth / Math.max(measuredEnd - measuredStart, 1);

      return matches.map((match) => {
        const start = match.index;
        const end = start + match[0].length - 1;
        const startPoint = line.getStartPositionOfChar(start);
        const endPoint = line.getEndPositionOfChar(end);
        const x = (startPoint.x - measuredStart) * widthScale;
        const width = (endPoint.x - startPoint.x) * widthScale;
        const group = document.createElementNS(SVG_NS, 'g');
        const word = document.createElementNS(SVG_NS, 'text');

        word.textContent = match[0];
        word.setAttribute('x', x);
        word.setAttribute('y', line.getAttribute('y'));
        word.setAttribute('font-size', line.dataset.fontSize);
        word.setAttribute('textLength', Math.max(width, 1));
        word.setAttribute('lengthAdjust', 'spacingAndGlyphs');

        group.append(word);
        line.parentElement.append(group);

        return group;
      });
    });
  }
}
