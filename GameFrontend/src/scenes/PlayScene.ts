import { IScene } from "./IScene";
import { Sprite } from "../graphics/sprite";
import { Boundary } from "../Boundary";
import collisions from "../../data/collisions.json";
import { Camera } from "../camera";
import Keyboard from "../io/keyboard";
import { rectangularCollision } from "../collisions";

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
    #playerDirection: Direction = "down";
    #playerSprites: MultiSprite | undefined;
    #camera: Camera | undefined;
    #keyboard: Keyboard | undefined;
    #didPlayerMove: boolean = false;
    #playerSpeed: number = 3;

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

        this.#keyboard = new Keyboard();
    };

    end = () => {
        this.#keyboard?.dispose();
    };

    update = () => {
        this.processInput();

        this.detectCollisions();

        this.updateAnimations();
    };

    render = (ctx: CanvasRenderingContext2D) => {
        if (!this.#camera) return;

        this.#worldSprites["map"].draw(ctx, this.#camera);

        this.getCurrentSprite()?.draw(ctx, this.#camera);

        // var keys = Object.keys(otherPlayers);
        // for (let i = 0; i < keys.length; i++) {
        //     otherPlayers[keys[i]].draw(ctx, camera);
        // }

        this.#worldSprites["map_foreground"].draw(ctx, this.#camera);

        for (let boundary of this.#boundaries) {
            boundary.draw(ctx, this.#camera);
        }
    };

    private getCurrentSprite = () => {
        if (!this.#playerSprites) return;
        return this.#playerSprites[this.#playerDirection];
    };

    private processInput = () => {
        this.processKeyboardInput();
    };

    private processKeyboardInput = () => {
        let direction = { x: 0, y: 0 };

        this.#didPlayerMove = false;

        if (this.#keyboard?.keyPressed["s"]) {
            this.#playerDirection = "down";
            this.#didPlayerMove = true;
            direction.y += this.#playerSpeed;
        }

        if (this.#keyboard?.keyPressed["w"]) {
            this.#playerDirection = "up";
            this.#didPlayerMove = true;
            direction.y -= this.#playerSpeed;
        }

        if (this.#keyboard?.keyPressed["d"]) {
            this.#playerDirection = "right";
            this.#didPlayerMove = true;
            direction.x += this.#playerSpeed;
        }

        if (this.#keyboard?.keyPressed["a"]) {
            this.#playerDirection = "left";
            this.#didPlayerMove = true;
            direction.x -= this.#playerSpeed;
        }

        if (!this.#camera) return;

        this.#camera.x += direction.x;
        this.#camera.y += direction.y;
    };

    private updateAnimations = () => {
        if (this.#didPlayerMove) {
            this.getCurrentSprite()?.updateAnimation();
        }
    };

    private detectCollisions = () => {
        const currentSprite = this.getCurrentSprite();

        if (!currentSprite || !this.#camera) return;

        const playerRectangle = {
            x: this.#camera.x + currentSprite.x,
            y: this.#camera.y + currentSprite.y,
            width: currentSprite.getWidth(),
            height: currentSprite.getHeight(),
        };

        for (let i = 0; i < this.#boundaries.length; i++) {
            const boundaryRectangle = {
                x: this.#boundaries[i].getX(),
                y: this.#boundaries[i].getY(),
                width: Boundary.size,
                height: Boundary.size,
            };

            if (rectangularCollision(playerRectangle, boundaryRectangle)) {
                this.handleCollision();
                break;
            }
        }
    };

    private handleCollision = () => {
        console.log("collision!");

        if (!this.#camera) return;

        if (this.#keyboard?.keyPressed["s"]) {
            this.#camera.y -= this.#playerSpeed;
        }

        if (this.#keyboard?.keyPressed["w"]) {
            this.#camera.y += this.#playerSpeed;
        }

        if (this.#keyboard?.keyPressed["d"]) {
            this.#camera.x -= this.#playerSpeed;
        }

        if (this.#keyboard?.keyPressed["a"]) {
            this.#camera.x += this.#playerSpeed;
        }
    };
}
