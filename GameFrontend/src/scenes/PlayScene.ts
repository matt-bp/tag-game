import { IScene } from "./IScene";
import { Sprite } from "../graphics/sprite";
import { Boundary } from "../Boundary";
import collisions from "../../data/collisions.json";
import { Camera } from "../camera";
import Keyboard from "../io/keyboard";
import { rectangularCollision } from "../collisions";
import Connection, { ArgsToIncomingMessages } from "../io/connection";
import { Direction } from "../helpers/direction";
import { text } from "../graphics/drawing";

const indexIntoCollisions = (row: number, col: number) => {
    const index = col * collisions.width + row;
    return collisions.data[index];
};

const obstacleHere = (row: number, col: number) => {
    return indexIntoCollisions(row, col) != 0;
};

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
    #otherPlayersDirection: Record<string, Direction> = {};
    #otherPlayerDidMove: Record<string, boolean> = {};
    #otherPlayerUsername: Record<string, string> = {};

    #worldSprites: Record<string, Sprite> = {};
    #boundaries: Boundary[] = [];
    #playerDirection: Direction = "down";
    #playerSprites: MultiSprite | undefined;
    #camera: Camera | undefined;
    #keyboard: Keyboard | undefined;
    #didPlayerMove: boolean = false;
    #regularPlayerSpeed: number = 3;
    #chaserPlayerSpeed: number = 4;
    #connection: Connection = new Connection("/api/game-hub");
    #didSendStoppedMoving: boolean = false;
    #whoIsChaser: string = "";
    #serverMessage: string = "";

    constructor(
        private readonly username: string,
        private readonly width: number,
        private readonly height: number,
        private readonly next: () => void
    ) {
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
        this.#connection.start().then(() => {
            this.sendUsernameToServer(username);
        });
    }

    end: () => Promise<void> = async () => {
        this.#keyboard?.dispose();
        await this.#connection.end();
    };

    update = () => {
        this.processInput();

        this.detectBoundaryCollisions();

        this.sendPositionToServer();

        this.updateAnimations();
    };

    render = (ctx: CanvasRenderingContext2D) => {
        if (!this.#camera) return;

        this.#worldSprites["map"].draw(ctx, this.#camera);

        const player = this.getCurrentSprite();

        this.updateEffectBasedOnChaser(
            ctx,
            this.#connection.getConnectionId() ?? "",
            () => {
                if (!this.#camera || !player) return;

                player.draw(ctx, this.#camera);

                text(
                    ctx,
                    player.x + 10,
                    player.y - 20,
                    this.username,
                    "20px Arial"
                );
            }
        );

        var keys = Object.keys(this.#otherPlayers);
        for (let i = 0; i < keys.length; i++) {
            const otherSprite = this.#otherPlayers[keys[i]];

            this.updateEffectBasedOnChaser(ctx, keys[i], () => {
                if (!this.#camera) return;
                otherSprite.draw(ctx, this.#camera);

                text(
                    ctx,
                    otherSprite.x + 10 - this.#camera.x,
                    otherSprite.y - 20 - this.#camera.y,
                    this.#otherPlayerUsername[keys[i]],
                    "20px Arial"
                );
            });

            ctx.filter = "none";
        }

        this.#worldSprites["map_foreground"].draw(ctx, this.#camera);

        for (let boundary of this.#boundaries) {
            boundary.draw(ctx, this.#camera);
        }

        text(ctx, 10, 10, this.#serverMessage, "40px Arial", "#FFFFFF");
    };

    private updateEffectBasedOnChaser = (
        ctx: CanvasRenderingContext2D,
        key: string,
        drawCall: () => void
    ) => {
        if (this.#whoIsChaser === key) {
            ctx.filter = "hue-rotate(180deg) drop-shadow(0px 16px 10px black)";
        } else {
            ctx.filter = "none";
        }

        drawCall();

        ctx.filter = "none";
    };

    private getCurrentSprite = () => {
        if (!this.#playerSprites) return;
        return this.#playerSprites[this.#playerDirection];
    };

    private processInput = () => {
        this.processKeyboardInput();
        this.processNetworkInput();
    };

    private getPlayerSpeed = () => {
        if (this.#whoIsChaser == this.#connection.getConnectionId()) {
            return this.#chaserPlayerSpeed;
        } else {
            return this.#regularPlayerSpeed;
        }
    };

    private processKeyboardInput = () => {
        let direction = { x: 0, y: 0 };

        this.#didPlayerMove = false;

        if (this.#keyboard?.keyPressed["Escape"]) {
            this.next();
        }

        if (this.#keyboard?.keyPressed["s"]) {
            this.#playerDirection = "down";
            this.#didPlayerMove = true;
            direction.y += this.getPlayerSpeed();
        }

        if (this.#keyboard?.keyPressed["w"]) {
            this.#playerDirection = "up";
            this.#didPlayerMove = true;
            direction.y -= this.getPlayerSpeed();
        }

        if (this.#keyboard?.keyPressed["d"]) {
            this.#playerDirection = "right";
            this.#didPlayerMove = true;
            direction.x += this.getPlayerSpeed();
        }

        if (this.#keyboard?.keyPressed["a"]) {
            this.#playerDirection = "left";
            this.#didPlayerMove = true;
            direction.x -= this.getPlayerSpeed();
        }

        if (!this.#camera) return;

        this.#camera.x += direction.x;
        this.#camera.y += direction.y;
    };

    private processNetworkInput = () => {
        for (let message of this.#connection.messageQueue) {
            if (message[0] == "PlayerMoved") {
                this.handlePlayerMoved(
                    ...(message[1] as ArgsToIncomingMessages["PlayerMoved"])
                );
                continue;
            }
            if (message[0] == "PlayerLeft") {
                this.handlePlayerLeft(
                    ...(message[1] as ArgsToIncomingMessages["PlayerLeft"])
                );
                continue;
            }
            if (message[0] == "ServerMessage") {
                this.handleServerMessage(
                    ...(message[1] as ArgsToIncomingMessages["ServerMessage"])
                );
                continue;
            }
            throw new Error(`Unknown message type: ${message[0]}`);
        }
        this.#connection.messageQueue = [];
    };

    private updateAnimations = () => {
        if (this.#didPlayerMove) {
            this.getCurrentSprite()?.updateAnimation();
        }

        var keys = Object.keys(this.#otherPlayers);
        for (let i = 0; i < keys.length; i++) {
            if (this.#otherPlayerDidMove[keys[i]])
                this.#otherPlayers[keys[i]].updateAnimation();
        }
    };

    private detectBoundaryCollisions = () => {
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
            this.#camera.y -= this.getPlayerSpeed();
        }

        if (this.#keyboard?.keyPressed["w"]) {
            this.#camera.y += this.getPlayerSpeed();
        }

        if (this.#keyboard?.keyPressed["d"]) {
            this.#camera.x -= this.getPlayerSpeed();
        }

        if (this.#keyboard?.keyPressed["a"]) {
            this.#camera.x += this.getPlayerSpeed();
        }
    };

    private handlePlayerLeft = (otherId: string) => {
        if (otherId == this.#connection.getConnectionId()) return;

        delete this.#otherPlayers[otherId];
        delete this.#otherPlayersDirection[otherId];
        delete this.#otherPlayerDidMove[otherId];
    };

    private handlePlayerMoved = (
        otherId: string,
        username: string,
        x: number,
        y: number,
        direction: Direction,
        otherDidMove: boolean,
        isChaser: boolean
    ) => {
        if (isChaser) {
            this.#whoIsChaser = otherId;
        }

        if (otherId == this.#connection.getConnectionId()) return;

        if (
            !this.#otherPlayers[otherId] ||
            direction != this.#otherPlayersDirection[otherId]
        ) {
            console.log("Creating new!");
            const mapDirectionToSpriteName = {
                up: "playerUp",
                down: "playerDown",
                left: "playerLeft",
                right: "playerRight",
            };

            this.#otherPlayers[otherId] = new Sprite({
                url: `/assets/${mapDirectionToSpriteName[direction]}.png`,
                x: x,
                y: y,
                frames: 4,
            });

            this.#otherPlayersDirection[otherId] = direction;
        }

        this.#otherPlayerUsername[otherId] = username;
        this.#otherPlayerDidMove[otherId] = otherDidMove;

        this.#otherPlayers[otherId].x = x;
        this.#otherPlayers[otherId].y = y;
    };

    private handleServerMessage = (message: string) => {
        this.#serverMessage = message;
    };

    private sendPositionToServer = () => {
        if (!this.#connection.connected) return;

        if (!this.#didPlayerMove && !this.#didSendStoppedMoving) {
            this.#didSendStoppedMoving = true;
            this.#connection.send("Stop");
            return;
        }

        if (!this.#didPlayerMove) return;

        const current = this.getCurrentSprite();

        if (!current || !this.#camera) return;

        this.#didSendStoppedMoving = false;

        this.#connection.send(
            "Move",
            this.#camera.x + current.x,
            this.#camera.y + current.y,
            this.#playerDirection
        );
    };

    private sendUsernameToServer = (username: string) => {
        if (!this.#connection.connected) return;

        this.#connection.send("NewUsername", username);
    };
}
