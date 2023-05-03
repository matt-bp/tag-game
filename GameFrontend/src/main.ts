import "./style.css";
import SceneManager from "./scenes/SceneManager";

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

        const animate = () => {
            sceneManager.getCurrentScene().update();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            sceneManager.getCurrentScene().render(ctx);

            requestAnimationFrame(animate);
        };

        animate();
    }
}
