export interface IScene {
    end(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
