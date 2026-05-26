import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

Object.defineProperties(Element.prototype, {
  hasPointerCapture: {
    writable: true,
    value: () => false,
  },
  scrollIntoView: {
    writable: true,
    value: () => {},
  },
  setPointerCapture: {
    writable: true,
    value: () => {},
  },
  releasePointerCapture: {
    writable: true,
    value: () => {},
  },
});
