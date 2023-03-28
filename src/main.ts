import "./style.css";
import { Camera } from "./camera";
import { Sprite } from "./sprite";
import collisions from "../data/collisions.json";
import { Boundary } from "./Boundary";
import { rectangularCollision } from "./collisions";

const indexIntoCollisions = (row: number, col: number) => {
  const index = col * collisions.width + row;
  return collisions.data[index];
};

const obstacleHere = (row: number, col: number) => {
  return indexIntoCollisions(row, col) != 0;
};

const canvas = document.querySelector("#app") as HTMLCanvasElement;
const speed = 3;

const playerSprites = {
  down: new Sprite({
    url: "/assets/playerDown.png",
    x: canvas.width / 2,
    y: canvas.height / 2,
    frames: 4,
    absolute: true,
  }),
  right: new Sprite({
    url: "/assets/playerRight.png",
    x: canvas.width / 2,
    y: canvas.height / 2,
    frames: 4,
    absolute: true,
  }),
  up: new Sprite({
    url: "/assets/playerUp.png",
    x: canvas.width / 2,
    y: canvas.height / 2,
    frames: 4,
    absolute: true,
  }),
  left: new Sprite({
    url: "/assets/playerLeft.png",
    x: canvas.width / 2,
    y: canvas.height / 2,
    frames: 4,
    absolute: true,
  }),
};

let currentPlayerSprite: "down" | "right" | "up" | "left" = "down";

const getCurrentSprite = () => {
  return playerSprites[currentPlayerSprite];
};

if (!canvas) {
  console.error("Canvas not found");
} else {
  console.log(canvas.clientWidth);

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Context not initialized");
  } else {
    const camera = new Camera(390, 700);
    // const camera = new Camera(0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gameMap = new Sprite({ url: "/assets/GameMap.png", x: 0, y: 0 });

    const gameMapForeground = new Sprite({
      url: "/assets/GameMap_Foreground.png",
      x: 0,
      y: 0,
    });

    const boundaries: Boundary[] = [];

    for (let row = 0; row < collisions.width; row++) {
      for (let col = 0; col < collisions.height; col++) {
        if (obstacleHere(row, col)) {
          boundaries.push(
            new Boundary({
              x: row * Boundary.size,
              y: col * Boundary.size,
            })
          );
        }
      }
    }

    const drawImages = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      gameMap.draw(ctx, camera);

      getCurrentSprite().draw(ctx, camera);

      gameMapForeground.draw(ctx, camera);

      // for (let boundary of boundaries) {
      //   boundary.draw(ctx, camera);
      // }
    };

    const keyPressed: Record<string, boolean> = {};
    let noMovement = true;

    const processInput = () => {
      let direction = { x: 0, y: 0 };

      noMovement = true;

      if (keyPressed["s"]) {
        currentPlayerSprite = "down";
        noMovement = false;
        direction.y += speed;
      }

      if (keyPressed["w"]) {
        currentPlayerSprite = "up";
        noMovement = false;
        direction.y -= speed;
      }

      if (keyPressed["d"]) {
        currentPlayerSprite = "right";
        noMovement = false;
        direction.x += speed;
      }

      if (keyPressed["a"]) {
        currentPlayerSprite = "left";
        noMovement = false;
        direction.x -= speed;
      }

      camera.x += direction.x;
      camera.y += direction.y;
    };

    const handleCollision = () => {
      console.log("collision!");

      if (keyPressed["s"]) {
        camera.y -= speed;
      }

      if (keyPressed["w"]) {
        camera.y += speed;
      }

      if (keyPressed["d"]) {
        camera.x -= speed;
      }

      if (keyPressed["a"]) {
        camera.x += speed;
      }
    };

    const detectCollisions = () => {
      const playerRectangle = {
        x: camera.x + getCurrentSprite().x,
        y: camera.y + getCurrentSprite().y,
        width: getCurrentSprite().getWidth(),
        height: getCurrentSprite().getHeight(),
      };

      for (let i = 0; i < boundaries.length; i++) {
        const boundaryRectangle = {
          x: boundaries[i].getX(),
          y: boundaries[i].getY(),
          width: Boundary.size,
          height: Boundary.size,
        };

        if (rectangularCollision(playerRectangle, boundaryRectangle)) {
          handleCollision();
          break;
        }
      }
    };

    const updateAnimations = () => {
      if (noMovement) return;
      getCurrentSprite().updateAnimation();
    };

    const animate = () => {
      processInput();

      detectCollisions();

      updateAnimations();

      drawImages();

      requestAnimationFrame(animate);
    };

    window.addEventListener("keydown", (ev) => {
      keyPressed[ev.key] = true;
    });

    window.addEventListener("keyup", (ev) => {
      keyPressed[ev.key] = false;
    });
    animate();
  }
}
