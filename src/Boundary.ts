import { Camera } from "./camera";

interface Props {
  x: number;
  y: number;
}

export class Boundary {
  public static size = 60; // This is dependent on the current zoom level that layers are exported out as.

  private _x: number;
  private _y: number;
  private _w: number;
  private _h: number;

  constructor(props: Props) {
    this._x = props.x;
    this._y = props.y;
    this._w = Boundary.size;
    this._h = Boundary.size;
  }

  public draw = (ctx: CanvasRenderingContext2D, camera: Camera) => {
    ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
    ctx.fillRect(this._x - camera.x, this._y - camera.y, this._w, this._h);
  };

  public getX = () => {
    return this._x;
  };

  public getY = () => {
    return this._y;
  };
}
