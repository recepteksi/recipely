export interface DragReleaseGesture {
  /** Accumulated horizontal distance (px) since the touch started. */
  dx: number;
  /** Accumulated vertical distance (px) since the touch started; positive is downward. */
  dy: number;
  /** Current vertical velocity (px/ms); positive is downward. */
  vy: number;
}
