import { Camera } from "../camera";

interface Props {
    x: number;
    y: number;
    url: string;
    frames?: number;
    absolute?: boolean;
    centered?: boolean;
}

export class Sprite {
    private _image: HTMLImageElement;
    private _isLoaded: boolean = false;
    private _frames: number;
    private readonly _absolute: boolean;
    private readonly _centered: boolean;
    public x: number;
    public y: number;
    private _width: number = 0;
    private _height: number = 0;
    private _currentFrame: number = 0;
    private _elapsedFrames: number = 0;

    constructor(readonly props: Props) {
        this._image = new Image();
        this._image.src = props.url;
        this._image.onload = () => {
            this._isLoaded = true;
            this._width = this._image.width / this._frames;
            this._height = this._image.height;
            console.log(this._width, this._height);
        };

        this.x = props.x;
        this.y = props.y;
        this._frames = props.frames ?? 1;
        this._absolute = props.absolute ?? false;
        this._centered = props.centered ?? false;
    }

    public isLoaded = () => {
        return this._isLoaded;
    };

    public getImage = () => {
        return this._image;
    };

    public getWidth = () => {
        return this._width;
    };

    public getHeight = () => {
        return this._height;
    };

    public updateAnimation = () => {
        if (this._frames > 1) {
            this._elapsedFrames++;
        }

        if (this._elapsedFrames % 10 == 0) {
            this.nextFrame();
        }
    };

    private nextFrame = () => {
        this._currentFrame = (this._currentFrame + 1) % this._frames;
    };

    public draw = (ctx: CanvasRenderingContext2D, camera: Camera) => {
        const centeredXContribution = this._centered
            ? this._image.width / this._frames / 2
            : 0;
        const newX =
            this.x - centeredXContribution - (this._absolute ? 0 : camera.x);
        const centeredYContribution = this._centered
            ? this._image.height / 2
            : 0;
        const newY =
            this.y - centeredYContribution - (this._absolute ? 0 : camera.y);

        ctx.drawImage(
            this._image,
            this._currentFrame * this._width, // Crop start position x
            0, // Crop start position y
            this._image.width / this._frames, // Crop width
            this._image.height, // Crop height
            newX,
            newY,
            this._image.width / this._frames,
            this._image.height
        );
    };
}
