import type { TokenZIndex } from '$stylist/design-token/type/alias/z-index';

export interface SceneNode {
	id: string;
	title: string;
	label?: string;
	description?: string;
	iconText?: string;
	position: import('../scene-node-point').SceneNodePoint;
	depth: number;
	accent: string;
	layer?: TokenZIndex;
	children?: readonly SceneNode[];
}
