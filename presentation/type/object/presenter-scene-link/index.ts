import type { SceneNode } from '$stylist/canvas/interface/slot/scene-node';

export type PresenterSceneLink = {
	id: string;
	from: SceneNode;
	to: SceneNode;
};
