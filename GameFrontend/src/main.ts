import "./style.css";
import { Camera } from "./camera";
import { Sprite } from "./sprite";
import collisions from "../data/collisions.json";
import { Boundary } from "./Boundary";
import { rectangularCollision } from "./collisions";
import Connection from "./io/connection";

const indexIntoCollisions = (row: number, col: number) => {
    const index = col * collisions.width + row;
    return collisions.data[index];
};

const obstacleHere = (row: number, col: number) => {
    return indexIntoCollisions(row, col) != 0;
};

const connection = new Connection("/api/chat-hub");

let username = "";
let connected = false;
let didSendStoppedMoving = false;

const canvas = document.querySelector("#app") as HTMLCanvasElement;
const speed = 3;

const otherPlayers: Record<string, Sprite> = {};

type Direction = "down" | "right" | "up" | "left";
type MultiSprite = Record<Direction, Sprite>;

// const otherPlayersMultiSprites: Record<string, MultiSprite> = {};
const otherPlayersDirection: Record<string, Direction> = {};
const otherPlayerDidMove: Record<string, boolean> = {};

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

const playerSprites = createMultiSprite(canvas.width / 2, canvas.height / 2);

let currentPlayerSprite: "down" | "right" | "up" | "left" = "down";

const getCurrentSprite = () => {
    return playerSprites[currentPlayerSprite];
};

if (!canvas) {
    console.error("Canvas not found");
} else {
    console.log(canvas.clientWidth);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        console.error("Context not initialized");
    } else {
        const camera = new Camera(390, 700);
        // const camera = new Camera(0, 0);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gameMap = new Sprite({ url: "/assets/GameMap.png", x: 0, y: 0 });

        const gameMapForeground = new Sprite({
            url: "/assets/GameMap_Foreground.png",
            x: 0,
            y: 0,
        });

        const boundaries: Boundary[] = [];

        for (let row = 0; row < collisions.width; row++) {
            for (let col = 0; col < collisions.height; col++) {
                if (obstacleHere(row, col)) {
                    boundaries.push(
                        new Boundary({
                            x: row * Boundary.size,
                            y: col * Boundary.size,
                        })
                    );
                }
            }
        }

        const drawImages = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            gameMap.draw(ctx, camera);

            getCurrentSprite().draw(ctx, camera);

            var keys = Object.keys(otherPlayers);
            for (let i = 0; i < keys.length; i++) {
                otherPlayers[keys[i]].draw(ctx, camera);
            }

            gameMapForeground.draw(ctx, camera);

            // for (let boundary of boundaries) {
            //   boundary.draw(ctx, camera);
            // }
        };

        const keyPressed: Record<string, boolean> = {};
        let didMove = false;

        const processInput = () => {
            let direction = { x: 0, y: 0 };

            didMove = false;

            if (keyPressed["s"]) {
                currentPlayerSprite = "down";
                didMove = true;
                direction.y += speed;
            }

            if (keyPressed["w"]) {
                currentPlayerSprite = "up";
                didMove = true;
                direction.y -= speed;
            }

            if (keyPressed["d"]) {
                currentPlayerSprite = "right";
                didMove = true;
                direction.x += speed;
            }

            if (keyPressed["a"]) {
                currentPlayerSprite = "left";
                didMove = true;
                direction.x -= speed;
            }

            camera.x += direction.x;
            camera.y += direction.y;
        };

        const handleCollision = () => {
            console.log("collision!");

            if (keyPressed["s"]) {
                camera.y -= speed;
            }

            if (keyPressed["w"]) {
                camera.y += speed;
            }

            if (keyPressed["d"]) {
                camera.x -= speed;
            }

            if (keyPressed["a"]) {
                camera.x += speed;
            }
        };

        const detectCollisions = () => {
            const playerRectangle = {
                x: camera.x + getCurrentSprite().x,
                y: camera.y + getCurrentSprite().y,
                width: getCurrentSprite().getWidth(),
                height: getCurrentSprite().getHeight(),
            };

            for (let i = 0; i < boundaries.length; i++) {
                const boundaryRectangle = {
                    x: boundaries[i].getX(),
                    y: boundaries[i].getY(),
                    width: Boundary.size,
                    height: Boundary.size,
                };

                if (rectangularCollision(playerRectangle, boundaryRectangle)) {
                    handleCollision();
                    break;
                }
            }
        };

        const updateAnimations = () => {
            var keys = Object.keys(otherPlayers);
            for (let i = 0; i < keys.length; i++) {
                const username = keys[i];

                if (otherPlayerDidMove[username]) {
                    otherPlayers[keys[i]].updateAnimation();
                }
            }

            if (!didMove) return;
            getCurrentSprite().updateAnimation();
        };

        const sendSocketInfo = () => {
            if (!connected) return;

            if (!didMove && !didSendStoppedMoving) {
                didSendStoppedMoving = true;
                connection.send("Stop");
                return;
            }

            if (!didMove) return;

            didSendStoppedMoving = false;

            if (username == "") return;

            connection.send(
                "Move",
                camera.x + getCurrentSprite().x,
                camera.y + getCurrentSprite().y,
                currentPlayerSprite
            );
        };

        const animate = () => {
            processInput();

            sendSocketInfo();

            detectCollisions();

            updateAnimations();

            drawImages();

            requestAnimationFrame(animate);
        };

        window.addEventListener("keydown", (ev) => {
            keyPressed[ev.key] = true;
        });

        window.addEventListener("keyup", (ev) => {
            keyPressed[ev.key] = false;
        });
        animate();
    }
}

// Connection stuffs

connection.on("MessageReceived", (username: string, message: string) => {
    console.log("Author:", username, " Message:", message);
});

connection.on(
    "PlayerMoved",
    (
        inUsername: string,
        x: number,
        y: number,
        direction: Direction,
        otherDidMove: boolean
    ) => {
        if (username == "" || inUsername == username) {
            return;
        }

        console.log(
            "PlayerMoved",
            username,
            inUsername,
            x,
            y,
            direction,
            otherDidMove
        );

        if (
            !otherPlayers[inUsername] ||
            direction != otherPlayersDirection[inUsername]
        ) {
            const mapDirectionToSpriteName = {
                up: "playerUp",
                down: "playerDown",
                left: "playerLeft",
                right: "playerRight",
            };

            otherPlayers[inUsername] = new Sprite({
                url: `/assets/${mapDirectionToSpriteName[direction]}.png`,
                x: x,
                y: y,
                frames: 4,
            });

            otherPlayersDirection[inUsername] = direction;
        }

        otherPlayerDidMove[inUsername] = otherDidMove;

        otherPlayers[inUsername].x = x;
        otherPlayers[inUsername].y = y;
    }
);

connection.on("PlayerLeft", (inUsername: string) => {
    console.log("PlayerLeft", inUsername, username);
    if (inUsername == username.toString()) return;

    delete otherPlayers[inUsername];
    delete otherPlayersDirection[inUsername];
    delete otherPlayerDidMove[inUsername];
});

connection
    .start()
    .then(() => {
        connected = true;
        const tempConnection = connection.getConnectionId();
        if (tempConnection == null) throw "No connection id";
        username = tempConnection;
    })
    .catch((err) => document.write(err));

const send = () => {
    const inputElement = document.querySelector("#message") as HTMLInputElement;
    const value = inputElement.value;
    connection
        .send("NewMessage", username, value)
        .then(() => (inputElement.value = ""));
};

document.querySelector("#sendButton")?.addEventListener("click", () => {
    send();
});
