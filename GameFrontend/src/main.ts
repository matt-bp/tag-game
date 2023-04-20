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

        const animate = () => {
            scene.update();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            scene.render(ctx);

            requestAnimationFrame(animate);
        };

        animate();
    }
}
