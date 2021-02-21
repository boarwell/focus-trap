/**
 * keeps a element's original inert attribute value
 */
const originalInertValueMemo = new WeakMap<HTMLElement, string | null>();

/**
 * set 'inert' attribute to the element
 */
function setInert(element: HTMLElement): void {
  originalInertValueMemo.set(element, element.getAttribute("inert"));
  element.setAttribute("inert", "");
}

/**
 * restore the element's original inert attribute value
 */
function restoreInert(element: HTMLElement): void {
  const saved = originalInertValueMemo.get(element);

  if (saved == null) {
    element.removeAttribute("inert");
  } else {
    element.setAttribute("inert", saved);
  }
}

/**
 * traverse and yield parent element of the element
 */
function* traverseParents(element: HTMLElement): Generator<HTMLElement, void> {
  let parent = element.parentElement;

  while (parent !== null && parent !== document.body) {
    yield parent;
    parent = parent.parentElement;
  }
}

/**
 * enumerate siblings of the element
 */
function* getSiblings(element: HTMLElement): Generator<HTMLElement, void> {
  const parent = element.parentElement;
  if (parent == null) {
    return;
  }

  for (const sibling of parent.children) {
    if (sibling === element) {
      continue;
    }

    yield sibling as HTMLElement;
  }
}

/**
 * traverse siblings and siblings of ancestors
 */
function traverse(
  element: HTMLElement,
  callback: (e: HTMLElement) => void
): void {
  for (const sibling of getSiblings(element)) {
    callback(sibling);
  }

  for (const parent of traverseParents(element)) {
    for (const siblingOfParent of getSiblings(parent)) {
      callback(siblingOfParent);
    }
  }
}

/**
 * traps focus in the root
 */
function trap(root: HTMLElement): void {
  traverse(root, setInert);
}

/**
 * stops focus trapping
 */
function release(root: HTMLElement): void {
  traverse(root, restoreInert);
}

type Handler = {
  readonly trap: () => void;
  readonly release: () => void;
};

/**
 * returns trapping functions bounded the root element
 */
export function init(root: HTMLElement): Handler {
  return {
    trap: trap.bind(null, root),
    release: release.bind(null, root),
  };
}
