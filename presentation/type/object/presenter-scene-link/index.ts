import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';

export type PresenterSceneLink = {
	id: string;
	from: SceneNode;
	to: SceneNode;
};
