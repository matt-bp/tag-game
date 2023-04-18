export interface IScene {
    startup(): void;
    start(): void;
    stop(): void;
    update(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
