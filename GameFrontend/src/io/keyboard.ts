export default class Keyboard {
    public keyPressed: Record<string, boolean> = {};

    constructor() {
        window.addEventListener("keydown", this.#onKeyPressed);

        window.addEventListener("keyup", this.#onKeyUp);
    }

    #onKeyPressed = (ev: KeyboardEvent) => {
        this.keyPressed[ev.key] = true;
    };

    #onKeyUp = (ev: KeyboardEvent) => {
        delete this.keyPressed[ev.key];
    };

    public dispose() {
        window.removeEventListener("keydown", this.#onKeyPressed);

        window.removeEventListener("keyup", this.#onKeyUp);
    }
}
