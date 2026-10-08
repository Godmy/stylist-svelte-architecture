import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';

export interface RecipeStage extends LayoutHTMLAttributes<HTMLDivElement> {
	class?: string;
	camera: {
		x: number;
		y: number;
		zoom: number;
	};
	worldWidth?: number;
	worldHeight?: number;
}
