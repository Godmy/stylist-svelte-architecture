import type { SceneAtom } from '$stylist/graph/interface/slot/scene-atom';
import type { SceneMolecule } from '$stylist/graph/interface/slot/scene-molecule';
import type { GraphConnection } from '$stylist/graph/interface/slot/graph-connection';
import type { GraphNode } from '$stylist/graph/interface/slot/graph-scene-node';
import type { SceneCameraPreset } from '$stylist/graph/type/alias/scene-camera-preset';

export interface SceneGraph {
	id: string;
	label: string;
	nodes: readonly GraphNode[];
	connections: readonly GraphConnection[];
	molecules: readonly SceneMolecule[];
	atoms: readonly SceneAtom[];
	boundsRadius: number;
	focusTarget: {
		x: number;
		y: number;
		z: number;
	};
	defaultPreset: SceneCameraPreset;
}
