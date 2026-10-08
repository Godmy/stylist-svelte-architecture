import type { SceneAtomKind } from '$stylist/graph/type/alias/scene-atom-kind';
import type { SceneAtomGeometry } from '$stylist/graph/interface/slot/scene-atom-geometry';
import type { SceneAtomMetadata } from '$stylist/graph/interface/slot/scene-atom-metadata';
import type { SceneAtomMotion } from '$stylist/graph/interface/slot/scene-atom-motion';
import type { SceneAtomTransform } from '$stylist/graph/interface/slot/scene-atom-transform';
import type { SceneMaterial } from '$stylist/graph/interface/slot/scene-material';

export interface SceneAtom {
	id: string;
	kind: SceneAtomKind;
	geometry: SceneAtomGeometry;
	material?: SceneMaterial;
	transform: SceneAtomTransform;
	motion?: SceneAtomMotion;
	metadata?: SceneAtomMetadata;
	moleculeId?: string;
	selectable?: boolean;
	boundsRadius?: number;
	visible?: boolean;
}
