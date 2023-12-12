import { text } from "../graphics/drawing";
import Keyboard from "../io/keyboard";
import { IScene } from "./IScene";

export default class MainMenu implements IScene {
    #keyboard: Keyboard | undefined;
    #input: string = "";
    #alreadyHandled: Record<string, boolean> = {};
    #demoImage: HTMLImageElement;
    #bgImage: HTMLImageElement;
    #currentBgProgressX: number = 0;
    #progressMultiplierX = 0.001;
    #currentBgProgressY: number = 0;
    #progressMultiplierY = 0.00001;

    constructor(
        initialUsername: string,
        private readonly width: number,
        private readonly height: number,
        private readonly next: (value: string) => void,
        private readonly error?: string
    ) {
        this.#input = initialUsername;
        this.#keyboard = new Keyboard();
        this.#demoImage = new Image();
        this.#demoImage.src = "/assets/GameMapFinalSmall.png";
        this.#bgImage = new Image();
        this.#bgImage.src = "/assets/GameMapFinal.png";
    }

    end(): void {
        this.#keyboard?.dispose();
    }

    update(dt: number): void {
        if (!this.#keyboard) return;

        this.#currentBgProgressX += dt * this.#progressMultiplierX;
        if (this.#currentBgProgressX > 1) {
            this.#currentBgProgressX *= -1;
        }

        this.#currentBgProgressY += dt * this.#progressMultiplierY;
        if (this.#currentBgProgressY > 1) {
            this.#currentBgProgressY *= -1;
        }

        if (this.#keyboard.keyPressed["Backspace"]) {
            this.#input = this.#input.slice(0, -1);
        } else if (this.#keyboard.keyPressed["Enter"]) {
            if (this.#input.length == 0) return;
            this.next(this.#input);
        } else {
            if (this.#input.length >= 10) return;

            let keys = Object.keys(this.#keyboard.keyPressed);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].length > 1) continue;

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
        // ctx.save();
        // ctx.fillStyle = "white";
        // ctx.fillRect(0, 0, this.width, this.height);
        // ctx.restore();

        ctx.save();
        const bgImageX = this.#bgImage.width * this.#currentBgProgressX;
        const bgImageY = this.#bgImage.height * this.#currentBgProgressY;
        ctx.scale(0.5, 0.5);
        ctx.drawImage(this.#bgImage, -bgImageX, -bgImageY);
        ctx.restore();

        ctx.fillStyle = "white";

        const containerWidth = 500;
        const containerHeight = 300;
        ctx.fillRect(
            (this.width - containerWidth) / 2,
            (this.height - containerHeight) / 2,
            containerWidth,
            containerHeight
        );

        const center = this.width / 2;
        const textAlignLeft = center - 200;
        const textAlignTopStart = 180;
        text(ctx, textAlignLeft, textAlignTopStart, "Tag", "2.5rem Arial");
        text(
            ctx,
            textAlignLeft,
            textAlignTopStart + 75,
            "You'll play tag with your friends!"
        );

        text(
            ctx,
            textAlignLeft,
            textAlignTopStart + 150,
            "Type your username and press enter to join:"
        );
        text(
            ctx,
            textAlignLeft,
            textAlignTopStart + 180,
            `>${this.#input}`,
            "1rem Arial",
            "#135200"
        );

        // text(
        //     ctx,
        //     10,
        //     300,
        //     "Use WASD to move around, press Escape to exit back to this screen."
        // );

        if (this.error) {
            text(
                ctx,
                textAlignLeft,
                textAlignTopStart + 220,
                this.error,
                "1rem Arial",
                "red"
            );
        }

        const demoImageX = 580;
        const demoImageY = textAlignTopStart;

        // Border
        ctx.fillStyle = "black";
        ctx.fillRect(
            demoImageX - 2,
            demoImageY - 2,
            this.#demoImage.width + 4,
            this.#demoImage.height + 4
        );

        ctx.drawImage(this.#demoImage, demoImageX, demoImageY);

        // text(
        //     ctx,
        //     10,
        //     400,
        //     "How to win: spend the least amount of time as the chaser, or as the chaser, tag more than 10 people, or be the only chaser."
        // );
        // text(ctx, 10, 450, "Rounds last 1 minute.");
        // text(ctx, 10, 500, "Starts after 3 players have joined");
    }
}
