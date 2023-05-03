export interface IScene {
    end(): void;
    update(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
