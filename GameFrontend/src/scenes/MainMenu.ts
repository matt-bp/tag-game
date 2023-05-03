import { text } from "../graphics/drawing";
import Keyboard from "../io/keyboard";
import { IScene } from "./IScene";

export default class MainMenu implements IScene {
    #keyboard: Keyboard | undefined;
    #input: string = "";
    #alreadyHandled: Record<string, boolean> = {};

    constructor(
        initialUsername: string,
        private readonly width: number,
        private readonly height: number,
        private readonly next: (value: string) => void
    ) {
        this.#input = initialUsername;
        this.#keyboard = new Keyboard();
    }

    end(): void {
        this.#keyboard?.dispose();
    }

    update(): void {
        if (!this.#keyboard) return;

        if (this.#keyboard.keyPressed["Backspace"]) {
            this.#input = this.#input.slice(0, -1);
        } else if (this.#keyboard.keyPressed["Enter"]) {
            if (this.#input.length == 0) return;
            this.next(this.#input);
        } else {
            if (this.#input.length >= 10) return;

            let keys = Object.keys(this.#keyboard.keyPressed);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] == "Control") continue;

                if (!this.#alreadyHandled[keys[i]]) {
                    this.#input += keys[i];
                    this.#alreadyHandled[keys[i]] = true;
                }
            }

            let handledKeys = Object.keys(this.#alreadyHandled);
            for (let i = 0; i < handledKeys.length; i++) {
                // If the key is no longer pressed
                if (!this.#keyboard.keyPressed[handledKeys[i]]) {
                    // Remove it from the already handled list
                    delete this.#alreadyHandled[handledKeys[i]];
                }
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();

        text(ctx, 10, 10, "Tag", "2rem Arial");
        text(ctx, 10, 45, "You'll play tag with your friends!");

        text(ctx, 10, 100, "Type username and press enter to join:");
        text(ctx, 10, 125, this.#input, "1rem Arial", "red");

        text(
            ctx,
            10,
            300,
            "Use WASD to move around, press Escape to exit back to this screen."
        );

        text(
            ctx,
            10,
            400,
            "How to win: spend the least amount of time as the chaser, or as the chaser, tag more than 10 people, or be the only chaser."
        );
        text(ctx, 10, 450, "Rounds last 1 minute.");
        text(ctx, 10, 500, "Starts after 3 players have joined");
    }
}
