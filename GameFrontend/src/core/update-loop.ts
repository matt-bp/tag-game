export function makeUpdateLoop(
    update: (dt: number) => void,
    render: () => void
) {
    let previousTimeStamp = 0;

    return function loop(timeStamp: DOMHighResTimeStamp) {
        const dt = (timeStamp - previousTimeStamp) / 1000; // convert to seconds
        previousTimeStamp = timeStamp;

        update(dt);

        render();

        requestAnimationFrame(loop);
    };
}
