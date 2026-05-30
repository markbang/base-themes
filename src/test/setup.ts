import '@testing-library/jest-dom/vitest'

const localStorageStore = new Map<string, string>()

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    clear: vi.fn(() => localStorageStore.clear()),
    getItem: vi.fn((key: string) => localStorageStore.get(key) ?? null),
    key: vi.fn((index: number) => [...localStorageStore.keys()][index] ?? null),
    removeItem: vi.fn((key: string) => localStorageStore.delete(key)),
    setItem: vi.fn((key: string, value: string) => localStorageStore.set(key, value)),
    get length() {
      return localStorageStore.size
    },
  },
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
})
