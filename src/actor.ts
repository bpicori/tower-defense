export interface Actor {
  beforeRender?(): void;
  render(): void;
}
