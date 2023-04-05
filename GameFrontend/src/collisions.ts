interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectangularCollision(
  rectangle1: Rectangle,
  rectangle2: Rectangle
) {
  const onLeftSide = rectangle1.x + rectangle1.width >= rectangle2.x;
  const onRightSide = rectangle1.x <= rectangle2.x + rectangle2.width;
  const onTopSide = rectangle1.y + rectangle1.height >= rectangle2.y;
  const onBottomSide = rectangle1.y <= rectangle2.y + rectangle2.height;

  return onLeftSide && onRightSide && onTopSide && onBottomSide;
}
