import { onDestroy, untrack } from 'svelte';
import type { SceneCamera } from '$stylist/graph/interface/slot/scene-camera';

import type { TOKEN_THEME_MODE } from '$stylist/theme/const/array/theme-mode';
import type { GraphToolMode } from '$stylist/graph/type/alias/graph-tool-mode';
import type { GraphNodeCategory } from '$stylist/graph/type/alias/graph-node-category';
import type { GraphWorkspaceNode } from '$stylist/workspace/interface/slot/graph-workspace-node';
import type { GraphWorkspaceConnection } from '$stylist/workspace/interface/slot/graph-workspace-connection';
import type { GraphWorkspaceConnectionInput } from '$stylist/workspace/type/alias/graph-workspace-connection-input';
import type { GraphNodeDraft } from '$stylist/workspace/interface/slot/graph-node-draft';
import { WORKSPACE_STYLIST_GRAPH_WORKSPACE_MESSAGE } from '$stylist/workspace/const/record/stylist-graph-workspace-message';
import { useMessage } from '$stylist/localization/function/hook/use-message';
import type { RecipeStylistGraphWorkspace } from '$stylist/workspace/interface/recipe/stylist-graph-workspace';
/** Reactive behavior of stylist-graph-workspace; props are read lazily when needed. */
export function createStylistGraphWorkspaceComponentState(
	getProps: () => Pick<
		RecipeStylistGraphWorkspace,
		'initialNodes' | 'initialConnections' | 'worldBounds'
	> & {
		initialNodes: Exclude<RecipeStylistGraphWorkspace['initialNodes'], undefined>;
		initialConnections: Exclude<RecipeStylistGraphWorkspace['initialConnections'], undefined>;
		worldBounds: Exclude<RecipeStylistGraphWorkspace['worldBounds'], undefined>;
	}
) {
	const props = $derived(getProps());
	const browser = typeof window !== 'undefined';
	const THEME_OPTIONS: (typeof TOKEN_THEME_MODE)[number][] = ['default', 'light', 'dark'];
	const TOOL_OPTIONS: { mode: GraphToolMode; label: string }[] = [
		{ mode: 'select', label: 'Select' },
		{ mode: 'pan', label: 'Pan' },
		{ mode: 'frame', label: 'Frame' },
		{ mode: 'inspect', label: 'Inspect' }
	];
	const ICON_BY_CATEGORY: Record<GraphNodeCategory, string> = {
		cluster: 'NS',
		signal: 'SG',
		insight: 'IN',
		delivery: 'DL',
		narrative: 'NV'
	};
	const DEFAULT_NODE_DRAFT: GraphNodeDraft = {
		title: 'New Node',
		category: 'signal',
		summary: 'Editable node',
		color: '#102a43',
		accent: '#60a5fa',
		width: 260,
		height: 160,
		details: 'First detail\nSecond detail'
	};
	function isWorkspaceConnection(
		connection: GraphWorkspaceConnectionInput
	): connection is GraphWorkspaceConnection {
		return !Array.isArray(connection);
	}
	function normalizeConnection(
		connection: GraphWorkspaceConnectionInput,
		index: number
	): GraphWorkspaceConnection {
		if (!isWorkspaceConnection(connection)) {
			return {
				id: `connection-${index + 1}`,
				startId: connection[0],
				endId: connection[1]
			};
		}

		return {
			id: connection.id,
			startId: connection.startId,
			endId: connection.endId
		};
	}
	const t = useMessage('stylist-graph-workspace', WORKSPACE_STYLIST_GRAPH_WORKSPACE_MESSAGE);
	// Texts of a new node follow the provider locale; the rest of the draft is plain data.
	const defaultNodeDraft = (): GraphNodeDraft => ({
		...DEFAULT_NODE_DRAFT,
		title: t('newNode'),
		summary: t('newNodeSummary'),
		details: t('newNodeDetails')
	});
	let viewportWidth = $state(1180);
	let viewportHeight = $state(760);
	let selectedTheme = $state<(typeof TOKEN_THEME_MODE)[number]>('default');
	let activeTool = $state<GraphToolMode>('select');
	let showDebug = $state(false);
	let selectedNodeId = $state<string>(untrack(() => props['initialNodes'][0]?.id ?? ''));
	let pendingConnectionTargetId = $state<string>('');
	let nodeDraft = $state<GraphNodeDraft>(defaultNodeDraft());
	let nodeLayouts = $state<GraphWorkspaceNode[]>(
		untrack(() => props['initialNodes'].map((node) => ({ ...node })))
	);
	let connections = $state<GraphWorkspaceConnection[]>(
		untrack(() =>
			props['initialConnections'].map((connection, index) => normalizeConnection(connection, index))
		)
	);
	let camera = $state<SceneCamera>(createOverviewCamera());
	let animationFrame = 0;
	let isViewportDragging = $state(false);
	let viewportDragStartClientX = $state(0);
	let viewportDragStartClientY = $state(0);
	let viewportDragStartCameraX = $state(0);
	let viewportDragStartCameraY = $state(0);
	let draggedNodeId = $state<string | null>(null);
	let dragStartClientX = $state(0);
	let dragStartClientY = $state(0);
	let dragNodeStartX = $state(0);
	let dragNodeStartY = $state(0);
	let dragMoved = $state(false);
	let suppressClickNodeId = $state<string | null>(null);
	const selectedNode = $derived(
		nodeLayouts.find((node) => node.id === selectedNodeId) ?? nodeLayouts[0] ?? null
	);
	const availableConnectionTargets = $derived(
		nodeLayouts.filter((node) => node.id !== selectedNodeId)
	);
	const nodeCategories = $derived(Array.from(new Set(nodeLayouts.map((node) => node.category))));
	const selectedNodeConnections = $derived(
		selectedNodeId
			? connections.filter(
					(connection) =>
						connection.startId === selectedNodeId || connection.endId === selectedNodeId
				)
			: []
	);
	const cameraSummary = $derived(
		`${camera.zoom.toFixed(2)}x · x${Math.round(camera.x)} · y${Math.round(camera.y)}`
	);
	$effect(() => {
		if (camera.viewportWidth === viewportWidth && camera.viewportHeight === viewportHeight) {
			return;
		}

		camera = {
			...camera,
			viewportWidth,
			viewportHeight
		};
	});
	onDestroy(() => {
		if (browser && animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
	});
	function clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}
	function createOverviewCamera(): SceneCamera {
		return {
			x: 0,
			y: 0,
			zoom: 0.58,
			depth: 640,
			viewportWidth,
			viewportHeight
		};
	}
	function depthFromZoom(zoom: number): number {
		const normalized = clamp((zoom - 0.4) / 1.8, 0, 1);
		return Math.round(920 - normalized * 760);
	}
	function makeCamera(centerX: number, centerY: number, zoom: number): SceneCamera {
		const visibleWidth = viewportWidth / zoom;
		const visibleHeight = viewportHeight / zoom;
		const maxX = Math.max(0, props['worldBounds'].width - visibleWidth);
		const maxY = Math.max(0, props['worldBounds'].height - visibleHeight);

		return {
			x: clamp(centerX - visibleWidth / 2, 0, maxX),
			y: clamp(centerY - visibleHeight / 2, 0, maxY),
			zoom,
			depth: depthFromZoom(zoom),
			viewportWidth,
			viewportHeight
		};
	}
	function createClampedCamera(nextX: number, nextY: number, nextZoom: number): SceneCamera {
		const zoom = clamp(nextZoom, 0.32, 2.4);
		const visibleWidth = viewportWidth / zoom;
		const visibleHeight = viewportHeight / zoom;
		const maxX = Math.max(0, props['worldBounds'].width - visibleWidth);
		const maxY = Math.max(0, props['worldBounds'].height - visibleHeight);

		return {
			x: clamp(nextX, 0, maxX),
			y: clamp(nextY, 0, maxY),
			zoom,
			depth: depthFromZoom(zoom),
			viewportWidth,
			viewportHeight
		};
	}
	function startCameraAnimation(target: SceneCamera) {
		if (!browser) {
			camera = target;
			return;
		}

		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}

		const step = () => {
			const nextX = camera.x + (target.x - camera.x) * 0.16;
			const nextY = camera.y + (target.y - camera.y) * 0.16;
			const nextZoom = camera.zoom + (target.zoom - camera.zoom) * 0.16;
			const nextDepth = camera.depth + (target.depth - camera.depth) * 0.16;
			const settled =
				Math.abs(target.x - camera.x) < 0.5 &&
				Math.abs(target.y - camera.y) < 0.5 &&
				Math.abs(target.zoom - camera.zoom) < 0.002 &&
				Math.abs(target.depth - camera.depth) < 0.5;

			if (settled) {
				camera = target;
				animationFrame = 0;
				return;
			}

			camera = {
				x: nextX,
				y: nextY,
				zoom: nextZoom,
				depth: nextDepth,
				viewportWidth,
				viewportHeight
			};

			animationFrame = requestAnimationFrame(step);
		};

		animationFrame = requestAnimationFrame(step);
	}
	function resetViewport() {
		startCameraAnimation(createOverviewCamera());
	}
	function adjustZoom(direction: 1 | -1) {
		const nextZoom = clamp(camera.zoom + direction * 0.14, 0.32, 2.4);
		const centerX = camera.x + viewportWidth / (2 * camera.zoom);
		const centerY = camera.y + viewportHeight / (2 * camera.zoom);
		startCameraAnimation(makeCamera(centerX, centerY, nextZoom));
	}
	function handleViewportPointerDown(event: PointerEvent) {
		if (activeTool !== 'pan' || event.button !== 0) {
			return;
		}

		const target = event.target as HTMLElement | null;
		if (target?.closest('.graph-editor-page__toolbar')) {
			return;
		}

		isViewportDragging = true;
		viewportDragStartClientX = event.clientX;
		viewportDragStartClientY = event.clientY;
		viewportDragStartCameraX = camera.x;
		viewportDragStartCameraY = camera.y;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}
	function handleViewportPointerMove(event: PointerEvent) {
		if (!isViewportDragging || activeTool !== 'pan') {
			return;
		}

		const deltaX = (event.clientX - viewportDragStartClientX) / camera.zoom;
		const deltaY = (event.clientY - viewportDragStartClientY) / camera.zoom;

		camera = createClampedCamera(
			viewportDragStartCameraX - deltaX,
			viewportDragStartCameraY - deltaY,
			camera.zoom
		);
	}
	function handleViewportPointerUp(event: PointerEvent) {
		if (!isViewportDragging) {
			return;
		}

		if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
			(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		}

		isViewportDragging = false;
	}
	function handleViewportWheel(event: WheelEvent) {
		event.preventDefault();

		const shell = event.currentTarget as HTMLElement;
		const rect = shell.getBoundingClientRect();
		const pointerX = event.clientX - rect.left;
		const pointerY = event.clientY - rect.top;
		const worldX = camera.x + pointerX / camera.zoom;
		const worldY = camera.y + pointerY / camera.zoom;
		const delta = event.deltaY < 0 ? 1 : -1;
		const nextZoom = clamp(camera.zoom + delta * 0.12, 0.32, 2.4);
		const nextX = worldX - pointerX / nextZoom;
		const nextY = worldY - pointerY / nextZoom;

		camera = createClampedCamera(nextX, nextY, nextZoom);
	}
	function focusNode(nodeId: string) {
		const node = nodeLayouts.find((entry) => entry.id === nodeId);
		if (!node) {
			return;
		}

		selectedNodeId = nodeId;
		startCameraAnimation(makeCamera(node.x + node.width / 2, node.y + node.height / 2, 1.18));
	}
	function slugify(value: string): string {
		return value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}
	function createUniqueNodeId(title: string): string {
		const base = slugify(title) || 'node';
		let nextId = base;
		let counter = 1;

		while (nodeLayouts.some((node) => node.id === nextId)) {
			counter += 1;
			nextId = `${base}-${counter}`;
		}

		return nextId;
	}
	function getNodeCenter(nodeId: string) {
		const node = nodeLayouts.find((entry) => entry.id === nodeId);
		if (!node) {
			return null;
		}

		return {
			x: node.x + node.width / 2,
			y: node.y + node.height / 2
		};
	}
	function getConnectionPoints(startId: string, endId: string) {
		const start = getNodeCenter(startId);
		const end = getNodeCenter(endId);

		if (!start || !end) {
			return null;
		}

		return {
			startX: start.x,
			startY: start.y,
			endX: end.x,
			endY: end.y
		};
	}
	function updateNode(nodeId: string, updater: (node: GraphWorkspaceNode) => GraphWorkspaceNode) {
		nodeLayouts = nodeLayouts.map((node) => (node.id === nodeId ? updater(node) : node));
	}
	function updateSelectedNodeField<K extends keyof GraphWorkspaceNode>(
		field: K,
		value: GraphWorkspaceNode[K]
	) {
		if (!selectedNodeId) {
			return;
		}

		updateNode(selectedNodeId, (node) => ({
			...node,
			[field]: value
		}));
	}
	function updateSelectedNodeNumber(field: 'x' | 'y' | 'width' | 'height', value: string) {
		const nextValue = Number(value);
		if (!Number.isFinite(nextValue) || !selectedNodeId) {
			return;
		}

		updateNode(selectedNodeId, (node) => {
			const bounded =
				field === 'width' || field === 'height'
					? Math.max(80, Math.round(nextValue))
					: Math.round(nextValue);

			return {
				...node,
				[field]: bounded
			};
		});
	}
	function updateSelectedNodeDetails(value: string) {
		updateSelectedNodeField(
			'details',
			value
				.split('\n')
				.map((item) => item.trim())
				.filter(Boolean)
		);
	}
	function addNode() {
		const zoomCenterX = camera.x + viewportWidth / (2 * camera.zoom);
		const zoomCenterY = camera.y + viewportHeight / (2 * camera.zoom);
		const id = createUniqueNodeId(nodeDraft.title);
		const nextNode: GraphWorkspaceNode = {
			id,
			title: nodeDraft.title.trim() || 'New Node',
			category: nodeDraft.category,
			x: clamp(
				Math.round(zoomCenterX - nodeDraft.width / 2),
				0,
				props['worldBounds'].width - nodeDraft.width
			),
			y: clamp(
				Math.round(zoomCenterY - nodeDraft.height / 2),
				0,
				props['worldBounds'].height - nodeDraft.height
			),
			width: Math.max(80, Math.round(nodeDraft.width)),
			height: Math.max(80, Math.round(nodeDraft.height)),
			color: nodeDraft.color,
			accent: nodeDraft.accent,
			summary: nodeDraft.summary.trim() || 'Editable node',
			details: nodeDraft.details
				.split('\n')
				.map((item) => item.trim())
				.filter(Boolean),
			shape: 'rounded'
		};

		nodeLayouts = [...nodeLayouts, nextNode];
		selectedNodeId = nextNode.id;
		pendingConnectionTargetId = '';
		nodeDraft = defaultNodeDraft();
	}
	function duplicateSelectedNode() {
		if (!selectedNode) {
			return;
		}

		const duplicateId = createUniqueNodeId(`${selectedNode.title} Copy`);
		const duplicateNode: GraphWorkspaceNode = {
			...selectedNode,
			id: duplicateId,
			title: `${selectedNode.title} Copy`,
			x: clamp(selectedNode.x + 60, 0, props['worldBounds'].width - selectedNode.width),
			y: clamp(selectedNode.y + 60, 0, props['worldBounds'].height - selectedNode.height)
		};

		nodeLayouts = [...nodeLayouts, duplicateNode];
		selectedNodeId = duplicateId;
	}
	function deleteSelectedNode() {
		if (!selectedNodeId) {
			return;
		}

		const nextNodes = nodeLayouts.filter((node) => node.id !== selectedNodeId);
		nodeLayouts = nextNodes;
		connections = connections.filter(
			(connection) => connection.startId !== selectedNodeId && connection.endId !== selectedNodeId
		);

		selectedNodeId = nextNodes[0]?.id ?? '';
		pendingConnectionTargetId = '';
	}
	function addConnection() {
		if (
			!selectedNodeId ||
			!pendingConnectionTargetId ||
			selectedNodeId === pendingConnectionTargetId
		) {
			return;
		}

		const exists = connections.some(
			(connection) =>
				connection.startId === selectedNodeId && connection.endId === pendingConnectionTargetId
		);
		if (exists) {
			return;
		}

		connections = [
			...connections,
			{
				id: `connection-${Date.now()}`,
				startId: selectedNodeId,
				endId: pendingConnectionTargetId
			}
		];
		pendingConnectionTargetId = '';
	}
	function removeConnection(connectionId: string) {
		connections = connections.filter((connection) => connection.id !== connectionId);
	}
	function updateNodePosition(nodeId: string, nextX: number, nextY: number) {
		updateNode(nodeId, (node) => ({
			...node,
			x: clamp(Math.round(nextX), 0, props['worldBounds'].width - node.width),
			y: clamp(Math.round(nextY), 0, props['worldBounds'].height - node.height)
		}));
	}
	function handleNodeActivate(nodeId: string) {
		if (suppressClickNodeId === nodeId) {
			suppressClickNodeId = null;
			return;
		}

		selectedNodeId = nodeId;

		if (activeTool === 'frame') {
			focusNode(nodeId);
		}

		if (activeTool === 'inspect') {
			showDebug = true;
		}
	}
	function handleNodePointerDown(event: PointerEvent, nodeId: string) {
		if (activeTool !== 'select' || event.button !== 0) {
			return;
		}

		const node = nodeLayouts.find((entry) => entry.id === nodeId);
		if (!node) {
			return;
		}

		draggedNodeId = nodeId;
		dragStartClientX = event.clientX;
		dragStartClientY = event.clientY;
		dragNodeStartX = node.x;
		dragNodeStartY = node.y;
		dragMoved = false;
		selectedNodeId = nodeId;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}
	function handleNodePointerMove(event: PointerEvent, nodeId: string) {
		if (activeTool !== 'select' || draggedNodeId !== nodeId) {
			return;
		}

		const deltaX = (event.clientX - dragStartClientX) / camera.zoom;
		const deltaY = (event.clientY - dragStartClientY) / camera.zoom;

		if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
			dragMoved = true;
		}

		updateNodePosition(nodeId, dragNodeStartX + deltaX, dragNodeStartY + deltaY);
	}
	function handleNodePointerUp(event: PointerEvent, nodeId: string) {
		if (draggedNodeId !== nodeId) {
			return;
		}

		if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
			(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		}

		if (dragMoved) {
			suppressClickNodeId = nodeId;
		}

		draggedNodeId = null;
		dragMoved = false;
	}
	return {
		get THEME_OPTIONS(): typeof THEME_OPTIONS {
			return THEME_OPTIONS;
		},
		get TOOL_OPTIONS(): typeof TOOL_OPTIONS {
			return TOOL_OPTIONS;
		},
		get ICON_BY_CATEGORY(): typeof ICON_BY_CATEGORY {
			return ICON_BY_CATEGORY;
		},
		get t(): typeof t {
			return t;
		},
		get viewportWidth(): typeof viewportWidth {
			return viewportWidth;
		},
		set viewportWidth(__nextValue: typeof viewportWidth) {
			viewportWidth = __nextValue;
		},
		get viewportHeight(): typeof viewportHeight {
			return viewportHeight;
		},
		set viewportHeight(__nextValue: typeof viewportHeight) {
			viewportHeight = __nextValue;
		},
		get selectedTheme(): typeof selectedTheme {
			return selectedTheme;
		},
		set selectedTheme(__nextValue: typeof selectedTheme) {
			selectedTheme = __nextValue;
		},
		get activeTool(): typeof activeTool {
			return activeTool;
		},
		set activeTool(__nextValue: typeof activeTool) {
			activeTool = __nextValue;
		},
		get showDebug(): typeof showDebug {
			return showDebug;
		},
		set showDebug(__nextValue: typeof showDebug) {
			showDebug = __nextValue;
		},
		get selectedNodeId(): typeof selectedNodeId {
			return selectedNodeId;
		},
		set selectedNodeId(__nextValue: typeof selectedNodeId) {
			selectedNodeId = __nextValue;
		},
		get pendingConnectionTargetId(): typeof pendingConnectionTargetId {
			return pendingConnectionTargetId;
		},
		set pendingConnectionTargetId(__nextValue: typeof pendingConnectionTargetId) {
			pendingConnectionTargetId = __nextValue;
		},
		get nodeDraft(): typeof nodeDraft {
			return nodeDraft;
		},
		set nodeDraft(__nextValue: typeof nodeDraft) {
			nodeDraft = __nextValue;
		},
		get nodeLayouts(): typeof nodeLayouts {
			return nodeLayouts;
		},
		set nodeLayouts(__nextValue: typeof nodeLayouts) {
			nodeLayouts = __nextValue;
		},
		get connections(): typeof connections {
			return connections;
		},
		set connections(__nextValue: typeof connections) {
			connections = __nextValue;
		},
		get camera(): typeof camera {
			return camera;
		},
		set camera(__nextValue: typeof camera) {
			camera = __nextValue;
		},
		get isViewportDragging(): typeof isViewportDragging {
			return isViewportDragging;
		},
		set isViewportDragging(__nextValue: typeof isViewportDragging) {
			isViewportDragging = __nextValue;
		},
		get draggedNodeId(): typeof draggedNodeId {
			return draggedNodeId;
		},
		set draggedNodeId(__nextValue: typeof draggedNodeId) {
			draggedNodeId = __nextValue;
		},
		get selectedNode(): typeof selectedNode {
			return selectedNode;
		},
		get availableConnectionTargets(): typeof availableConnectionTargets {
			return availableConnectionTargets;
		},
		get nodeCategories(): typeof nodeCategories {
			return nodeCategories;
		},
		get selectedNodeConnections(): typeof selectedNodeConnections {
			return selectedNodeConnections;
		},
		get cameraSummary(): typeof cameraSummary {
			return cameraSummary;
		},
		get resetViewport(): typeof resetViewport {
			return resetViewport;
		},
		get adjustZoom(): typeof adjustZoom {
			return adjustZoom;
		},
		get handleViewportPointerDown(): typeof handleViewportPointerDown {
			return handleViewportPointerDown;
		},
		get handleViewportPointerMove(): typeof handleViewportPointerMove {
			return handleViewportPointerMove;
		},
		get handleViewportPointerUp(): typeof handleViewportPointerUp {
			return handleViewportPointerUp;
		},
		get handleViewportWheel(): typeof handleViewportWheel {
			return handleViewportWheel;
		},
		get focusNode(): typeof focusNode {
			return focusNode;
		},
		get getConnectionPoints(): typeof getConnectionPoints {
			return getConnectionPoints;
		},
		get updateSelectedNodeField(): typeof updateSelectedNodeField {
			return updateSelectedNodeField;
		},
		get updateSelectedNodeNumber(): typeof updateSelectedNodeNumber {
			return updateSelectedNodeNumber;
		},
		get updateSelectedNodeDetails(): typeof updateSelectedNodeDetails {
			return updateSelectedNodeDetails;
		},
		get addNode(): typeof addNode {
			return addNode;
		},
		get duplicateSelectedNode(): typeof duplicateSelectedNode {
			return duplicateSelectedNode;
		},
		get deleteSelectedNode(): typeof deleteSelectedNode {
			return deleteSelectedNode;
		},
		get addConnection(): typeof addConnection {
			return addConnection;
		},
		get removeConnection(): typeof removeConnection {
			return removeConnection;
		},
		get handleNodeActivate(): typeof handleNodeActivate {
			return handleNodeActivate;
		},
		get handleNodePointerDown(): typeof handleNodePointerDown {
			return handleNodePointerDown;
		},
		get handleNodePointerMove(): typeof handleNodePointerMove {
			return handleNodePointerMove;
		},
		get handleNodePointerUp(): typeof handleNodePointerUp {
			return handleNodePointerUp;
		}
	};
}
export default createStylistGraphWorkspaceComponentState;
