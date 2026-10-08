import type { SceneAtom } from '$stylist/graph/interface/slot/scene-atom';

export interface SceneMolecule {
	id: string;
	label: string;
	description?: string;
	atoms: readonly SceneAtom[];
}
