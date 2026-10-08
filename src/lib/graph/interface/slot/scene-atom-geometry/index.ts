export interface SceneAtomGeometry {
	type: 'cube' | 'box';
	width?: number;
	height?: number;
	depth?: number;
	color?: readonly [number, number, number];
}
