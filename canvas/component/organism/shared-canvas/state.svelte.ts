import { untrack } from 'svelte';
import { CanvasManager } from '$stylist/canvas/class/manager/canvas';
import { CanvasBoardManager } from '$stylist/canvas/class/manager/canvas-board';
import { CanvasGeometryManager } from '$stylist/canvas/class/manager/canvas-geometry';
import { CanvasHistoryManager } from '$stylist/canvas/class/manager/canvas-history';
import { CanvasViewportManager } from '$stylist/canvas/class/manager/canvas-viewport';
import { ObjectManagerSharedCanvas } from '$stylist/canvas/class/manager/shared-canvas';
import { CANVAS_ZOOM_LIMITS } from '$stylist/canvas/const/map/canvas-zoom-limits';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { SlotSharedCanvasObjectBounds } from '$stylist/canvas/interface/slot/shared-canvas-object-bounds';
import type { RecipeSharedCanvas } from '$stylist/canvas/interface/recipe/shared-canvas';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';
import type { CanvasShapeKind } from '$stylist/canvas/type/alias/canvas-shape-kind';
import type { SharedCanvasTool } from '$stylist/canvas/type/alias/shared-canvas-tool';
import type { CanvasBoardStyle } from '$stylist/canvas/type/object/canvas-board-style';
import type { CanvasFont } from '$stylist/canvas/type/object/canvas-font';
import type { CanvasViewport } from '$stylist/canvas/type/object/canvas-viewport';
import type { CanvasResizeHandle } from '$stylist/canvas/type/alias/canvas-resize-handle';
import type { TokenIconName } from '$stylist/svg/type/alias/icon-name';

/**
 * Whiteboard state: objects with undo/redo, viewport, tools, selection,
 * pointer gestures (pan, move, resize, draw, marquee, erase), text editing
 * and keyboard shortcuts. Pointer handlers take the viewport element so
 * screen points are measured against it.
 */
export function createSharedCanvasState(getContract: () => RecipeSharedCanvas) {
	const contract = $derived(getContract());
	const readonly = $derived(contract.readonly ?? false);

	const initialObjects = untrack(() => CanvasManager.cloneCanvasObjects(contract.objects ?? []));
	let objects = $state<CanvasObject[]>(initialObjects);
	let history = $state(
		CanvasHistoryManager.create(CanvasManager.cloneCanvasObjects(initialObjects))
	);
	let tool = $state<SharedCanvasTool>(untrack(() => contract.selectedTool ?? 'select'));
	let style = $state<CanvasBoardStyle>(
		untrack(() => ({
			...CanvasBoardManager.defaultStyle,
			color:
				contract.selectedColor ??
				contract.users?.find((user) => user.id === contract.currentUserId)?.color ??
				CanvasBoardManager.defaultStyle.color
		}))
	);
	let viewport = $state<CanvasViewport>(CanvasViewportManager.initial);
	let viewportSize = $state({ width: 0, height: 0 });
	let rootElement = $state<HTMLDivElement | null>(null);
	let viewportElement = $state<HTMLDivElement | null>(null);
	let editorElement = $state<HTMLTextAreaElement | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedIds = $state<string[]>([]);
	let editingId = $state<string | null>(null);
	let openMenu = $state<'shape' | 'icon' | null>(null);
	let marquee = $state<SlotSharedCanvasObjectBounds | null>(null);
	let draft = $state<CanvasObject | null>(null);
	let spacePressed = $state(false);
	let panning = $state(false);

	/** Pending text object: created by the text tool, committed when editing ends. */
	let pendingId: string | null = null;
	let gesture:
		| { kind: 'pan'; last: Point2D }
		| { kind: 'move'; start: Point2D; base: CanvasObject[]; ids: Set<string> }
		| { kind: 'resize'; handle: CanvasResizeHandle; original: CanvasObject; base: CanvasObject[] }
		| { kind: 'draw'; start: Point2D; startScreen: Point2D; dragged: boolean }
		| { kind: 'marquee'; start: Point2D; initial: string[] }
		| { kind: 'erase' }
		| null = null;

	const selectedSet = $derived(new Set(selectedIds));
	const selectedObjects = $derived(objects.filter((object) => selectedSet.has(object.id)));
	const selectionBounds = $derived(CanvasGeometryManager.getGroupBounds(selectedObjects));
	const singleSelected = $derived(selectedObjects.length === 1 ? selectedObjects[0] : null);
	const canUndo = $derived(CanvasHistoryManager.canUndo(history));
	const canRedo = $derived(CanvasHistoryManager.canRedo(history));
	const layers = $derived.by(() => {
		const all = draft ? [...objects, draft] : objects;
		return [
			...all.filter((object) => object.type === 'frame'),
			...all.filter((object) => object.type !== 'frame')
		];
	});
	const editingObject = $derived(objects.find((object) => object.id === editingId) ?? null);
	const cursor = $derived.by(() => {
		if (panning) return 'grabbing';
		if (tool === 'hand' || spacePressed) return 'grab';
		if (readonly || tool === 'select') return 'default';
		if (tool === 'text') return 'text';
		return 'crosshair';
	});
	/** Objects the style panel edits: the selection, or nothing when only a tool is active. */
	const styleTargets = $derived(readonly ? [] : selectedObjects);
	const showStylePanel = $derived(
		!readonly && (selectedObjects.length > 0 || CanvasBoardManager.isCreationTool(tool))
	);
	const styleKinds = $derived.by(() => {
		const types = new Set(
			styleTargets.length ? styleTargets.map((object) => object.type) : [toolObjectType(tool)]
		);
		return {
			fill: types.has('shape') || types.has('sticky') || types.has('frame'),
			stroke: types.has('shape') || types.has('line') || types.has('path'),
			font: types.has('text') || types.has('sticky') || types.has('shape'),
			color: !types.has('frame') || types.size > 1
		};
	});
	const activeFont = $derived.by((): CanvasFont => {
		const target = styleTargets.find(
			(object) => object.type === 'text' || object.type === 'sticky' || object.type === 'shape'
		);
		return target && 'font' in target && target.font
			? { ...style.font, ...target.font }
			: style.font;
	});
	const activeColor = $derived(styleTargets[0]?.color ?? style.color);
	const activeFill = $derived.by(() => {
		const target = styleTargets.find((object) => 'fill' in object);
		return target && 'fill' in target ? (target.fill ?? 'transparent') : style.fill;
	});
	const activeStrokeWidth = $derived.by(() => {
		const target = styleTargets.find((object) => 'strokeWidth' in object);
		return target && 'strokeWidth' in target ? (target.strokeWidth ?? 2) : style.strokeWidth;
	});
	const zoomPercent = $derived(Math.round(viewport.zoom * 100));
	const gridStyle = $derived.by(() => {
		if (!(contract.showGrid ?? true)) return '';
		const step = 24 * viewport.zoom;
		return `background-size: ${step}px ${step}px; background-position: ${viewport.x}px ${viewport.y}px;`;
	});
	const restProps = $derived.by(() => ObjectManagerSharedCanvas.getRestProps(contract));

	function toolObjectType(value: SharedCanvasTool): CanvasObject['type'] {
		switch (value) {
			case 'pen':
				return 'path';
			case 'line':
			case 'arrow':
				return 'line';
			case 'shape':
			case 'text':
			case 'sticky':
			case 'frame':
			case 'icon':
				return value;
			default:
				return 'shape';
		}
	}

	function getScreenPoint(
		event: Pick<MouseEvent, 'clientX' | 'clientY'>,
		element: Element
	): Point2D {
		const rect = element.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	function notify(before: readonly CanvasObject[], after: readonly CanvasObject[]): void {
		const diff = CanvasManager.diffCanvasObjects(before, after);
		if (!diff.added.length && !diff.updated.length && !diff.removed.length) return;

		for (const object of diff.added)
			contract.onObjectAdd?.(CanvasManager.cloneCanvasObjects([object])[0]);
		for (const object of diff.updated)
			contract.onObjectUpdate?.(CanvasManager.cloneCanvasObjects([object])[0]);
		for (const id of diff.removed) contract.onObjectDelete?.(id);
		contract.onChange?.(CanvasManager.cloneCanvasObjects(after));
	}

	/** Records `next` as a history step and notifies listeners. */
	function commit(next: CanvasObject[]): void {
		const before = history.present;
		objects = next;
		if (CanvasManager.areCanvasObjectsEqual(before, next)) return;

		const snapshot = CanvasManager.cloneCanvasObjects(next);
		history = CanvasHistoryManager.push(history, snapshot);
		notify(before, snapshot);
	}

	function restore(next: CanvasObject[]): void {
		objects = CanvasManager.cloneCanvasObjects(next);
		const ids = new Set(objects.map((object) => object.id));
		selectedIds = selectedIds.filter((id) => ids.has(id));
		editingId = null;
		pendingId = null;
	}

	/** Adopts a new `objects` prop unless it equals the current content. */
	function syncFromProps(incoming: readonly CanvasObject[] | undefined): void {
		const next = CanvasManager.cloneCanvasObjects(incoming ?? []);
		if (CanvasManager.areCanvasObjectsEqual(next, history.present)) return;

		history = CanvasHistoryManager.create(CanvasManager.cloneCanvasObjects(next));
		restore(next);
	}

	/** Whether keyboard focus is inside the board, so global shortcuts apply. */
	function hasFocus(): boolean {
		return (
			typeof document !== 'undefined' && Boolean(rootElement?.contains(document.activeElement))
		);
	}

	function selectTool(next: SharedCanvasTool): void {
		if (readonly && next !== 'select' && next !== 'hand') return;
		finishEditing();
		tool = next;
		openMenu = next === 'shape' || next === 'icon' ? (openMenu === next ? null : next) : null;
		if (next !== 'select') selectedIds = [];
	}

	function closeMenu(): void {
		openMenu = null;
	}

	function selectShape(shape: CanvasShapeKind): void {
		style = { ...style, shape };
		tool = 'shape';
		openMenu = null;
	}

	function selectIcon(icon: TokenIconName): void {
		style = { ...style, icon };
		tool = 'icon';
		openMenu = null;
	}

	function applyToSelection(update: (object: CanvasObject) => CanvasObject): void {
		if (!selectedIds.length || readonly) return;
		commit(CanvasManager.updateCanvasObjects(objects, selectedSet, update));
	}

	function setColor(color: string): void {
		style = { ...style, color };
		applyToSelection((object) => ({ ...object, color }));
	}

	function setFill(fill: string): void {
		style = { ...style, fill, stickyFill: fill === 'transparent' ? style.stickyFill : fill };
		applyToSelection((object) =>
			object.type === 'shape' || object.type === 'sticky' || object.type === 'frame'
				? { ...object, fill }
				: object
		);
	}

	function setStrokeWidth(strokeWidth: number): void {
		style = { ...style, strokeWidth };
		applyToSelection((object) =>
			object.type === 'shape' || object.type === 'line' || object.type === 'path'
				? { ...object, strokeWidth }
				: object
		);
	}

	function setFont(patch: Partial<CanvasFont>): void {
		style = { ...style, font: { ...style.font, ...patch } };
		applyToSelection((object) =>
			object.type === 'text' || object.type === 'sticky' || object.type === 'shape'
				? { ...object, font: { ...object.font, ...patch } }
				: object
		);
	}

	function toggleFont(key: 'bold' | 'italic' | 'underline'): void {
		setFont({ [key]: !activeFont[key] });
	}

	function setShapeOfSelection(shape: CanvasShapeKind): void {
		style = { ...style, shape };
		applyToSelection((object) => (object.type === 'shape' ? { ...object, shape } : object));
	}

	function deleteSelected(): void {
		if (!selectedIds.length || readonly) return;
		commit(objects.filter((object) => !selectedSet.has(object.id)));
		selectedIds = [];
	}

	function duplicateSelected(): void {
		if (!selectedIds.length || readonly) return;
		const result = CanvasManager.duplicateCanvasObjects(objects, selectedSet);
		commit(result.objects);
		selectedIds = result.ids;
	}

	function reorderSelected(direction: 'front' | 'back'): void {
		if (!selectedIds.length || readonly) return;
		commit(CanvasManager.reorderCanvasObjects(objects, selectedSet, direction));
	}

	function selectAll(): void {
		tool = 'select';
		selectedIds = objects.map((object) => object.id);
	}

	function nudgeSelection(dx: number, dy: number): void {
		if (!selectedIds.length || readonly) return;
		commit(CanvasManager.moveCanvasObjects(objects, selectedSet, dx, dy));
	}

	function undo(): void {
		if (!canUndo || readonly) return;
		finishEditing();
		const before = history.present;
		history = CanvasHistoryManager.undo(history);
		restore(history.present);
		notify(before, history.present);
	}

	function redo(): void {
		if (!canRedo || readonly) return;
		finishEditing();
		const before = history.present;
		history = CanvasHistoryManager.redo(history);
		restore(history.present);
		notify(before, history.present);
	}

	function zoomBy(factor: number, anchor?: Point2D): void {
		viewport = CanvasViewportManager.zoomAt(
			viewport,
			anchor ?? { x: viewportSize.width / 2, y: viewportSize.height / 2 },
			factor
		);
	}

	function zoomIn(): void {
		zoomBy(CANVAS_ZOOM_LIMITS.step);
	}

	function zoomOut(): void {
		zoomBy(1 / CANVAS_ZOOM_LIMITS.step);
	}

	function resetZoom(): void {
		zoomBy(1 / viewport.zoom);
	}

	function fitToContent(): void {
		viewport = CanvasViewportManager.fit(
			CanvasGeometryManager.getGroupBounds(objects),
			viewportSize.width,
			viewportSize.height
		);
	}

	function startEditing(id: string): void {
		const object = objects.find((entry) => entry.id === id);
		if (!object || readonly || !CanvasBoardManager.isTextEditable(object)) return;
		editingId = id;
		selectedIds = [id];
	}

	/** Live text update; `contentHeight` (world px) lets text boxes grow with their content. */
	function setEditingText(text: string, contentHeight?: number): void {
		if (!editingId) return;
		objects = objects.map((object) => {
			if (object.id !== editingId) return object;
			const next = CanvasBoardManager.setText(object, text);
			return next.type === 'text' && contentHeight
				? { ...next, height: Math.max(contentHeight, CanvasBoardManager.defaultSize.text.height) }
				: next;
		});
	}

	function finishEditing(): void {
		if (!editingId) return;

		const id = editingId;
		const object = objects.find((entry) => entry.id === id);
		const wasPending = pendingId === id;
		editingId = null;
		pendingId = null;

		if (object?.type === 'text' && !object.text.trim()) {
			const next = objects.filter((entry) => entry.id !== id);
			selectedIds = selectedIds.filter((entry) => entry !== id);
			if (wasPending) objects = next;
			else commit(next);
			return;
		}

		commit(objects);
	}

	function eraseAt(point: Point2D): void {
		const hit = CanvasGeometryManager.hitTest(objects, point, 8 / viewport.zoom);
		if (hit && hit.type !== 'frame') objects = objects.filter((object) => object.id !== hit.id);
	}

	function getMoveIds(): Set<string> {
		const ids = new Set(selectedIds);
		for (const object of selectedObjects) {
			if (object.type !== 'frame') continue;
			for (const child of CanvasGeometryManager.getFrameChildren(objects, object)) ids.add(child);
		}
		return ids;
	}

	function pointerDown(event: PointerEvent, element: HTMLElement): void {
		finishEditing();
		openMenu = null;
		element.focus({ preventScroll: true });

		const screen = getScreenPoint(event, element);
		const world = CanvasViewportManager.screenToWorld(screen, viewport);

		if (event.button === 1 || tool === 'hand' || spacePressed) {
			element.setPointerCapture?.(event.pointerId);
			gesture = { kind: 'pan', last: screen };
			panning = true;
			event.preventDefault();
			return;
		}

		if (event.button !== 0) return;
		element.setPointerCapture?.(event.pointerId);

		if (tool === 'select' || readonly) {
			const hit = CanvasGeometryManager.hitTest(objects, world, 6 / viewport.zoom);
			if (hit) {
				if (event.shiftKey) {
					selectedIds = selectedSet.has(hit.id)
						? selectedIds.filter((id) => id !== hit.id)
						: [...selectedIds, hit.id];
				} else if (!selectedSet.has(hit.id)) {
					selectedIds = [hit.id];
				}
				if (!readonly && selectedIds.length) {
					gesture = { kind: 'move', start: world, base: objects, ids: getMoveIds() };
				}
				return;
			}

			const initial = event.shiftKey ? selectedIds : [];
			selectedIds = initial;
			gesture = { kind: 'marquee', start: world, initial };
			return;
		}

		if (tool === 'eraser') {
			gesture = { kind: 'erase' };
			eraseAt(world);
			return;
		}

		draft = CanvasBoardManager.createDraft(tool, world, style, contract.currentUserId);
		if (draft) gesture = { kind: 'draw', start: world, startScreen: screen, dragged: false };
	}

	function beginResize(
		event: PointerEvent,
		element: HTMLElement,
		handle: CanvasResizeHandle
	): void {
		if (readonly || !singleSelected || event.button !== 0) return;
		event.stopPropagation();
		element.setPointerCapture?.(event.pointerId);
		gesture = { kind: 'resize', handle, original: singleSelected, base: objects };
	}

	function pointerMove(event: PointerEvent, element: HTMLElement): void {
		const screen = getScreenPoint(event, element);
		const world = CanvasViewportManager.screenToWorld(screen, viewport);
		contract.onCursorMove?.(world);

		if (!gesture) return;

		switch (gesture.kind) {
			case 'pan':
				viewport = CanvasViewportManager.pan(
					viewport,
					screen.x - gesture.last.x,
					screen.y - gesture.last.y
				);
				gesture.last = screen;
				break;
			case 'move':
				objects = CanvasManager.moveCanvasObjects(
					gesture.base,
					gesture.ids,
					world.x - gesture.start.x,
					world.y - gesture.start.y
				);
				break;
			case 'resize': {
				const { original, handle } = gesture;
				const resized = CanvasGeometryManager.resize(original, handle, world, event.shiftKey);
				objects = gesture.base.map((object) => (object.id === original.id ? resized : object));
				break;
			}
			case 'draw':
				if (!draft) break;
				if (
					Math.hypot(screen.x - gesture.startScreen.x, screen.y - gesture.startScreen.y) >
					CanvasBoardManager.dragThreshold
				) {
					gesture.dragged = true;
				}
				if (gesture.dragged || draft.type === 'path') {
					draft = CanvasBoardManager.updateDraft(draft, gesture.start, world, event.shiftKey);
				}
				break;
			case 'marquee': {
				const rect = CanvasGeometryManager.normalizeRect(gesture.start, world);
				marquee = rect;
				const ids = CanvasGeometryManager.getObjectsInRect(objects, rect);
				selectedIds = [...new Set([...gesture.initial, ...ids])];
				break;
			}
			case 'erase':
				eraseAt(world);
				break;
		}
	}

	function pointerUp(event: PointerEvent, element: HTMLElement): void {
		if (element.hasPointerCapture?.(event.pointerId))
			element.releasePointerCapture(event.pointerId);

		const current = gesture;
		gesture = null;
		if (!current) return;

		switch (current.kind) {
			case 'pan':
				panning = false;
				break;
			case 'move':
			case 'resize':
			case 'erase':
				commit(objects);
				break;
			case 'marquee':
				marquee = null;
				break;
			case 'draw': {
				const finished = draft
					? CanvasBoardManager.finishDraft(draft, current.start, current.dragged)
					: null;
				draft = null;
				if (!finished) break;

				if (finished.type === 'text' || finished.type === 'sticky') {
					objects = [...objects, finished];
					pendingId = finished.id;
					tool = 'select';
					startEditing(finished.id);
					break;
				}

				commit([...objects, finished]);
				if (finished.type !== 'path') {
					tool = 'select';
					selectedIds = [finished.id];
				}
				break;
			}
		}
	}

	function doubleClick(event: MouseEvent, element: HTMLElement): void {
		if (readonly) return;
		const world = CanvasViewportManager.screenToWorld(getScreenPoint(event, element), viewport);
		const hit = CanvasGeometryManager.hitTest(objects, world, 6 / viewport.zoom);

		if (hit && CanvasBoardManager.isTextEditable(hit)) {
			startEditing(hit.id);
			return;
		}

		if (!hit && tool === 'select') {
			const created = CanvasBoardManager.createDraft('text', world, style, contract.currentUserId);
			if (!created) return;
			const placed = CanvasBoardManager.finishDraft(created, world, false);
			if (!placed) return;
			objects = [...objects, placed];
			pendingId = placed.id;
			startEditing(placed.id);
		}
	}

	function wheel(event: WheelEvent, element: HTMLElement): void {
		event.preventDefault();
		if (event.ctrlKey || event.metaKey) {
			zoomBy(Math.exp(-event.deltaY * 0.0015), getScreenPoint(event, element));
			return;
		}
		const dx = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
		const dy = event.shiftKey && !event.deltaX ? 0 : event.deltaY;
		viewport = CanvasViewportManager.pan(viewport, -dx, -dy);
	}

	function keyDown(event: KeyboardEvent): void {
		if (editingId) {
			if (event.key === 'Escape' || (event.key === 'Enter' && (event.ctrlKey || event.metaKey))) {
				event.preventDefault();
				finishEditing();
			}
			return;
		}

		const target = event.target as HTMLElement | null;
		if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;

		const mod = event.ctrlKey || event.metaKey;
		const key = event.key.toLowerCase();

		if (mod && key === 'z') {
			event.preventDefault();
			if (event.shiftKey) redo();
			else undo();
		} else if (mod && key === 'y') {
			event.preventDefault();
			redo();
		} else if (mod && key === 'd') {
			event.preventDefault();
			duplicateSelected();
		} else if (mod && key === 'a') {
			event.preventDefault();
			selectAll();
		} else if (mod && (key === '=' || key === '+')) {
			event.preventDefault();
			zoomIn();
		} else if (mod && key === '-') {
			event.preventDefault();
			zoomOut();
		} else if (mod && key === '0') {
			event.preventDefault();
			resetZoom();
		} else if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			deleteSelected();
		} else if (event.key === 'Escape') {
			selectedIds = [];
			openMenu = null;
			tool = 'select';
		} else if (event.key === ' ') {
			event.preventDefault();
			spacePressed = true;
		} else if (event.key === 'Enter' && singleSelected) {
			event.preventDefault();
			startEditing(singleSelected.id);
		} else if (event.key.startsWith('Arrow') && selectedIds.length) {
			event.preventDefault();
			const step = event.shiftKey ? 10 : 1;
			nudgeSelection(
				event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0,
				event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0
			);
		} else if (!mod && !event.altKey) {
			const next = ObjectManagerSharedCanvas.findToolByKey(event.key);
			if (next) selectTool(next);
		}
	}

	function keyUp(event: KeyboardEvent): void {
		if (event.key === ' ') spacePressed = false;
	}

	/** Replaces the board with objects read from JSON; returns how many were loaded. */
	function importJson(json: string): number {
		if (readonly) return 0;
		const loaded = CanvasManager.parseCanvasObjects(json);
		if (!loaded.length) return 0;
		finishEditing();
		commit(loaded);
		selectedIds = [];
		fitToContent();
		return loaded.length;
	}

	function exportJson(): string {
		return CanvasManager.serializeCanvasObjects(CanvasManager.cloneCanvasObjects(objects));
	}

	/** Downloads the board as a JSON file. */
	function exportFile(): void {
		if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return;
		const url = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = ObjectManagerSharedCanvas.exportFilename;
		link.click();
		URL.revokeObjectURL(url);
	}

	/** Loads the first file of a file input and clears the input for the next pick. */
	async function importFile(input: HTMLInputElement): Promise<number> {
		const file = input.files?.[0];
		input.value = '';
		return file ? importJson(await file.text()) : 0;
	}

	return {
		get objects() {
			return objects;
		},
		get layers() {
			return layers;
		},
		get draft() {
			return draft;
		},
		get tool() {
			return tool;
		},
		get style() {
			return style;
		},
		get viewport() {
			return viewport;
		},
		get zoomPercent() {
			return zoomPercent;
		},
		get selectedIds() {
			return selectedIds;
		},
		get selectedSet() {
			return selectedSet;
		},
		get selectedObjects() {
			return selectedObjects;
		},
		get selectionBounds() {
			return selectionBounds;
		},
		get singleSelected() {
			return singleSelected;
		},
		get editingId() {
			return editingId;
		},
		get editingObject() {
			return editingObject;
		},
		get openMenu() {
			return openMenu;
		},
		get marquee() {
			return marquee;
		},
		get cursor() {
			return cursor;
		},
		get canUndo() {
			return canUndo;
		},
		get canRedo() {
			return canRedo;
		},
		get readonly() {
			return readonly;
		},
		get showStylePanel() {
			return showStylePanel;
		},
		get styleKinds() {
			return styleKinds;
		},
		get activeFont() {
			return activeFont;
		},
		get activeColor() {
			return activeColor;
		},
		get activeFill() {
			return activeFill;
		},
		get activeStrokeWidth() {
			return activeStrokeWidth;
		},
		get gridStyle() {
			return gridStyle;
		},
		get rootElement() {
			return rootElement;
		},
		set rootElement(value: HTMLDivElement | null) {
			rootElement = value;
		},
		get viewportElement() {
			return viewportElement;
		},
		set viewportElement(value: HTMLDivElement | null) {
			viewportElement = value;
		},
		get editorElement() {
			return editorElement;
		},
		set editorElement(value: HTMLTextAreaElement | null) {
			editorElement = value;
		},
		get fileInput() {
			return fileInput;
		},
		set fileInput(value: HTMLInputElement | null) {
			fileInput = value;
		},
		get viewportWidth() {
			return viewportSize.width;
		},
		set viewportWidth(value: number) {
			viewportSize = { ...viewportSize, width: value };
		},
		get viewportHeight() {
			return viewportSize.height;
		},
		set viewportHeight(value: number) {
			viewportSize = { ...viewportSize, height: value };
		},
		get restProps() {
			return restProps;
		},
		syncFromProps,
		hasFocus,
		selectTool,
		closeMenu,
		selectShape,
		selectIcon,
		setColor,
		setFill,
		setStrokeWidth,
		setFont,
		toggleFont,
		setShapeOfSelection,
		deleteSelected,
		duplicateSelected,
		reorderSelected,
		selectAll,
		undo,
		redo,
		zoomIn,
		zoomOut,
		resetZoom,
		fitToContent,
		startEditing,
		setEditingText,
		finishEditing,
		pointerDown,
		beginResize,
		pointerMove,
		pointerUp,
		doubleClick,
		wheel,
		keyDown,
		keyUp,
		importJson,
		exportJson,
		importFile,
		exportFile
	};
}

export default createSharedCanvasState;
