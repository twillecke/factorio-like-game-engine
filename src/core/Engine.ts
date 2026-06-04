import { Application } from "pixi.js";

class Engine {
  private _app: Application | null = null;

  get app(): Application {
    if (!this._app) throw new Error("Engine not initialized");
    return this._app;
  }

  get ticker() {
    return this.app.ticker;
  }

  get screen() {
    return this.app.screen;
  }

  get stage() {
    return this.app.stage;
  }

  get renderer() {
    return this.app.renderer;
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    if (this._app) {
      this._app.destroy();
      this._app = null;
    }
    this._app = new Application();
    await this._app.init({
      canvas,
      background: 0x0d0d1a,
      resizeTo: window,
      antialias: true,
    });
  }

  destroy(): void {
    if (!this._app) return;
    this._app.destroy();
    this._app = null;
  }
}

export const engine = new Engine();
