import "./style.css";
import SceneManager from "./scenes/SceneManager";
import { makeUpdateLoop } from "./core/update-loop";

const canvas = document.querySelector("#app") as HTMLCanvasElement;

if (!canvas) {
    console.error("Canvas not found");
} else {
    console.log(canvas.clientWidth);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        console.error("Context not initialized");
    } else {
        const sceneManager = new SceneManager(canvas.width, canvas.height);

        const loop = makeUpdateLoop(
            (dt) => sceneManager.getCurrentScene().update(dt),
            () => sceneManager.getCurrentScene().render(ctx)
        );

        loop(0);
    }
}
