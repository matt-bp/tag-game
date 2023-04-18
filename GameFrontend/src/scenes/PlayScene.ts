import { IScene } from "./IScene";
import { Sprite } from "../graphics/sprite";
import { Boundary } from "../Boundary";
import collisions from "../../data/collisions.json";
import { Camera } from "../camera";

const indexIntoCollisions = (row: number, col: number) => {
    const index = col * collisions.width + row;
    return collisions.data[index];
};

const obstacleHere = (row: number, col: number) => {
    return indexIntoCollisions(row, col) != 0;
};

type Direction = "down" | "right" | "up" | "left";
type MultiSprite = Record<Direction, Sprite>;

const createMultiSprite = (x: number, y: number) => {
    return {
        down: new Sprite({
            url: "/assets/playerDown.png",
            x: x,
            y: y,
            frames: 4,
            absolute: true,
        }),
        right: new Sprite({
            url: "/assets/playerRight.png",
            x: x,
            y: y,
            frames: 4,
            absolute: true,
        }),
        up: new Sprite({
            url: "/assets/playerUp.png",
            x: x,
            y: y,
            frames: 4,
            absolute: true,
        }),
        left: new Sprite({
            url: "/assets/playerLeft.png",
            x: x,
            y: y,
            frames: 4,
            absolute: true,
        }),
    } as MultiSprite;
};

export default class PlayScene implements IScene {
    #otherPlayers: Record<string, Sprite> = {};
    #worldSprites: Record<string, Sprite> = {};
    #boundaries: Boundary[] = [];
    #playerSprites: MultiSprite | undefined;
    #camera: Camera | undefined;

    constructor(
        private readonly width: number,
        private readonly height: number
    ) {}

    startup = () => {
        this.#worldSprites["map"] = new Sprite({
            url: "/assets/GameMap.png",
            x: 0,
            y: 0,
        });
        this.#worldSprites["map_foreground"] = new Sprite({
            url: "/assets/GameMap_Foreground.png",
            x: 0,
            y: 0,
        });

        for (let row = 0; row < collisions.width; row++) {
            for (let col = 0; col < collisions.height; col++) {
                if (obstacleHere(row, col)) {
                    this.#boundaries.push(
                        new Boundary({
                            x: row * Boundary.size,
                            y: col * Boundary.size,
                        })
                    );
                }
            }
        }

        this.#playerSprites = createMultiSprite(
            this.width / 2,
            this.height / 2
        );

        this.#camera = new Camera(390, 700);
    };

    start = () => {
        throw new Error("Method not implemented.");
    };
    stop = () => {
        throw new Error("Method not implemented.");
    };

    update = () => {
        throw new Error("Method not implemented.");
    };

    render = (ctx: CanvasRenderingContext2D) => {
        if (!this.#camera) return;

        this.#worldSprites["map"].draw(ctx, this.#camera);

        // getCurrentSprite().draw(ctx, camera);

        // var keys = Object.keys(otherPlayers);
        // for (let i = 0; i < keys.length; i++) {
        //     otherPlayers[keys[i]].draw(ctx, camera);
        // }

        this.#worldSprites["map_foreground"].draw(ctx, this.#camera);
    };
}
