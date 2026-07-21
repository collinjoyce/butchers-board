import Splide from '@splidejs/splide';
import gsap from 'gsap';
import lazySizes from 'lazysizes';

import { MediaQueries } from '../util/MediaQueries';

export default class PizzaMedia {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.element = element;
    this.carousel = element.querySelector('[data-pizza-carousel]');
    this.dialog = element.querySelector('[data-lightbox]');
    this.lightboxImage = element.querySelector('[data-lightbox-image]');
    this.activeTrigger = null;
    this.isClosing = false;
    this.handleImageLoaded = this.handleImageLoaded.bind(this);

    this.initCarousel();
    this.initLightbox();
  }

  initCarousel() {
    if (!this.carousel) {
      return;
    }

    this.splide = new Splide(this.carousel, {
      type: 'fade',
      rewind: true,
      arrows: false,
      pagination: true,
      speed: MediaQueries.MOTION_QUERY.matches ? 0 : 450,
      drag: true,
      keyboard: 'focused',
      reducedMotion: {
        speed: 0,
        rewindSpeed: 0,
      },
    });

    this.splide.mount();

    this.element.addEventListener('pizza-media:refresh', () => {
      this.splide.refresh();
    });
  }

  initLightbox() {
    if (!this.dialog || !this.lightboxImage) {
      return;
    }

    this.element.querySelectorAll('[data-lightbox-trigger]').forEach(trigger => {
      trigger.addEventListener('click', () => this.openLightbox(trigger));
    });

    this.dialog.querySelectorAll('[data-lightbox-close]').forEach(button => {
      button.addEventListener('click', () => this.closeLightbox());
    });

    this.dialog.addEventListener('cancel', event => {
      event.preventDefault();
      this.closeLightbox();
    });
  }

  /**
   * @param {HTMLElement} trigger
   */
  openLightbox(trigger) {
    this.activeTrigger = trigger;
    this.lightboxImage.removeEventListener(
      'lazyloaded',
      this.handleImageLoaded
    );
    this.lightboxImage.removeAttribute('src');
    this.lightboxImage.classList.remove('lazyloaded', 'lazyloading');
    this.lightboxImage.classList.add('lazyload');
    this.lightboxImage.dataset.src = trigger.dataset.lightboxSrc;
    this.lightboxImage.alt = trigger.dataset.lightboxAlt ?? '';
    gsap.set(this.lightboxImage, { opacity: 0 });
    this.dialog.showModal();
    document.documentElement.classList.add('has-lightbox');
    this.lightboxImage.addEventListener(
      'lazyloaded',
      this.handleImageLoaded,
      { once: true }
    );
    lazySizes.loader.unveil(this.lightboxImage);

    if (MediaQueries.MOTION_QUERY.matches) {
      gsap.set(this.dialog, { opacity: 1 });
      return;
    }

    gsap.fromTo(
      this.dialog,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: 'power2.out' }
    );
  }

  handleImageLoaded() {
    if (!this.dialog.open) {
      return;
    }

    gsap.to(this.lightboxImage, {
      opacity: 1,
      duration: MediaQueries.MOTION_QUERY.matches ? 0 : 0.25,
      ease: 'power2.out',
    });
  }

  closeLightbox() {
    if (!this.dialog.open || this.isClosing) {
      return;
    }

    const finish = () => {
      this.dialog.close();
      this.lightboxImage.removeEventListener(
        'lazyloaded',
        this.handleImageLoaded
      );
      this.lightboxImage.removeAttribute('src');
      this.lightboxImage.removeAttribute('data-src');
      this.lightboxImage.classList.remove(
        'lazyload',
        'lazyloading',
        'lazyloaded'
      );
      this.lightboxImage.alt = '';
      document.documentElement.classList.remove('has-lightbox');
      this.activeTrigger?.focus();
      this.isClosing = false;
    };

    if (MediaQueries.MOTION_QUERY.matches) {
      finish();
      return;
    }

    this.isClosing = true;
    gsap.to(this.dialog, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: finish,
    });
  }
}
