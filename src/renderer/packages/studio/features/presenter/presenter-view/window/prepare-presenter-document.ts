const PRESENTER_ROOT_ID = "presenter-root";

const PRESENTER_TITLE = "Presenter view, Bitgrain";
const BODY_CLASSES = "m-0 bg-black text-white font-editorial antialiased";
const STYLE_SELECTOR = 'link[rel="stylesheet"], style';

const copyStyles = (source: Document, target: Document): void => {
  source.querySelectorAll(STYLE_SELECTOR).forEach((node) => {
    const copy = target.importNode(node, true);
    if (node instanceof HTMLLinkElement) (copy as HTMLLinkElement).href = node.href;
    target.head.appendChild(copy);
  });
};

export const preparePresenterDocument = (target: Document): HTMLElement => {
  target.title = PRESENTER_TITLE;
  target.head.querySelectorAll(STYLE_SELECTOR).forEach((node) => node.remove());
  copyStyles(document, target);
  target.documentElement.setAttribute("data-theme", "dark");
  target.body.className = BODY_CLASSES;
  target.body.replaceChildren();
  const container = target.createElement("div");
  container.id = PRESENTER_ROOT_ID;
  target.body.appendChild(container);
  return container;
};
