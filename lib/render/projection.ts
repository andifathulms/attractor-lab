export type Rotation = {
  readonly yaw: number;
  readonly pitch: number;
};

export type ProjectionConfig = {
  readonly rotation: Rotation;
  readonly zoom: number;
  readonly width: number;
  readonly height: number;
};

export type ScreenPoint = {
  readonly x: number;
  readonly y: number;
};

/**
 * Orthographic projection of a 3D point onto screen space, rotated by
 * `rotation` (yaw around the vertical axis, then pitch around the horizontal
 * axis) and scaled/centered by `zoom` and the canvas dimensions.
 */
export function project(point: Float64Array, config: ProjectionConfig): ScreenPoint {
  const x = point[0] as number;
  const y = point[1] as number;
  const z = point[2] as number;
  const { yaw, pitch } = config.rotation;

  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const x1 = x * cosYaw - z * sinYaw;
  const z1 = x * sinYaw + z * cosYaw;

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const y1 = y * cosPitch - z1 * sinPitch;

  return {
    x: config.width / 2 + x1 * config.zoom,
    y: config.height / 2 - y1 * config.zoom,
  };
}
