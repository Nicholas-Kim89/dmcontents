if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.detail = options.detail;
    }
  };
}

// Vite CLI를 임포트하여 실행합니다.
import('./node_modules/vite/dist/node/cli.js');
