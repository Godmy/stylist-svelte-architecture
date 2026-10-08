import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';

export interface RecipeViewport extends LayoutHTMLAttributes<HTMLDivElement> {
	class?: string;
	camera: {
		x: number;
		y: number;
		zoom: number;
	};
	interactive?: boolean;
	showGrid?: boolean;
	worldWidth?: number;
	worldHeight?: number;
}
