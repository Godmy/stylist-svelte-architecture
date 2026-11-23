import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';
import type { SlotSharedCanvasObjectBounds } from '$stylist/canvas/interface/slot/shared-canvas-object-bounds';
import type { SharedCanvasTool } from '$stylist/canvas/type/alias/shared-canvas-tool';

export class CanvasManager {
	static createCanvasObjectId(): string {
		return `obj_${Date.now()}`;
	}

	static cloneCanvasObjects(value: readonly CanvasObject[] = []): CanvasObject[] {
		return value.map((object) =>
			object.type === 'path'
				? { ...object, points: object.points.map((point) => ({ ...point })) }
				: { ...object }
		);
	}

	static createDraftCanvasObject(
		tool: SharedCanvasTool,
		point: Point2D,
		color: string,
		currentUserId?: string
	): CanvasObject | null {
		if (tool === 'select') return null;

		const base = {
			id: CanvasManager.createCanvasObjectId(),
			x: point.x,
			y: point.y,
			color,
			userId: currentUserId
		};

		if (tool === 'rectangle') return { ...base, type: 'rectangle' };
		if (tool === 'circle') return { ...base, type: 'circle' };
		return { ...base, type: 'text' };
	}

	static updateDraftCanvasObject(
		object: CanvasObject,
		tool: SharedCanvasTool,
		startPoint: Point2D,
		currentPoint: Point2D
	): CanvasObject {
		if (tool === 'rectangle' && object.type === 'rectangle') {
			return {
				...object,
				x: Math.min(startPoint.x, currentPoint.x),
				y: Math.min(startPoint.y, currentPoint.y),
				width: Math.abs(currentPoint.x - startPoint.x),
				height: Math.abs(currentPoint.y - startPoint.y)
			};
		}

		if (tool === 'circle' && object.type === 'circle') {
			return {
				...object,
				radius: Math.hypot(currentPoint.x - object.x, currentPoint.y - object.y)
			};
		}

		return object;
	}

	static finalizeDraftCanvasObject(
		object: CanvasObject,
		tool: SharedCanvasTool,
		startPoint: Point2D,
		endPoint: Point2D
	): CanvasObject {
		if (tool === 'rectangle') {
			return CanvasManager.updateDraftCanvasObject(object, tool, startPoint, endPoint);
		}

		if (tool === 'text' && object.type === 'text') {
			return {
				...object,
				text: object.text || 'Text'
			};
		}

		if (tool === 'circle' && object.type === 'circle') {
			return {
				...object,
				radius: object.radius ?? Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y)
			};
		}

		return object;
	}

	static getPathBounds(points: readonly Point2D[]): SlotSharedCanvasObjectBounds {
		const xs = points.map((point) => point.x);
		const ys = points.map((point) => point.y);
		const minX = Math.min(...xs);
		const minY = Math.min(...ys);
		const maxX = Math.max(...xs);
		const maxY = Math.max(...ys);

		return {
			x: minX,
			y: minY,
			width: Math.max(1, maxX - minX),
			height: Math.max(1, maxY - minY)
		};
	}

	static getCanvasObjectBounds(object: CanvasObject): SlotSharedCanvasObjectBounds | null {
		switch (object.type) {
			case 'rectangle':
				if (object.width == null || object.height == null) return null;
				return { x: object.x, y: object.y, width: object.width, height: object.height };
			case 'circle':
				if (object.radius == null) return null;
				return {
					x: object.x - object.radius,
					y: object.y - object.radius,
					width: object.radius * 2,
					height: object.radius * 2
				};
			case 'text': {
				const width = Math.max(64, (object.text?.length ?? 0) * 10);
				return { x: object.x, y: object.y - 18, width, height: 24 };
			}
			case 'path':
				if (!object.points.length) return null;
				return CanvasManager.getPathBounds(object.points);
			default:
				return null;
		}
	}

	static drawCanvasObject(
		ctx: CanvasRenderingContext2D,
		object: CanvasObject,
		isSelected: boolean
	): void {
		ctx.strokeStyle = object.color || '#000000';
		ctx.lineWidth = isSelected ? 3 : 2;
		ctx.fillStyle = object.color || '#000000';

		switch (object.type) {
			case 'rectangle':
				if (object.width && object.height) {
					ctx.strokeRect(object.x, object.y, object.width, object.height);
				}
				break;
			case 'circle':
				if (object.radius) {
					ctx.beginPath();
					ctx.arc(object.x, object.y, object.radius, 0, 2 * Math.PI);
					ctx.stroke();
				}
				break;
			case 'text':
				ctx.font = '16px Arial';
				ctx.fillText(object.text || '', object.x, object.y);
				break;
			case 'path':
				if (object.points.length) {
					ctx.beginPath();
					ctx.moveTo(object.points[0].x, object.points[0].y);
					for (let index = 1; index < object.points.length; index += 1) {
						ctx.lineTo(object.points[index].x, object.points[index].y);
					}
					ctx.stroke();
				}
				break;
		}

		if (!isSelected) return;

		const bounds = CanvasManager.getCanvasObjectBounds(object);
		if (!bounds) return;

		ctx.save();
		ctx.setLineDash([6, 4]);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.lineWidth = 1;
		ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
		ctx.restore();
	}

	static drawCanvasObjects(
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		objects: readonly CanvasObject[],
		selectedObjectId: string | null
	): void {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (const object of objects) {
			CanvasManager.drawCanvasObject(ctx, object, object.id === selectedObjectId);
		}
	}

	static hitTestCanvasObject(
		objects: readonly CanvasObject[],
		point: Point2D
	): CanvasObject | null {
		for (let index = objects.length - 1; index >= 0; index -= 1) {
			const object = objects[index];
			const bounds = CanvasManager.getCanvasObjectBounds(object);

			if (!bounds) continue;

			const withinBounds =
				point.x >= bounds.x &&
				point.x <= bounds.x + bounds.width &&
				point.y >= bounds.y &&
				point.y <= bounds.y + bounds.height;

			if (withinBounds) {
				return object;
			}
		}

		return null;
	}

	static getCanvasPointerPosition(event: MouseEvent, canvas: HTMLCanvasElement): Point2D {
		const rect = canvas.getBoundingClientRect();

		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	static exportCanvasImage(canvas: HTMLCanvasElement | null | undefined, filename: string): void {
		if (!canvas) return;

		const link = document.createElement('a');
		link.download = filename;
		link.href = canvas.toDataURL();
		link.click();
	}
}
