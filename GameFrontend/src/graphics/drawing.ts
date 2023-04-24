export const circle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
) => {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, 2 * Math.PI);
    ctx.stroke();
};
