import { MinimapManager } from '$stylist/workspace/class/manager/minimap';
import type { RecipeMinimap } from '$stylist/workspace/interface/recipe/minimap';

export function createMinimapState(getProps: () => RecipeMinimap) {
	const props = $derived(getProps());
	const nodes = $derived(props.nodes ?? []);
	const zoom = $derived(props.zoom ?? 1);
	const offset = $derived(props.offset ?? { x: 0, y: 0 });
	const width = $derived(props.width ?? 200);
	const height = $derived(props.height ?? 150);
	const miniMapZoom = $derived(props.miniMapZoom ?? 0.1);
	const showZoomControls = $derived(props.showZoomControls ?? true);
	const showViewport = $derived(props.showViewport ?? true);
	const nodeColor = $derived(props.nodeColor ?? 'var(--color-primary-500)');
	const activeNodeColor = $derived(props.activeNodeColor ?? 'var(--color-primary-400)');
	const viewportColor = $derived(props.viewportColor ?? 'var(--color-primary-500)');
	const backgroundColor = $derived(props.backgroundColor ?? 'var(--color-background-primary)');
	const gridColor = $derived(props.gridColor ?? 'var(--color-border-primary)');
	const hostClass = $derived(props.class ? `minimap ${props.class}` : 'minimap');
	const restProps = $derived.by(() => {
		const {
			nodes: _nodes,
			zoom: _zoom,
			offset: _offset,
			width: _width,
			height: _height,
			miniMapZoom: _miniMapZoom,
			showZoomControls: _showZoomControls,
			showViewport: _showViewport,
			nodeColor: _nodeColor,
			activeNodeColor: _activeNodeColor,
			viewportColor: _viewportColor,
			backgroundColor: _backgroundColor,
			gridColor: _gridColor,
			onOffsetChange: _onOffsetChange,
			onZoomChange: _onZoomChange,
			onMapClick: _onMapClick,
			children: _children,
			class: _class,
			...rest
		} = props;

		return rest;
	});
	const bounds = $derived(MinimapManager.resolveBounds(nodes));
	const viewport = $derived(
		MinimapManager.resolveViewport(offset, zoom, width, height, miniMapZoom)
	);

	function handleMapClick(event: MouseEvent): void {
		if (!props.onOffsetChange) return;

		const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
		const canvasPoint = MinimapManager.resolveCanvasPoint(
			{ x: event.clientX, y: event.clientY },
			rect,
			width,
			height,
			bounds
		);

		props.onOffsetChange(MinimapManager.resolveOffsetForPoint(canvasPoint, miniMapZoom));
		props.onMapClick?.(canvasPoint);
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key !== 'Enter' && event.key !== ' ') return;

		event.preventDefault();
		const target = event.currentTarget as SVGElement;
		const rect = target.getBoundingClientRect();

		handleMapClick({
			...event,
			currentTarget: target,
			clientX: rect.left + target.clientWidth / 2,
			clientY: rect.top + target.clientHeight / 2
		} as unknown as MouseEvent);
	}

	function handleZoomIn(): void {
		props.onZoomChange?.(Math.min(zoom + 0.2, 3));
	}

	function handleZoomOut(): void {
		props.onZoomChange?.(Math.max(zoom - 0.2, 0.1));
	}

	function handleZoomToFit(): void {
		if (!props.onZoomChange || !props.onOffsetChange) return;

		props.onZoomChange(MinimapManager.resolveFitZoom(bounds, width, height));
		props.onOffsetChange(MinimapManager.resolveFitOffset(bounds));
	}

	function getNodeRect(node: (typeof nodes)[number]) {
		return MinimapManager.resolveNodeRect(node, bounds, width, height);
	}

	return {
		get nodes() {
			return nodes;
		},
		get zoom() {
			return zoom;
		},
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get miniMapZoom() {
			return miniMapZoom;
		},
		get showZoomControls() {
			return showZoomControls;
		},
		get showViewport() {
			return showViewport;
		},
		get nodeColor() {
			return nodeColor;
		},
		get activeNodeColor() {
			return activeNodeColor;
		},
		get viewportColor() {
			return viewportColor;
		},
		get backgroundColor() {
			return backgroundColor;
		},
		get gridColor() {
			return gridColor;
		},
		get hostClass() {
			return hostClass;
		},
		get restProps() {
			return restProps;
		},
		get viewport() {
			return viewport;
		},
		handleMapClick,
		handleKeyDown,
		handleZoomIn,
		handleZoomOut,
		handleZoomToFit,
		getNodeRect
	};
}

export default createMinimapState;
