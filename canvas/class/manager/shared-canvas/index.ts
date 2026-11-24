import { SHARED_CANVAS_ACTION_ICONS } from '$stylist/canvas/const/map/canvas-action-icons';
import { SHARED_CANVAS_TOOL_DEFINITIONS } from '$stylist/canvas/const/record/canvas-tool-definitions';
import { CANVAS_FONT_FAMILY } from '$stylist/canvas/const/map/canvas-font-family';
import type { SharedCanvasToolDefinition } from '$stylist/canvas/type/alias/shared-canvas-tool-definition';
import type { SharedCanvasTool } from '$stylist/canvas/type/alias/shared-canvas-tool';
import type { CanvasFontFamily } from '$stylist/canvas/type/alias/canvas-font-family';
import type { CanvasFont } from '$stylist/canvas/type/object/canvas-font';
import type { RecipeSharedCanvas } from '$stylist/canvas/interface/recipe/shared-canvas';
import type { SlotSharedCanvasObjectBounds } from '$stylist/canvas/interface/slot/shared-canvas-object-bounds';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';
import { CanvasGeometryManager } from '$stylist/canvas/class/manager/canvas-geometry';
import { CanvasShapeManager } from '$stylist/canvas/class/manager/canvas-shape';

/** Static configuration and prop helpers of the SharedCanvas whiteboard. */
export class ObjectManagerSharedCanvas {
	static readonly toolDefinitions: readonly SharedCanvasToolDefinition[] =
		SHARED_CANVAS_TOOL_DEFINITIONS;

	static readonly actionIcons = SHARED_CANVAS_ACTION_ICONS;

	static readonly exportFilename = 'shared-canvas.json';

	static readonly strokeWidths = [1, 2, 4, 8] as const;

	static readonly fontSizes = [12, 14, 16, 20, 24, 32, 48, 64] as const;

	static readonly fontFamilies = Object.keys(CANVAS_FONT_FAMILY) as CanvasFontFamily[];

	static findToolByKey(key: string): SharedCanvasTool | null {
		const lower = key.toLowerCase();
		return SHARED_CANVAS_TOOL_DEFINITIONS.find((tool) => tool.key === lower)?.id ?? null;
	}

	/** Inline CSS of a canvas font; `size` is in world pixels. */
	static getFontStyle(font: CanvasFont | undefined, fallbackSize = 20): string {
		const decorations = [
			`font-family: ${CANVAS_FONT_FAMILY[font?.family ?? 'sans']}`,
			`font-size: ${font?.size ?? fallbackSize}px`,
			`font-weight: ${font?.bold ? 700 : 400}`,
			`font-style: ${font?.italic ? 'italic' : 'normal'}`,
			`text-decoration: ${font?.underline ? 'underline' : 'none'}`,
			`text-align: ${font?.align ?? 'left'}`
		];
		return decorations.join('; ');
	}

	/** Absolute position and size of a box in world pixels. */
	static getBoxStyle(box: SlotSharedCanvasObjectBounds): string {
		return `left: ${box.x}px; top: ${box.y}px; width: ${box.width}px; height: ${box.height}px;`;
	}

	/**
	 * SVG frame of a line or freehand path: the element covers the points'
	 * bounds plus room for the stroke and arrowhead; `d` and `head` use world
	 * coordinates through `viewBox`.
	 */
	static getStrokeFrame(object: Extract<CanvasObject, { type: 'line' | 'path' }>): {
		style: string;
		viewBox: string;
		d: string;
		head: string;
	} {
		const strokeWidth = object.strokeWidth ?? 2;
		const headSize = 6 + strokeWidth * 3;
		const isArrow = object.type === 'line' && Boolean(object.arrow);
		const padding = strokeWidth + (isArrow ? headSize : 2);
		const bounds = CanvasGeometryManager.getPointsBounds(object.points);
		const box = {
			x: bounds.x - padding,
			y: bounds.y - padding,
			width: bounds.width + padding * 2,
			height: bounds.height + padding * 2
		};
		const d =
			object.points.length === 1
				? `M${object.points[0].x} ${object.points[0].y} l0.01 0`
				: object.points
						.map((point, index) => `${index ? 'L' : 'M'}${point.x} ${point.y}`)
						.join(' ');

		return {
			style: ObjectManagerSharedCanvas.getBoxStyle(box),
			viewBox: `${box.x} ${box.y} ${box.width} ${box.height}`,
			d,
			head:
				isArrow && object.type === 'line'
					? CanvasShapeManager.getArrowHead(object.points[0], object.points[1], headSize)
					: ''
		};
	}

	static getRestProps(contract: RecipeSharedCanvas) {
		const {
			width: _width,
			height: _height,
			objects: _objects,
			users: _users,
			currentUserId: _currentUserId,
			onChange: _onChange,
			onObjectAdd: _onObjectAdd,
			onObjectUpdate: _onObjectUpdate,
			onObjectDelete: _onObjectDelete,
			onCursorMove: _onCursorMove,
			readonly: _readonly,
			showUsers: _showUsers,
			showToolbar: _showToolbar,
			showZoomControls: _showZoomControls,
			showGrid: _showGrid,
			selectedTool: _selectedTool,
			selectedColor: _selectedColor,
			toolbarClass: _toolbarClass,
			canvasClass: _canvasClass,
			variant: _variant,
			role: _role,
			allowedTools: _allowedTools,
			view: _view,
			onViewChange: _onViewChange,
			lockView: _lockView,
			onImageUpload: _onImageUpload,
			class: _class,
			...rest
		} = contract;

		return rest;
	}
}
