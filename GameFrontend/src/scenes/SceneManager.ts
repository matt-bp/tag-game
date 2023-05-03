import { STORAGE_USERNAME } from "../helpers/storage";
import { IScene } from "./IScene";
import MainMenu from "./MainMenu";
import PlayScene from "./PlayScene";

export default class SceneManager {
    #scene: IScene;

    constructor(
        private readonly width: number,
        private readonly height: number
    ) {
        let username = localStorage.getItem(STORAGE_USERNAME) || "";
        this.#scene = new MainMenu(
            username,
            width,
            height,
            this.transition("Menu")
        );
    }

    getCurrentScene = () => {
        return this.#scene;
    };

    private transition = (from: "Menu") => {
        if (from == "Menu") {
            return (value: string) => {
                localStorage.setItem(STORAGE_USERNAME, value);
                this.#scene.end();
                this.#scene = new PlayScene(this.width, this.height);
            };
        }

        throw new Error("Not implemented");
    };
}
