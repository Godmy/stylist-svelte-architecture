import type { SceneCamera } from '$stylist/graph/interface/slot/scene-camera';
import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';

export interface RecipePresenterNodeShell {
	node: SceneNode;
	camera: SceneCamera;
	selected?: boolean;
	class?: string;
	onselect?: (node: SceneNode) => void;
}
