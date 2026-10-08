import type { MinimapBounds } from '$stylist/workspace/interface/slot/minimap-bounds';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { RecipeWorkspaceNode } from '$stylist/workspace/interface/recipe/workspace-node';

export class MinimapManager {
	static projectSceneCoordinate(value: number, offset: number, zoom: number): number {
		return (value - offset) * zoom;
	}

	static resolveBounds(nodes: readonly RecipeWorkspaceNode[]): MinimapBounds {
		return {
			minX: nodes.length === 0 ? 0 : Math.min(...nodes.map((node) => node.x)),
			minY: nodes.length === 0 ? 0 : Math.min(...nodes.map((node) => node.y)),
			maxX:
				nodes.length === 0 ? 800 : Math.max(...nodes.map((node) => node.x + (node.width ?? 200))),
			maxY:
				nodes.length === 0
					? 600
					: Math.max(
							...nodes.map((node) => node.y + (typeof node.height === 'number' ? node.height : 100))
						)
		};
	}

	static resolveCanvasPoint(
		clientPoint: Point2D,
		rect: DOMRect,
		width: number,
		height: number,
		bounds: MinimapBounds
	): Point2D {
		const x = clientPoint.x - rect.left;
		const y = clientPoint.y - rect.top;

		return {
			x: ((x - width / 2) / width) * (bounds.maxX - bounds.minX),
			y: ((y - height / 2) / height) * (bounds.maxY - bounds.minY)
		};
	}

	static resolveFitOffset(bounds: MinimapBounds): Point2D {
		const contentWidth = bounds.maxX - bounds.minX;
		const contentHeight = bounds.maxY - bounds.minY;

		return {
			x: -bounds.minX - contentWidth / 2,
			y: -bounds.minY - contentHeight / 2
		};
	}

	static resolveFitZoom(bounds: MinimapBounds, width: number, height: number): number {
		if (bounds.maxX - bounds.minX <= 0 || bounds.maxY - bounds.minY <= 0) return 1;

		return Math.min(width / (bounds.maxX - bounds.minX), height / (bounds.maxY - bounds.minY), 1);
	}

	static resolveNodeRect(
		node: RecipeWorkspaceNode,
		bounds: MinimapBounds,
		width: number,
		height: number
	): { x: number; y: number; width: number; height: number } {
		const nodeWidth = node.width ?? 200;
		const nodeHeight = typeof node.height === 'number' ? node.height : 100;
		const xRange = bounds.maxX - bounds.minX || 1;
		const yRange = bounds.maxY - bounds.minY || 1;

		return {
			x: ((node.x - bounds.minX) / xRange) * (width - 20) + 10,
			y: ((node.y - bounds.minY) / yRange) * (height - 20) + 10,
			width: (nodeWidth / xRange) * (width - 20),
			height: (nodeHeight / yRange) * (height - 20)
		};
	}

	static resolveOffsetForPoint(point: Point2D, miniMapZoom: number): Point2D {
		return {
			x: -point.x * miniMapZoom,
			y: -point.y * miniMapZoom
		};
	}

	static resolveViewport(
		offset: Point2D,
		zoom: number,
		width: number,
		height: number,
		miniMapZoom: number
	): { x: number; y: number; width: number; height: number } {
		return {
			x: (-offset.x / miniMapZoom) * (width / 800),
			y: (-offset.y / miniMapZoom) * (height / 600),
			width: (800 / zoom) * (width / 800),
			height: (600 / zoom) * (height / 600)
		};
	}
}
