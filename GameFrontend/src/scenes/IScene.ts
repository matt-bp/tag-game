export interface IScene {
    startup(): void;
    end(): void;
    update(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
