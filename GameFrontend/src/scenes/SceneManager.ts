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

    private transition = (from: Scene, error?: string) => {
        if (from == "Menu") {
            return (value?: string) => {
                localStorage.setItem(STORAGE_USERNAME, value ?? "");
                this.#scene.end();
                this.#scene = this.createPlayScene(value ?? "");
            };
        } else if (from == "Play") {
            return () => {
                this.#scene.end();
                this.#scene = this.createMainMenu(error);
            };
        }

        throw new Error("Not implemented");
    };

    private createMainMenu = (error?: string) => {
        let username = localStorage.getItem(STORAGE_USERNAME) || "";
        return new MainMenu(
            username,
            this.width,
            this.height,
            this.transition("Menu"),
            error
        );
    };

    private createPlayScene = (username: string) => {
        return new PlayScene(username, this.width, this.height, (error) => {
            console.log("hi ");
            this.transition("Play", error)();
        });
    };
}
