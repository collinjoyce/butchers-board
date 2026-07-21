const Breakpoints = {
  MIN: 320,
  SM: 640,
  NAV: 1024,
  MD: 784,
  LG: 1440,
  MAX: 1920,
};

const MediaQueries = {
  MOTION_QUERY: window.matchMedia('(prefers-reduced-motion: reduce)'),
  CURSOR_QUERY: window.matchMedia('(hover: hover)'),
  MIN: window.matchMedia(`(min-width: ${Breakpoints.MIN}px)`),
  SM: window.matchMedia(`(min-width: ${Breakpoints.SM}px)`),
  MD: window.matchMedia(`(min-width: ${Breakpoints.MD}px)`),
  NAV: window.matchMedia(`(min-width: ${Breakpoints.NAV}px)`),
  LG: window.matchMedia(`(min-width: ${Breakpoints.LG}px)`),
  MAX: window.matchMedia(`(min-width: ${Breakpoints.MAX}px)`),
};

export { Breakpoints, MediaQueries };
