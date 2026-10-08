import type { SceneMaterialKind } from '$stylist/graph/type/alias/scene-material-kind';

export const MATERIAL_PALETTE: Record<SceneMaterialKind, readonly [number, number, number]> = {
	solid: [0.82, 0.86, 0.92],
	'matte-panel': [0.18, 0.2, 0.25],
	'axis-emissive': [1, 0.44, 0.36],
	surface: [0.055, 0.07, 0.105],
	'grid-line': [0.16, 0.21, 0.27],
	accent: [0.34, 0.79, 0.92],
	muted: [0.48, 0.55, 0.64],
	'node-core': [0.86, 0.91, 0.96],
	'node-halo': [0.2, 0.74, 0.9],
	connection: [0.28, 0.58, 0.72],
	'connection-strong': [1, 0.72, 0.38]
};
