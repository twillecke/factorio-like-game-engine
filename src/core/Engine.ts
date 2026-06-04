import { Application } from "pixi.js";

class Engine {
  private _app: Application | null = null;

  public get app(): Application {
    if (!this._app) throw new Error("Engine not initialized");
    return this._app;
  }

  public get ticker() {
    return this.app.ticker;
  }

  public get screen() {
    return this.app.screen;
  }

  public get stage() {
    return this.app.stage;
  }

  public get renderer() {
    return this.app.renderer;
  }

  public async init(canvas: HTMLCanvasElement): Promise<void> {
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

  public destroy(): void {
    if (!this._app) return;
    this._app.destroy();
    this._app = null;
  }
}

export const engine = new Engine();
