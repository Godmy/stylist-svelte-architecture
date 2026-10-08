import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import { DEFAULT_WORKSPACE_CANVAS } from '$stylist/workspace/const/record/workspace-canvas';
import type { RecipeWorkspaceCanvas } from '$stylist/workspace/interface/recipe/workspace-canvas';

export function createWorkspaceCanvasState(getProps: () => RecipeWorkspaceCanvas) {
	const props = $derived(getProps());
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0 });
	let panOffsetStart = $state({ x: 0, y: 0 });

	const width = $derived(props.width ?? 800);
	const height = $derived(props.height ?? 600);
	const zoom = $derived(props.zoom ?? 1);
	const offsetX = $derived(props.offsetX ?? 0);
	const offsetY = $derived(props.offsetY ?? 0);
	const gridSize = $derived(props.gridSize ?? DEFAULT_WORKSPACE_CANVAS.gridSize);
	const gridMode = $derived(
		(props.gridMode ?? 'dot') as 'dot' | 'number' | 'x' | 'letter' | 'check'
	);
	const gridColor = $derived(props.gridColor ?? DEFAULT_WORKSPACE_CANVAS.gridColor);
	const backgroundColor = $derived(
		props.backgroundColor ?? DEFAULT_WORKSPACE_CANVAS.backgroundColor
	);
	const snapToGrid = $derived(props.snapToGrid ?? false);

	const containerClass = $derived(
		props.class != null ? `workspace-canvas ${String(props.class)}` : 'workspace-canvas'
	);
	const gridClass = $derived(
		`workspace-canvas__grid workspace-canvas__grid--${gridMode}${props.gridClass ? ` ${props.gridClass}` : ''}`
	);
	const contentClass = $derived(
		`workspace-canvas__content${props.contentClass ? ` ${props.contentClass}` : ''}`
	);

	const transformStyle = $derived(
		`transform: translate(${offsetX}px, ${offsetY}px) scale(${zoom}); transform-origin: 0 0;`
	);

	const viewport = $derived<{
		position: Point2D;
		zoom: number;
		width: number;
		height: number;
	}>({
		position: { x: offsetX, y: offsetY },
		zoom,
		width,
		height
	});

	const gridStyles = $derived(
		`--grid-size: ${gridSize}px; --grid-color: ${gridColor};${backgroundColor ? ` --background-color: ${backgroundColor};` : ''}`
	);
	const minZoom = $derived(props.minZoom ?? DEFAULT_WORKSPACE_CANVAS.minZoom);
	const maxZoom = $derived(props.maxZoom ?? DEFAULT_WORKSPACE_CANVAS.maxZoom);
	const snapThreshold = $derived(props.snapThreshold ?? DEFAULT_WORKSPACE_CANVAS.snapThreshold);

	function handleWheel(event: WheelEvent): void {
		if (!(props.zoomEnabled ?? true)) return;

		event.preventDefault();

		const zoomSensitivity = 0.001;
		const delta = -event.deltaY * zoomSensitivity;
		const nextZoom = Math.min(Math.max(minZoom, zoom + delta), maxZoom);
		props.onzoomchange?.(nextZoom);
	}

	function handleMouseDown(event: MouseEvent): void {
		const panMode = props.panMode ?? 'drag';
		const isPanButton = event.button === 1;
		const isPanEnabled = props.panEnabled ?? true;

		if (!isPanEnabled) return;

		if (panMode === 'always' || (panMode === 'space' && event.shiftKey) || isPanButton) {
			isPanning = true;
			panStart = { x: event.clientX, y: event.clientY };
			panOffsetStart = { x: offsetX, y: offsetY };
			props.onpanstart?.(event);
		}
	}

	function handleMouseMove(event: MouseEvent): void {
		if (!isPanning) return;

		const newOffset = {
			x: panOffsetStart.x + (event.clientX - panStart.x),
			y: panOffsetStart.y + (event.clientY - panStart.y)
		};

		props.onoffsetchange?.(newOffset);
		props.onpan?.(event);
	}

	function handleMouseUp(event: MouseEvent): void {
		if (!isPanning) return;
		isPanning = false;
		props.onpanend?.(event);
	}

	function handleClick(event: MouseEvent): void {
		props.oncanvasclick?.(event);
	}

	function handleDoubleClick(
		event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }
	): void {
		props.ondblclick?.(event);
	}

	function handleContextMenu(
		event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }
	): void {
		props.oncontextmenu?.(event);
	}

	function snapToGridValue(value: number): number {
		if (!snapToGrid) return value;
		const snapped = Math.round(value / gridSize) * gridSize;
		return Math.abs(value - snapped) < snapThreshold ? snapped : value;
	}

	function resetView(): void {
		props.onzoomchange?.(1);
		props.onoffsetchange?.({ x: 0, y: 0 });
	}

	function zoomToFit(
		canvasRef: HTMLDivElement | null | undefined,
		contentRef: HTMLDivElement | null | undefined
	): void {
		if (!canvasRef || !contentRef) return;

		const children = Array.from(contentRef.children).filter(
			(node): node is HTMLElement => node instanceof HTMLElement
		);

		if (children.length === 0) {
			resetView();
			return;
		}

		let minLeft = Number.POSITIVE_INFINITY;
		let minTop = Number.POSITIVE_INFINITY;
		let maxRight = Number.NEGATIVE_INFINITY;
		let maxBottom = Number.NEGATIVE_INFINITY;

		for (const child of children) {
			minLeft = Math.min(minLeft, child.offsetLeft);
			minTop = Math.min(minTop, child.offsetTop);
			maxRight = Math.max(maxRight, child.offsetLeft + child.offsetWidth);
			maxBottom = Math.max(maxBottom, child.offsetTop + child.offsetHeight);
		}

		if (!Number.isFinite(minLeft) || !Number.isFinite(minTop)) return;

		const contentWidth = Math.max(1, maxRight - minLeft);
		const contentHeight = Math.max(1, maxBottom - minTop);
		const padding = gridSize * 2;
		const availableWidth = Math.max(1, width - padding * 2);
		const availableHeight = Math.max(1, height - padding * 2);
		const fitZoom = Math.min(
			maxZoom,
			Math.max(minZoom, Math.min(availableWidth / contentWidth, availableHeight / contentHeight))
		);

		props.onzoomchange?.(fitZoom);
		props.onoffsetchange?.({
			x: (width - contentWidth * fitZoom) / 2 - minLeft * fitZoom,
			y: (height - contentHeight * fitZoom) / 2 - minTop * fitZoom
		});
	}

	return {
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get zoom() {
			return zoom;
		},
		get offset() {
			return { x: offsetX, y: offsetY } as Point2D;
		},
		get gridSize() {
			return gridSize;
		},
		get gridMode() {
			return gridMode;
		},
		get gridColor() {
			return gridColor;
		},
		get backgroundColor() {
			return backgroundColor;
		},
		get minZoom() {
			return minZoom;
		},
		get maxZoom() {
			return maxZoom;
		},
		get snapEnabled() {
			return snapToGrid;
		},
		get containerClass() {
			return containerClass;
		},
		get gridClass() {
			return gridClass;
		},
		get contentClass() {
			return contentClass;
		},
		get transformStyle() {
			return transformStyle;
		},
		get viewport() {
			return viewport;
		},
		get gridStyles() {
			return gridStyles;
		},
		handleWheel,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleClick,
		handleDoubleClick,
		handleContextMenu,
		snapToGrid: snapToGridValue,
		resetView,
		zoomToFit,
		get restProps() {
			const {
				width: _w,
				height: _h,
				zoom: _z,
				offsetX: _ox,
				offsetY: _oy,
				gridSize: _gs,
				gridMode: _gm,
				gridColor: _gc,
				backgroundColor: _bg,
				snapToGrid: _stg,
				class: _c,
				gridClass: _gcl,
				contentClass: _cc,
				minZoom: _minZoom,
				maxZoom: _maxZoom,
				panMode: _panMode,
				panEnabled: _panEnabled,
				zoomEnabled: _zoomEnabled,
				snapThreshold: _snapThreshold,
				onzoomchange: _onzoomchange,
				onoffsetchange: _onoffsetchange,
				onpanstart: _onpanstart,
				onpan: _onpan,
				onpanend: _onpanend,
				oncanvasclick: _oncanvasclick,
				children: _ch,
				...rest
			} = props;
			return rest;
		}
	};
}

export default createWorkspaceCanvasState;
