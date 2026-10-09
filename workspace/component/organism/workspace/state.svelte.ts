import { WORKSPACE_ICONS } from '$stylist/workspace/const/record/workspace-icons';
import type { RecipeWorkspace } from '$stylist/workspace/interface/recipe/workspace';
import type { RecipeWorkspaceCanvas } from '$stylist/workspace/interface/recipe/workspace-canvas';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';

const DEFAULT_PALETTE_NODES: SlotWorkspaceNode[] = [
	{
		id: 'source',
		type: 'source',
		title: 'Source',
		description: 'Data source node',
		color: 'var(--color-success-500)',
		category: 'source'
	},
	{
		id: 'processor',
		type: 'processor',
		title: 'Processor',
		description: 'Process data',
		color: 'var(--color-secondary-500)',
		category: 'processor'
	},
	{
		id: 'output',
		type: 'output',
		title: 'Output',
		description: 'Output node',
		color: 'var(--color-warning-500)',
		category: 'output'
	},
	{
		id: 'gateway',
		type: 'gateway',
		title: 'Gateway',
		description: 'Decision point',
		color: 'var(--color-info-500)',
		category: 'gateway'
	},
	{
		id: 'custom',
		type: 'custom',
		title: 'Custom',
		description: 'Custom node',
		color: 'var(--color-primary-500)',
		category: 'custom'
	}
];

export function createWorkspaceState(props: RecipeWorkspace) {
	// --- chrome / editor shell state (was: graph-editor) ---
	let editorRef = $state<HTMLDivElement | null>(null);
	let addButtonAnchorRef = $state<HTMLDivElement | null>(null);
	let anchoredPalettePosition = $state({ ...(props.palettePosition ?? { x: 20, y: 80 }) });
	let isPaletteOpen = $state(props.showWorkspacePalette ?? true);
	let isPropertiesPanelOpen = $state(props.showPropertiesPanel ?? true);
	let paletteSearchQuery = $state('');
	let paletteSelectedCategory = $state('all');

	// --- canvas state (was: litegraph-canvas) ---
	let canvasHostRef = $state<HTMLDivElement | null>(null);
	let canvasSize = $state({ width: 800, height: 600 });
	let internalZoom = $state(props.zoom ?? 1);
	let internalOffset = $state({ ...(props.offset ?? { x: 0, y: 0 }) });
	let isGridVisible = $state(props.showGrid ?? true);
	let activeTool = $state<'select' | 'pan' | 'add'>('select');
	let isConnecting = $state(false);
	let connectionStartPort = $state<SlotWorkspaceNode | null>(null);
	let connectionStartPosition = $state<{ x: number; y: number } | null>(null);
	let connectionCurrentPosition = $state<{ x: number; y: number } | null>(null);

	$effect(() => {
		isPaletteOpen = props.showWorkspacePalette ?? true;
	});

	$effect(() => {
		isPropertiesPanelOpen = props.showPropertiesPanel ?? true;
	});

	$effect(() => {
		anchoredPalettePosition = { ...(props.palettePosition ?? { x: 20, y: 80 }) };
	});

	$effect(() => {
		if (!editorRef || typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(recalculatePalettePosition);
		observer.observe(editorRef);
		return () => observer.disconnect();
	});

	$effect(() => {
		internalZoom = props.zoom ?? 1;
	});

	$effect(() => {
		internalOffset = { ...(props.offset ?? { x: 0, y: 0 }) };
	});

	$effect(() => {
		isGridVisible = props.showGrid ?? true;
	});

	$effect(() => {
		if (!canvasHostRef || typeof ResizeObserver === 'undefined') {
			return;
		}

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) {
				return;
			}

			canvasSize = {
				width: Math.max(320, Math.floor(entry.contentRect.width)),
				height: Math.max(240, Math.floor(entry.contentRect.height))
			};
		});

		observer.observe(canvasHostRef);

		return () => observer.disconnect();
	});

	const restProps = $derived.by(() => {
		const {
			nodes: _nodes,
			connections: _connections,
			selectedNodeIds: _selectedNodeIds,
			zoom: _zoom,
			offset: _offset,
			showGrid: _showGrid,
			gridMode: _gridMode,
			panMode: _panMode,
			showToolbar: _showToolbar,
			showMiniMap: _showMiniMap,
			showWorkspacePalette: _showWorkspacePalette,
			showPropertiesPanel: _showPropertiesPanel,
			toolbarItems: _toolbarItems,
			toolbarContent: _toolbarContent,
			palettePosition: _palettePosition,
			paletteNodes: _paletteNodes,
			allowAddNodes: _allowAddNodes,
			allowDeleteNodes: _allowDeleteNodes,
			allowDuplicateNodes: _allowDuplicateNodes,
			onNodeSelect: _onNodeSelect,
			onNodeDrag: _onNodeDrag,
			onNodeDelete: _onNodeDelete,
			onNodeDuplicate: _onNodeDuplicate,
			onNodeAdd: _onNodeAdd,
			onConnectionStart: _onConnectionStart,
			onConnectionEnd: _onConnectionEnd,
			onPropertyChange: _onPropertyChange,
			onZoomChange: _onZoomChange,
			onOffsetChange: _onOffsetChange,
			onSave: _onSave,
			onExport: _onExport,
			onImport: _onImport,
			children: _children,
			class: _class,
			...rest
		} = props;
		return rest;
	});

	const selectedNode = $derived(
		(props.selectedNodeIds ?? []).length > 0
			? (props.nodes ?? []).find((node) => node.id === props.selectedNodeIds?.[0])
			: undefined
	);

	const defaultPaletteNodes = $derived<SlotWorkspaceNode[]>(
		(props.paletteNodes ?? []).length > 0 ? [...(props.paletteNodes ?? [])] : DEFAULT_PALETTE_NODES
	);

	function handleNodeSelect(nodeId: string) {
		props.onNodeSelect?.(nodeId);
	}

	function handleNodeDrag(nodeId: string, position: { x: number; y: number }) {
		props.onNodeDrag?.(nodeId, position);
	}

	function handleNodeDelete(nodeId: string) {
		props.onNodeDelete?.(nodeId);
	}

	function handleNodeDuplicate(nodeId: string) {
		props.onNodeDuplicate?.(nodeId);
	}

	function handlePaletteNodeSelect(item: SlotWorkspaceNode) {
		if (props.onNodeAdd) {
			const type = item.type ?? item.id ?? 'custom';
			const hostWidth = canvasHostRef?.clientWidth ?? 800;
			const hostHeight = canvasHostRef?.clientHeight ?? 600;
			const centerX = (-internalOffset.x + hostWidth / 2) / internalZoom;
			const centerY = (-internalOffset.y + hostHeight / 2) / internalZoom;

			props.onNodeAdd({
				id: `${type}-${Date.now()}`,
				title: item.title ?? type,
				type,
				x: centerX,
				y: centerY,
				color: item.color,
				inputs: [],
				outputs: [],
				properties: []
			});
		}

		isPaletteOpen = false;
	}

	function handlePropertyChange(propertyId: string, value: unknown) {
		if ((props.selectedNodeIds ?? []).length > 0) {
			props.onPropertyChange?.(props.selectedNodeIds?.[0] ?? '', propertyId, value);
		}
	}

	function handleSave() {
		props.onSave?.({
			nodes: props.nodes ?? [],
			connections: props.connections ?? []
		});
	}

	function recalculatePalettePosition() {
		if (!editorRef || !addButtonAnchorRef) {
			return;
		}

		const editorRect = editorRef.getBoundingClientRect();
		const anchorRect = addButtonAnchorRef.getBoundingClientRect();
		const gap = 12;

		anchoredPalettePosition = {
			x: anchorRect.right - editorRect.left + gap,
			y: anchorRect.top - editorRect.top
		};
	}

	function handleTogglePalette() {
		recalculatePalettePosition();
		isPaletteOpen = !isPaletteOpen;
	}

	function handleToggleProperties() {
		isPropertiesPanelOpen = !isPropertiesPanelOpen;
	}

	function updateZoom(nextZoom: number) {
		const clamped = Math.min(Math.max(nextZoom, 0.1), 3);
		internalZoom = clamped;
		props.onZoomChange?.(clamped);
	}

	function updateOffset(nextOffset: { x: number; y: number }) {
		internalOffset = nextOffset;
		props.onOffsetChange?.(nextOffset);
	}

	function toCanvasPosition(clientX: number, clientY: number) {
		const rect = canvasHostRef?.getBoundingClientRect();
		if (!rect) {
			return { x: clientX, y: clientY };
		}

		return {
			x: (clientX - rect.left - internalOffset.x) / internalZoom,
			y: (clientY - rect.top - internalOffset.y) / internalZoom
		};
	}

	function handleZoomIn() {
		updateZoom(internalZoom + 0.1);
	}

	function handleZoomOut() {
		updateZoom(internalZoom - 0.1);
	}

	function handleZoomToFit() {
		if ((props.nodes ?? []).length === 0) {
			updateZoom(1);
			updateOffset({ x: 0, y: 0 });
			return;
		}

		const padding = 80;
		const nodes = props.nodes ?? [];
		const minX = Math.min(...nodes.map((node) => node.x ?? 0));
		const minY = Math.min(...nodes.map((node) => node.y ?? 0));
		const maxX = Math.max(...nodes.map((node) => (node.x ?? 0) + (node.width ?? 220)));
		const maxY = Math.max(
			...nodes.map((node) => (node.y ?? 0) + (typeof node.height === 'number' ? node.height : 140))
		);
		const contentWidth = Math.max(1, maxX - minX + padding * 2);
		const contentHeight = Math.max(1, maxY - minY + padding * 2);
		const nextZoom = Math.min(
			canvasSize.width / contentWidth,
			canvasSize.height / contentHeight,
			1.5
		);

		updateZoom(nextZoom);
		updateOffset({
			x: -(minX - padding) * nextZoom,
			y: -(minY - padding) * nextZoom
		});
	}

	function handleToggleGrid() {
		isGridVisible = !isGridVisible;
	}

	function handleDeleteSelected() {
		if (!props.onNodeDelete) {
			return;
		}

		(props.selectedNodeIds ?? []).forEach((id) => props.onNodeDelete?.(id));
	}

	function handleDuplicateSelected() {
		if (!props.onNodeDuplicate) {
			return;
		}

		(props.selectedNodeIds ?? []).forEach((id) => props.onNodeDuplicate?.(id));
	}

	function handleToolbarItemClick(itemId: string) {
		if (itemId === 'tool-select') {
			activeTool = 'select';
			return;
		}

		if (itemId === 'tool-pan') {
			activeTool = 'pan';
			return;
		}

		if (itemId === 'tool-add') {
			activeTool = activeTool === 'add' ? 'select' : 'add';
		}
	}

	function handlePortConnectionStart(port: SlotWorkspaceNode, event: MouseEvent) {
		isConnecting = true;
		connectionStartPort = port;
		const origin = toCanvasPosition(event.clientX, event.clientY);
		connectionStartPosition = origin;
		connectionCurrentPosition = origin;
		props.onConnectionStart?.(port, event);
	}

	function handlePortConnectionEnd(port: SlotWorkspaceNode) {
		if (
			isConnecting &&
			connectionStartPort &&
			props.onConnectionEnd &&
			connectionStartPort.id !== port.id
		) {
			props.onConnectionEnd(connectionStartPort, port);
		}

		isConnecting = false;
		connectionStartPort = null;
		connectionStartPosition = null;
		connectionCurrentPosition = null;
	}

	function handleCanvasMouseMove(event: MouseEvent) {
		if (isConnecting) {
			connectionCurrentPosition = toCanvasPosition(event.clientX, event.clientY);
		}
	}

	function handleCanvasMouseUp() {
		if (!isConnecting) {
			return;
		}

		isConnecting = false;
		connectionStartPort = null;
		connectionStartPosition = null;
		connectionCurrentPosition = null;
	}

	function handleCanvasClick(event: MouseEvent) {
		if (activeTool !== 'add' || !props.allowAddNodes || !props.onNodeAdd) {
			return;
		}

		const position = toCanvasPosition(event.clientX, event.clientY);
		props.onNodeAdd({
			id: `node-${Date.now()}`,
			title: 'Node',
			type: 'custom',
			x: Math.round(position.x),
			y: Math.round(position.y),
			color: 'var(--color-secondary-500)',
			inputs: [{ id: 'in-1', name: 'in', direction: 'input', type: 'any', label: 'In' }],
			outputs: [{ id: 'out-1', name: 'out', direction: 'output', type: 'any', label: 'Out' }],
			properties: []
		});
		activeTool = 'select';
	}

	const defaultToolbarItems = $derived<SlotWorkspaceNode[]>([
		{
			id: 'tool-select',
			type: 'button',
			icon: WORKSPACE_ICONS.select,
			label: 'Select',
			tooltip: 'Select tool',
			active: activeTool === 'select'
		},
		{
			id: 'tool-pan',
			type: 'button',
			icon: WORKSPACE_ICONS.pan,
			label: 'Pan',
			tooltip: 'Pan tool',
			active: activeTool === 'pan'
		},
		{
			id: 'tool-add',
			type: 'button',
			icon: WORKSPACE_ICONS.add,
			label: 'Add',
			tooltip: 'Add node on canvas click',
			active: activeTool === 'add',
			disabled: !props.allowAddNodes
		},
		{ id: 'separator-1', type: 'separator' },
		{
			id: 'zoom-in',
			type: 'button',
			icon: WORKSPACE_ICONS.zoomIn,
			label: 'Zoom In',
			onclick: handleZoomIn
		},
		{
			id: 'zoom-out',
			type: 'button',
			icon: WORKSPACE_ICONS.zoomOut,
			label: 'Zoom Out',
			onclick: handleZoomOut
		},
		{
			id: 'zoom-fit',
			type: 'button',
			icon: WORKSPACE_ICONS.zoomFit,
			label: 'Fit',
			onclick: handleZoomToFit
		},
		{ id: 'separator-2', type: 'separator' },
		{
			id: 'toggle-grid',
			type: 'button',
			icon: WORKSPACE_ICONS.grid,
			label: 'Grid',
			active: isGridVisible,
			onclick: handleToggleGrid
		},
		{ id: 'separator-3', type: 'separator' },
		{
			id: 'save',
			type: 'button',
			icon: WORKSPACE_ICONS.save,
			label: 'Save',
			onclick: handleSave
		},
		{
			id: 'export',
			type: 'button',
			icon: WORKSPACE_ICONS.export,
			label: 'Export',
			onclick: props.onExport
		},
		{
			id: 'import',
			type: 'button',
			icon: WORKSPACE_ICONS.import,
			label: 'Import',
			onclick: () => props.onImport?.(null)
		},
		{ id: 'separator-4', type: 'separator' },
		{
			id: 'duplicate',
			type: 'button',
			icon: WORKSPACE_ICONS.duplicate,
			label: 'Duplicate',
			disabled: (props.selectedNodeIds ?? []).length === 0 || !props.allowDuplicateNodes,
			onclick: handleDuplicateSelected
		},
		{
			id: 'delete',
			type: 'button',
			icon: WORKSPACE_ICONS.delete,
			label: 'Delete',
			disabled: (props.selectedNodeIds ?? []).length === 0 || !props.allowDeleteNodes,
			onclick: handleDeleteSelected
		}
	]);

	const allToolbarItems = $derived(
		(props.toolbarItems ?? []).length > 0 ? (props.toolbarItems ?? []) : defaultToolbarItems
	);
	const toolbarItems = $derived<SlotWorkspaceNode[]>(
		allToolbarItems.map((item) => ({
			...item,
			icon: typeof item.icon === 'string' ? item.icon : undefined
		}))
	);
	const effectivePanMode = $derived<RecipeWorkspace['panMode']>(
		activeTool === 'pan' ? 'drag' : (props.panMode ?? 'drag')
	);
	const effectiveGridMode = $derived<RecipeWorkspaceCanvas['gridMode']>(
		props.gridMode === 'none' ||
			props.gridMode === 'dots' ||
			props.gridMode === 'lines' ||
			props.gridMode === 'cross'
			? 'dot'
			: (props.gridMode ?? 'dot')
	);

	return {
		get editorRef() {
			return editorRef;
		},
		set editorRef(value: HTMLDivElement | null) {
			editorRef = value;
		},
		get addButtonAnchorRef() {
			return addButtonAnchorRef;
		},
		set addButtonAnchorRef(value: HTMLDivElement | null) {
			addButtonAnchorRef = value;
		},
		get canvasHostRef() {
			return canvasHostRef;
		},
		set canvasHostRef(value: HTMLDivElement | null) {
			canvasHostRef = value;
		},
		get canvasSize() {
			return canvasSize;
		},
		get internalZoom() {
			return internalZoom;
		},
		get internalOffset() {
			return internalOffset;
		},
		get isGridVisible() {
			return isGridVisible;
		},
		get isConnecting() {
			return isConnecting;
		},
		get connectionStartPosition() {
			return connectionStartPosition;
		},
		get connectionCurrentPosition() {
			return connectionCurrentPosition;
		},
		get anchoredPalettePosition() {
			return anchoredPalettePosition;
		},
		get isPaletteOpen() {
			return isPaletteOpen;
		},
		set isPaletteOpen(value: boolean) {
			isPaletteOpen = value;
		},
		get isPropertiesPanelOpen() {
			return isPropertiesPanelOpen;
		},
		set isPropertiesPanelOpen(value: boolean) {
			isPropertiesPanelOpen = value;
		},
		get paletteSearchQuery() {
			return paletteSearchQuery;
		},
		set paletteSearchQuery(value: string) {
			paletteSearchQuery = value;
		},
		get paletteSelectedCategory() {
			return paletteSelectedCategory;
		},
		set paletteSelectedCategory(value: string) {
			paletteSelectedCategory = value;
		},
		get selectedNode() {
			return selectedNode;
		},
		get defaultPaletteNodes() {
			return defaultPaletteNodes;
		},
		get allToolbarItems() {
			return allToolbarItems;
		},
		get toolbarItems() {
			return toolbarItems;
		},
		get effectivePanMode() {
			return effectivePanMode;
		},
		get effectiveGridMode() {
			return effectiveGridMode;
		},
		get restProps() {
			return restProps;
		},
		handleNodeSelect,
		handleNodeDrag,
		handleNodeDelete,
		handleNodeDuplicate,
		handlePaletteNodeSelect,
		handlePropertyChange,
		handleSave,
		recalculatePalettePosition,
		handleTogglePalette,
		handleToggleProperties,
		updateZoom,
		updateOffset,
		handleToolbarItemClick,
		handlePortConnectionStart,
		handlePortConnectionEnd,
		handleCanvasMouseMove,
		handleCanvasMouseUp,
		handleCanvasClick
	};
}

export default createWorkspaceState;
