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

export const text = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    font: string = "1rem Arial",
    color: string = "#000"
) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
    ctx.restore();
};
