// Desktop stand-in for the web route preloader. The web build warms its lazy
// marketing/project-browser routes on hover; the desktop shell has no such routes
// (surfaces are tabs), so preloading is a no-op and those pages stay unported.
export const preloadRoute = (_path: string): void => {};
