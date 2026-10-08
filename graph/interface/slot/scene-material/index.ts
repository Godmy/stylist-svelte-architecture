import type { SceneMaterialKind } from '$stylist/graph/type/alias/scene-material-kind';

export interface SceneMaterial {
	kind: SceneMaterialKind;
	color?: readonly [number, number, number];
}
