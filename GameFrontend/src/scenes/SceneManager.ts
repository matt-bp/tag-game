import { STORAGE_USERNAME } from "../helpers/storage";
import { IScene } from "./IScene";
import MainMenu from "./MainMenu";
import PlayScene from "./PlayScene";

type Scene = "Menu" | "Play";

export default class SceneManager {
    #scene: IScene;

    constructor(
        private readonly width: number,
        private readonly height: number
    ) {
        this.#scene = this.createMainMenu();
    }

    getCurrentScene = () => {
        return this.#scene;
    };

    private transition = (from: Scene) => {
        if (from == "Menu") {
            return (value?: string) => {
                localStorage.setItem(STORAGE_USERNAME, value ?? "");
                this.#scene.end();
                this.#scene = this.createPlayScene();
            };
        } else if (from == "Play") {
            return () => {
                this.#scene.end();
                this.#scene = this.createMainMenu();
            };
        }

        throw new Error("Not implemented");
    };

    private createMainMenu = () => {
        let username = localStorage.getItem(STORAGE_USERNAME) || "";
        return new MainMenu(
            username,
            this.width,
            this.height,
            this.transition("Menu")
        );
    };

    private createPlayScene = () => {
        return new PlayScene(this.width, this.height, this.transition("Play"));
    };
}
