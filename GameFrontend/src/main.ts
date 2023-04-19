import "./style.css";
import PlayScreen from "./scenes/PlayScene";
import { IScene } from "./scenes/IScene";

const canvas = document.querySelector("#app") as HTMLCanvasElement;

if (!canvas) {
    console.error("Canvas not found");
} else {
    console.log(canvas.clientWidth);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        console.error("Context not initialized");
    } else {
        const scene: IScene = new PlayScreen(canvas.width, canvas.height);

        scene.startup();

        // const sendSocketInfo = () => {
        //     if (!connected) return;

        //     if (!didMove && !didSendStoppedMoving) {
        //         didSendStoppedMoving = true;
        //         connection.send("Stop");
        //         return;
        //     }

        //     if (!didMove) return;

        //     didSendStoppedMoving = false;

        //     if (username == "") return;

        //     connection.send(
        //         "Move",
        //         camera.x + getCurrentSprite().x,
        //         camera.y + getCurrentSprite().y,
        //         currentPlayerSprite
        //     );
        // };

        const animate = () => {
            scene.update();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            scene.render(ctx);

            requestAnimationFrame(animate);
        };

        animate();
    }
}

// Connection stuffs

// connection.on("MessageReceived", (username: string, message: string) => {
//     console.log("Author:", username, " Message:", message);
// });

// connection.on(
//     "PlayerMoved",
//     (
//         inUsername: string,
//         x: number,
//         y: number,
//         direction: Direction,
//         otherDidMove: boolean
//     ) => {
//         if (username == "" || inUsername == username) {
//             return;
//         }

//         console.log(
//             "PlayerMoved",
//             username,
//             inUsername,
//             x,
//             y,
//             direction,
//             otherDidMove
//         );

//         if (
//             !otherPlayers[inUsername] ||
//             direction != otherPlayersDirection[inUsername]
//         ) {
//             const mapDirectionToSpriteName = {
//                 up: "playerUp",
//                 down: "playerDown",
//                 left: "playerLeft",
//                 right: "playerRight",
//             };

//             otherPlayers[inUsername] = new Sprite({
//                 url: `/assets/${mapDirectionToSpriteName[direction]}.png`,
//                 x: x,
//                 y: y,
//                 frames: 4,
//             });

//             otherPlayersDirection[inUsername] = direction;
//         }

//         otherPlayerDidMove[inUsername] = otherDidMove;

//         otherPlayers[inUsername].x = x;
//         otherPlayers[inUsername].y = y;
//     }
// );

// connection.on("PlayerLeft", (inUsername: string) => {
//     console.log("PlayerLeft", inUsername, username);
//     if (inUsername == username.toString()) return;

//     delete otherPlayers[inUsername];
//     delete otherPlayersDirection[inUsername];
//     delete otherPlayerDidMove[inUsername];
// });

// connection
//     .start()
//     .then(() => {
//         connected = true;
//         const tempConnection = connection.getConnectionId();
//         if (tempConnection == null) throw "No connection id";
//         username = tempConnection;
//     })
//     .catch((err) => document.write(err));

// const send = () => {
//     const inputElement = document.querySelector("#message") as HTMLInputElement;
//     const value = inputElement.value;
//     connection
//         .send("NewMessage", username, value)
//         .then(() => (inputElement.value = ""));
// };

// document.querySelector("#sendButton")?.addEventListener("click", () => {
//     send();
// });
