<script lang="ts">
	const browser = typeof window !== 'undefined';
	import { onDestroy } from 'svelte';
	import type { SceneCamera } from '$stylist/graph/interface/slot/scene-camera';
	import NodeConnection from '$stylist/workspace/component/atom/node-connection/index.svelte';
	import NodeIcon from '$stylist/graph/component/atom/node-icon/index.svelte';
	import Viewport from '$stylist/workspace/component/atom/viewport/index.svelte';

	import type { TOKEN_THEME_MODE } from '$stylist/theme/const/array/theme-mode';
	import type { GraphToolMode } from '$stylist/graph/type/alias/graph-tool-mode';
	import type { GraphNodeCategory } from '$stylist/graph/type/alias/graph-node-category';
	import type { GraphWorkspaceNode } from '$stylist/workspace/interface/slot/graph-workspace-node';
	import type { GraphWorkspaceConnection } from '$stylist/workspace/interface/slot/graph-workspace-connection';
	import type { GraphWorkspaceBounds } from '$stylist/workspace/interface/slot/graph-workspace-bounds';
	import type { GraphWorkspaceConnectionInput } from '$stylist/workspace/type/alias/graph-workspace-connection-input';
	import type { GraphNodeDraft } from '$stylist/workspace/interface/slot/graph-node-draft';
	import type { RecipeStylistGraphWorkspace } from '$stylist/workspace/interface/recipe/stylist-graph-workspace';

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

	let {
		initialNodes = [],
		initialConnections = [],
		worldBounds = { width: 2200, height: 1400 }
	}: RecipeStylistGraphWorkspace = $props();

	let viewportWidth = $state(1180);
	let viewportHeight = $state(760);
	let selectedTheme = $state<(typeof TOKEN_THEME_MODE)[number]>('default');
	let activeTool = $state<GraphToolMode>('select');
	let showDebug = $state(false);
	let selectedNodeId = $state<string>(initialNodes[0]?.id ?? '');
	let pendingConnectionTargetId = $state<string>('');
	let nodeDraft = $state<GraphNodeDraft>({ ...DEFAULT_NODE_DRAFT });
	let nodeLayouts = $state<GraphWorkspaceNode[]>(initialNodes.map((node) => ({ ...node })));
	let connections = $state<GraphWorkspaceConnection[]>(
		initialConnections.map((connection, index) => normalizeConnection(connection, index))
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
		const maxX = Math.max(0, worldBounds.width - visibleWidth);
		const maxY = Math.max(0, worldBounds.height - visibleHeight);

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
		const maxX = Math.max(0, worldBounds.width - visibleWidth);
		const maxY = Math.max(0, worldBounds.height - visibleHeight);

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
				worldBounds.width - nodeDraft.width
			),
			y: clamp(
				Math.round(zoomCenterY - nodeDraft.height / 2),
				0,
				worldBounds.height - nodeDraft.height
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
		nodeDraft = { ...DEFAULT_NODE_DRAFT };
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
			x: clamp(selectedNode.x + 60, 0, worldBounds.width - selectedNode.width),
			y: clamp(selectedNode.y + 60, 0, worldBounds.height - selectedNode.height)
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
			x: clamp(Math.round(nextX), 0, worldBounds.width - node.width),
			y: clamp(Math.round(nextY), 0, worldBounds.height - node.height)
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
</script>

<section class={`graph-editor-page graph-editor-page--${selectedTheme}`}>
	<div class="graph-editor-page__layout">
		<aside class="workspace-panel workspace-panel--left">
			<section class="workspace-card">
				<div class="workspace-card__header">
					<h2>Graph</h2>
					<span>{nodeLayouts.length} nodes</span>
				</div>
				<div class="workspace-list">
					{#each nodeLayouts as node}
						<button
							type="button"
							class={`workspace-list__item ${node.id === selectedNodeId ? 'workspace-list__item--active' : ''}`}
							onclick={() => {
								selectedNodeId = node.id;
								if (activeTool === 'frame') {
									focusNode(node.id);
								}
							}}
						>
							<div>
								<strong>{node.title}</strong>
								<span>{node.category}</span>
							</div>
							<small>{node.x}, {node.y}</small>
						</button>
					{/each}
				</div>
			</section>

			<section class="workspace-card">
				<div class="workspace-card__header">
					<h2>Add Node</h2>
					<span>Center of viewport</span>
				</div>
				<div class="field-grid">
					<label class="field">
						<span>Title</span>
						<input
							value={nodeDraft.title}
							oninput={(event) => {
								nodeDraft = {
									...nodeDraft,
									title: (event.target as HTMLInputElement).value
								};
							}}
						/>
					</label>
					<label class="field">
						<span>Category</span>
						<select
							value={nodeDraft.category}
							onchange={(event) => {
								nodeDraft = {
									...nodeDraft,
									category: (event.target as HTMLSelectElement).value as GraphNodeCategory
								};
							}}
						>
							<option value="cluster">cluster</option>
							<option value="signal">signal</option>
							<option value="insight">insight</option>
							<option value="delivery">delivery</option>
							<option value="narrative">narrative</option>
						</select>
					</label>
					<label class="field field--full">
						<span>Summary</span>
						<input
							value={nodeDraft.summary}
							oninput={(event) => {
								nodeDraft = {
									...nodeDraft,
									summary: (event.target as HTMLInputElement).value
								};
							}}
						/>
					</label>
					<label class="field">
						<span>Accent</span>
						<input
							value={nodeDraft.accent}
							oninput={(event) => {
								nodeDraft = {
									...nodeDraft,
									accent: (event.target as HTMLInputElement).value
								};
							}}
						/>
					</label>
					<label class="field">
						<span>Color</span>
						<input
							value={nodeDraft.color}
							oninput={(event) => {
								nodeDraft = {
									...nodeDraft,
									color: (event.target as HTMLInputElement).value
								};
							}}
						/>
					</label>
					<label class="field">
						<span>Width</span>
						<input
							type="number"
							value={String(nodeDraft.width)}
							oninput={(event) => {
								nodeDraft = {
									...nodeDraft,
									width: Number((event.target as HTMLInputElement).value) || nodeDraft.width
								};
							}}
						/>
					</label>
					<label class="field">
						<span>Height</span>
						<input
							type="number"
							value={String(nodeDraft.height)}
							oninput={(event) => {
								nodeDraft = {
									...nodeDraft,
									height: Number((event.target as HTMLInputElement).value) || nodeDraft.height
								};
							}}
						/>
					</label>
					<label class="field field--full">
						<span>Details</span>
						<textarea
							rows="4"
							value={nodeDraft.details}
							oninput={(event) => {
								nodeDraft = {
									...nodeDraft,
									details: (event.target as HTMLTextAreaElement).value
								};
							}}
						></textarea>
					</label>
				</div>
				<div class="action-row">
					<button type="button" class="action-button action-button--primary" onclick={addNode}>
						Add node
					</button>
				</div>
			</section>
		</aside>

		<div
			class={`graph-editor-page__viewport-shell ${activeTool === 'pan' ? 'graph-editor-page__viewport-shell--pan' : ''} ${isViewportDragging ? 'graph-editor-page__viewport-shell--dragging' : ''}`}
			bind:clientWidth={viewportWidth}
			bind:clientHeight={viewportHeight}
			onpointerdown={handleViewportPointerDown}
			onpointermove={handleViewportPointerMove}
			onpointerup={handleViewportPointerUp}
			onpointercancel={handleViewportPointerUp}
			onwheel={handleViewportWheel}
		>
			<div class="graph-editor-page__toolbar">
				<div class="workspace-toolbar" role="toolbar" aria-label="Graph workspace controls">
					<div class="workspace-toolbar__group">
						{#each TOOL_OPTIONS as tool}
							<button
								type="button"
								class={`workspace-toolbar__button ${activeTool === tool.mode ? 'workspace-toolbar__button--active' : ''}`}
								onclick={() => {
									activeTool = tool.mode;
								}}
							>
								{tool.label}
							</button>
						{/each}
					</div>

					<div class="workspace-toolbar__separator"></div>

					<div class="workspace-toolbar__group">
						<button type="button" class="workspace-toolbar__button" onclick={() => adjustZoom(-1)}>
							Zoom -
						</button>
						<button type="button" class="workspace-toolbar__button" onclick={() => adjustZoom(1)}>
							Zoom +
						</button>
						<button type="button" class="workspace-toolbar__button" onclick={resetViewport}>
							Reset
						</button>
					</div>

					<div class="workspace-toolbar__separator"></div>

					<div class="workspace-toolbar__group">
						<label class="workspace-toolbar__field">
							<span>Theme</span>
							<select
								value={selectedTheme}
								onchange={(event) => {
									selectedTheme = (event.target as HTMLSelectElement)
										.value as (typeof TOKEN_THEME_MODE)[number];
								}}
							>
								{#each THEME_OPTIONS as theme}
									<option value={theme}>{theme}</option>
								{/each}
							</select>
						</label>
						<button
							type="button"
							class={`workspace-toolbar__button ${showDebug ? 'workspace-toolbar__button--active' : ''}`}
							onclick={() => {
								showDebug = !showDebug;
							}}
						>
							Debug
						</button>
					</div>
				</div>
			</div>

			<Viewport
				{camera}
				worldWidth={worldBounds.width}
				worldHeight={worldBounds.height}
				showGrid={true}
				interactive={activeTool === 'pan'}
			>
				<div class="workspace-grid"></div>

				<svg
					class="workspace-connections"
					viewBox={`0 0 ${worldBounds.width} ${worldBounds.height}`}
					width={worldBounds.width}
					height={worldBounds.height}
				>
					{#each connections as connection, index (connection.id)}
						{@const points = getConnectionPoints(connection.startId, connection.endId)}
						{#if points}
							<NodeConnection
								id={connection.id}
								startX={points.startX}
								startY={points.startY}
								endX={points.endX}
								endY={points.endY}
								type={index % 2 === 0 ? 'straight' : 'curve'}
								style={index % 2 === 0 ? 'solid' : 'dashed'}
								width={connection.startId === selectedNodeId || connection.endId === selectedNodeId
									? 3
									: 2}
								color="color-mix(in srgb, var(--workspace-line) 78%, transparent)"
								activeColor="var(--workspace-line-active)"
								hoverColor="var(--workspace-line-hover)"
								active={connection.startId === selectedNodeId ||
									connection.endId === selectedNodeId}
								showArrow={true}
								animated={activeTool === 'frame'}
							/>
						{/if}
					{/each}
				</svg>

				{#each nodeLayouts as node (node.id)}
					<button
						type="button"
						class={`graph-node ${node.id === selectedNodeId ? 'graph-node--active' : ''} ${activeTool === 'select' ? 'graph-node--select' : ''} ${activeTool === 'frame' ? 'graph-node--frame' : ''} ${activeTool === 'inspect' ? 'graph-node--inspect' : ''}`}
						style={`left:${node.x}px; top:${node.y}px; width:${node.width}px; height:${node.height}px; --node-accent:${node.accent}; --node-color:${node.color};`}
						onclick={() => handleNodeActivate(node.id)}
						onpointerdown={(event) => handleNodePointerDown(event, node.id)}
						onpointermove={(event) => handleNodePointerMove(event, node.id)}
						onpointerup={(event) => handleNodePointerUp(event, node.id)}
						onpointercancel={(event) => handleNodePointerUp(event, node.id)}
					>
						<div class="graph-node__head">
							<NodeIcon
								icon={ICON_BY_CATEGORY[node.category]}
								accent={node.accent}
								background="color-mix(in srgb, var(--workspace-panel) 80%, white)"
							/>
							<div class="graph-node__title-block">
								<span class="graph-node__title">{node.title}</span>
								<span class="graph-node__tag">{node.category}</span>
							</div>
						</div>
						<p class="graph-node__summary">{node.summary}</p>
						<div class="graph-node__meta">
							<span>{node.details.length} details</span>
							<span>{node.width}×{node.height}</span>
						</div>
					</button>
				{/each}
			</Viewport>
		</div>

		<aside class="workspace-panel workspace-panel--right">
			<section class="workspace-card">
				<div class="workspace-card__header">
					<h2>Viewport</h2>
					<span>{cameraSummary}</span>
				</div>
				<div class="status-grid">
					<div>
						<span>Tool</span>
						<strong>{activeTool}</strong>
					</div>
					<div>
						<span>Connections</span>
						<strong>{connections.length}</strong>
					</div>
					<div>
						<span>Categories</span>
						<strong>{nodeCategories.length}</strong>
					</div>
				</div>
			</section>

			<section class="workspace-card">
				<div class="workspace-card__header">
					<h2>Node Properties</h2>
					<span>{selectedNode ? selectedNode.id : 'No selection'}</span>
				</div>

				{#if selectedNode}
					<div class="field-grid">
						<label class="field">
							<span>Title</span>
							<input
								value={selectedNode.title}
								oninput={(event) =>
									updateSelectedNodeField('title', (event.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="field">
							<span>Category</span>
							<select
								value={selectedNode.category}
								onchange={(event) =>
									updateSelectedNodeField(
										'category',
										(event.target as HTMLSelectElement).value as GraphNodeCategory
									)}
							>
								<option value="cluster">cluster</option>
								<option value="signal">signal</option>
								<option value="insight">insight</option>
								<option value="delivery">delivery</option>
								<option value="narrative">narrative</option>
							</select>
						</label>
						<label class="field field--full">
							<span>Summary</span>
							<input
								value={selectedNode.summary}
								oninput={(event) =>
									updateSelectedNodeField('summary', (event.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="field">
							<span>Accent</span>
							<input
								value={selectedNode.accent}
								oninput={(event) =>
									updateSelectedNodeField('accent', (event.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="field">
							<span>Color</span>
							<input
								value={selectedNode.color}
								oninput={(event) =>
									updateSelectedNodeField('color', (event.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="field">
							<span>X</span>
							<input
								type="number"
								value={String(selectedNode.x)}
								oninput={(event) =>
									updateSelectedNodeNumber('x', (event.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="field">
							<span>Y</span>
							<input
								type="number"
								value={String(selectedNode.y)}
								oninput={(event) =>
									updateSelectedNodeNumber('y', (event.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="field">
							<span>Width</span>
							<input
								type="number"
								value={String(selectedNode.width)}
								oninput={(event) =>
									updateSelectedNodeNumber('width', (event.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="field">
							<span>Height</span>
							<input
								type="number"
								value={String(selectedNode.height)}
								oninput={(event) =>
									updateSelectedNodeNumber('height', (event.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="field field--full">
							<span>Details</span>
							<textarea
								rows="5"
								value={selectedNode.details.join('\n')}
								oninput={(event) =>
									updateSelectedNodeDetails((event.target as HTMLTextAreaElement).value)}
							></textarea>
						</label>
					</div>

					<div class="action-row">
						<button type="button" class="action-button" onclick={() => focusNode(selectedNode.id)}>
							Focus
						</button>
						<button type="button" class="action-button" onclick={duplicateSelectedNode}>
							Duplicate
						</button>
						<button
							type="button"
							class="action-button action-button--danger"
							onclick={deleteSelectedNode}
						>
							Delete
						</button>
					</div>
				{:else}
					<p class="empty-state">Select a node to edit its properties.</p>
				{/if}
			</section>

			<section class="workspace-card">
				<div class="workspace-card__header">
					<h2>Connections</h2>
					<span>{selectedNodeConnections.length}</span>
				</div>

				{#if selectedNode}
					<div class="field-grid">
						<label class="field field--full">
							<span>Add outgoing connection</span>
							<select
								value={pendingConnectionTargetId}
								onchange={(event) => {
									pendingConnectionTargetId = (event.target as HTMLSelectElement).value;
								}}
							>
								<option value="">Select target</option>
								{#each availableConnectionTargets as target}
									<option value={target.id}>{target.title}</option>
								{/each}
							</select>
						</label>
					</div>
					<div class="action-row">
						<button
							type="button"
							class="action-button action-button--primary"
							onclick={addConnection}
						>
							Add connection
						</button>
					</div>

					<div class="workspace-list workspace-list--compact">
						{#each selectedNodeConnections as connection}
							<div class="workspace-list__entry">
								<div>
									<strong>{connection.startId}</strong>
									<span>{connection.endId}</span>
								</div>
								<button
									type="button"
									class="inline-remove"
									onclick={() => removeConnection(connection.id)}
								>
									Remove
								</button>
							</div>
						{/each}
						{#if selectedNodeConnections.length === 0}
							<p class="empty-state">No connections for the selected node.</p>
						{/if}
					</div>
				{:else}
					<p class="empty-state">Select a node to manage connections.</p>
				{/if}
			</section>

			{#if showDebug}
				<section class="workspace-card">
					<div class="workspace-card__header">
						<h2>Debug</h2>
						<span>Live</span>
					</div>
					<pre class="debug-block">{JSON.stringify(
							{
								tool: activeTool,
								camera,
								selectedNodeId,
								nodeCount: nodeLayouts.length,
								connectionCount: connections.length,
								draggedNodeId
							},
							null,
							2
						)}</pre>
				</section>
			{/if}
		</aside>
	</div>
</section>

<style>
	:global(body) {
		margin: 0;
		background:
			radial-gradient(circle at top left, rgba(255, 255, 255, 0.72), transparent 28%),
			linear-gradient(180deg, #eef3f9 0%, #dde7f4 100%);
	}

	.graph-editor-page {
		--workspace-canvas: #edf3fa;
		--workspace-chrome: #fbfdff;
		--workspace-panel: rgba(255, 255, 255, 0.88);
		--workspace-text: #12263f;
		--workspace-muted: #607289;
		--workspace-grid: rgba(34, 61, 102, 0.1);
		--workspace-line: #46628f;
		--workspace-line-active: #eb7d43;
		--workspace-line-hover: #6ea8ff;
		min-height: 100vh;
		padding: 1rem;
		color: var(--workspace-text);
	}

	.graph-editor-page--light {
		--workspace-canvas: #f9efe6;
		--workspace-chrome: #fffbf7;
		--workspace-panel: rgba(255, 250, 244, 0.92);
		--workspace-text: #452b18;
		--workspace-muted: #79624e;
		--workspace-grid: rgba(105, 77, 53, 0.1);
		--workspace-line: #a36a46;
		--workspace-line-active: #de7b34;
		--workspace-line-hover: #be7340;
	}

	.graph-editor-page--dark {
		--workspace-canvas: #08111d;
		--workspace-chrome: #0e192a;
		--workspace-panel: rgba(13, 22, 38, 0.9);
		--workspace-text: #edf4ff;
		--workspace-muted: #9ab0cf;
		--workspace-grid: rgba(153, 187, 255, 0.1);
		--workspace-line: #87acf2;
		--workspace-line-active: #ffb366;
		--workspace-line-hover: #a8c9ff;
	}

	.graph-editor-page__layout {
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr) 360px;
		gap: 1rem;
		min-height: calc(100vh - 2rem);
	}

	.workspace-panel {
		display: grid;
		gap: 1rem;
		align-content: start;
	}

	.workspace-card {
		display: grid;
		gap: 0.85rem;
		padding: 1rem;
		border-radius: 1.2rem;
		background: color-mix(in srgb, var(--workspace-panel) 92%, white);
		border: 1px solid color-mix(in srgb, var(--workspace-text) 10%, transparent);
		box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
	}

	.workspace-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.workspace-card__header h2 {
		margin: 0;
		font-size: 0.98rem;
	}

	.workspace-card__header span {
		font-size: 0.76rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--workspace-muted);
	}

	.graph-editor-page__viewport-shell {
		position: relative;
		min-height: 82vh;
		border-radius: 1.5rem;
		overflow: hidden;
		background:
			radial-gradient(
				circle at top center,
				color-mix(in srgb, var(--workspace-chrome) 78%, white),
				transparent 34%
			),
			linear-gradient(
				180deg,
				var(--workspace-canvas) 0%,
				color-mix(in srgb, var(--workspace-canvas) 88%, black) 100%
			);
		border: 1px solid color-mix(in srgb, var(--workspace-text) 10%, transparent);
		box-shadow: 0 28px 90px rgba(15, 23, 42, 0.14);
	}

	.graph-editor-page__viewport-shell--pan {
		cursor: grab;
	}

	.graph-editor-page__viewport-shell--dragging {
		cursor: grabbing;
	}

	.graph-editor-page__toolbar {
		position: absolute;
		top: 1rem;
		left: 1rem;
		right: 1rem;
		z-index: 20;
		display: flex;
		justify-content: center;
	}

	.workspace-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0.9rem;
		border-radius: 1.15rem;
		background: color-mix(in srgb, var(--workspace-panel) 92%, white);
		border: 1px solid color-mix(in srgb, var(--workspace-text) 10%, transparent);
		box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
		backdrop-filter: blur(14px);
	}

	.workspace-toolbar__group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.workspace-toolbar__separator {
		width: 1px;
		align-self: stretch;
		background: color-mix(in srgb, var(--workspace-text) 12%, transparent);
	}

	.workspace-toolbar__button,
	.workspace-toolbar select,
	.field input,
	.field select,
	.field textarea {
		border: 1px solid color-mix(in srgb, var(--workspace-text) 10%, transparent);
		background: color-mix(in srgb, var(--workspace-panel) 92%, transparent);
		color: var(--workspace-text);
		border-radius: 0.85rem;
		font: inherit;
	}

	.workspace-toolbar__button {
		padding: 0.55rem 0.85rem;
		cursor: pointer;
		transition:
			transform 160ms ease,
			border-color 160ms ease,
			background 160ms ease;
	}

	.workspace-toolbar__button:hover,
	.workspace-toolbar__button--active {
		transform: translateY(-1px);
		border-color: color-mix(in srgb, var(--workspace-line-active) 45%, transparent);
		background: color-mix(in srgb, var(--workspace-panel) 74%, var(--workspace-line-active) 12%);
	}

	.workspace-toolbar__field {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.workspace-toolbar__field span {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--workspace-muted);
	}

	.workspace-toolbar select {
		padding: 0.45rem 0.65rem;
	}

	.workspace-grid {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(var(--workspace-grid) 1px, transparent 1px),
			linear-gradient(90deg, var(--workspace-grid) 1px, transparent 1px);
		background-size: 100px 100px;
		mask-image: radial-gradient(circle at center, black 56%, transparent 94%);
	}

	.workspace-connections {
		position: absolute;
		inset: 0;
		overflow: visible;
		pointer-events: none;
	}

	.workspace-list {
		display: grid;
		gap: 0.55rem;
		max-height: 320px;
		overflow: auto;
	}

	.workspace-list--compact {
		max-height: 220px;
	}

	.workspace-list__item,
	.workspace-list__entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.9rem;
		padding: 0.8rem 0.9rem;
		border-radius: 0.95rem;
		border: 1px solid color-mix(in srgb, var(--workspace-text) 10%, transparent);
		background: color-mix(in srgb, var(--workspace-panel) 92%, transparent);
		color: var(--workspace-text);
		text-align: left;
	}

	.workspace-list__item {
		cursor: pointer;
		transition:
			transform 160ms ease,
			border-color 160ms ease,
			background 160ms ease;
	}

	.workspace-list__item:hover,
	.workspace-list__item--active {
		transform: translateX(-3px);
		border-color: color-mix(in srgb, var(--workspace-line-active) 45%, transparent);
		background: color-mix(in srgb, var(--workspace-panel) 76%, var(--workspace-line-active) 10%);
	}

	.workspace-list__item strong,
	.workspace-list__entry strong {
		display: block;
		font-size: 0.92rem;
	}

	.workspace-list__item span,
	.workspace-list__entry span,
	.workspace-list__item small {
		color: var(--workspace-muted);
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.field {
		display: grid;
		gap: 0.35rem;
	}

	.field--full {
		grid-column: 1 / -1;
	}

	.field span {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--workspace-muted);
	}

	.field input,
	.field select,
	.field textarea {
		padding: 0.65rem 0.75rem;
	}

	.field textarea {
		resize: vertical;
	}

	.action-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.action-button {
		padding: 0.65rem 0.9rem;
		border: 1px solid color-mix(in srgb, var(--workspace-text) 10%, transparent);
		border-radius: 0.9rem;
		background: color-mix(in srgb, var(--workspace-panel) 92%, transparent);
		color: var(--workspace-text);
		cursor: pointer;
		font: inherit;
	}

	.action-button--primary {
		background: color-mix(in srgb, var(--workspace-line-active) 18%, var(--workspace-panel));
	}

	.action-button--danger {
		border-color: color-mix(in srgb, #d95d5d 45%, transparent);
		color: #b33f3f;
	}

	.status-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.7rem;
	}

	.status-grid > div {
		display: grid;
		gap: 0.25rem;
		padding: 0.8rem 0.9rem;
		border-radius: 0.95rem;
		background: color-mix(in srgb, var(--workspace-panel) 86%, transparent);
		border: 1px solid color-mix(in srgb, var(--workspace-text) 8%, transparent);
	}

	.status-grid span {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--workspace-muted);
	}

	.graph-node {
		position: absolute;
		display: grid;
		align-content: start;
		gap: 0.7rem;
		padding: 0.95rem;
		border-radius: 1.1rem;
		border: 1px solid color-mix(in srgb, var(--node-accent) 34%, rgba(255, 255, 255, 0.2));
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--workspace-panel) 88%, white),
			color-mix(in srgb, var(--node-color) 16%, var(--workspace-panel))
		);
		box-shadow:
			0 18px 34px rgba(15, 23, 42, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.28);
		color: var(--workspace-text);
		text-align: left;
		cursor: pointer;
		transition:
			transform 160ms ease,
			filter 160ms ease,
			border-color 160ms ease;
	}

	.graph-node:hover {
		transform: translateY(-2px);
		filter: drop-shadow(0 14px 26px rgba(15, 23, 42, 0.14));
	}

	.graph-node--active {
		border-color: color-mix(in srgb, var(--node-accent) 58%, transparent);
		filter: drop-shadow(0 18px 34px color-mix(in srgb, var(--node-accent) 26%, transparent));
	}

	.graph-node--select {
		cursor: grab;
	}

	.graph-node--select:active {
		cursor: grabbing;
	}

	.graph-node--frame {
		cursor: zoom-in;
	}

	.graph-node--inspect {
		cursor: help;
	}

	.graph-node__head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.graph-node__title-block {
		display: grid;
		gap: 0.25rem;
		min-width: 0;
	}

	.graph-node__title {
		font-size: 0.96rem;
		font-weight: 700;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.graph-node__tag {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--workspace-muted);
	}

	.graph-node__summary {
		margin: 0;
		font-size: 0.88rem;
		line-height: 1.45;
		color: var(--workspace-muted);
	}

	.graph-node__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.graph-node__meta span {
		padding: 0.3rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--node-accent) 14%, var(--workspace-panel));
		border: 1px solid color-mix(in srgb, var(--node-accent) 20%, transparent);
		font-size: 0.76rem;
	}

	.inline-remove {
		padding: 0.4rem 0.65rem;
		border: 0;
		border-radius: 0.7rem;
		background: rgba(217, 93, 93, 0.12);
		color: #b33f3f;
		cursor: pointer;
		font: inherit;
	}

	.empty-state {
		margin: 0;
		color: var(--workspace-muted);
		line-height: 1.5;
	}

	.debug-block {
		margin: 0;
		padding: 0.9rem;
		border-radius: 0.95rem;
		background: color-mix(in srgb, var(--workspace-text) 6%, transparent);
		color: var(--workspace-text);
		font-size: 0.76rem;
		overflow: auto;
	}

	@media (max-width: 1400px) {
		.graph-editor-page__layout {
			grid-template-columns: 300px minmax(0, 1fr);
		}

		.workspace-panel--right {
			grid-column: 1 / -1;
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (max-width: 1024px) {
		.graph-editor-page__layout {
			grid-template-columns: 1fr;
		}

		.workspace-panel--right,
		.workspace-panel--left {
			grid-template-columns: 1fr;
		}

		.graph-editor-page__viewport-shell {
			min-height: 70vh;
		}

		.status-grid,
		.field-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 720px) {
		.graph-editor-page {
			padding: 0.75rem;
		}

		.workspace-toolbar {
			justify-content: flex-start;
		}

		.workspace-toolbar__separator {
			display: none;
		}
	}
</style>
