<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import SlotGraphNode from './index.svelte';
	import SlotGraphEdge from '../graph-edge/index.svelte';
	import type { TokenSize as GraphNodeSize } from '$stylist/theme/type/alias/size';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';

	type Position = { x: number; y: number };
	type NodeKind = 'source' | 'gateway' | 'target';
	type CanvasNodeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
	type DemoNode = {
		id: string;
		label: string;
		type: NodeKind;
		color: string;
		position: Position;
	};

	const NODE_SIZE_PX: Record<CanvasNodeSize, number> = {
		xs: 20,
		sm: 24,
		md: 32,
		lg: 40,
		xl: 48,
		'2xl': 56
	};

	const GRID_SIZE = 20;
	const CANVAS_WIDTH = 620;
	const CANVAS_HEIGHT = 300;

	const controls: SlotStory[] = [
		{
			name: 'mainLabel',
			type: 'text',
			defaultValue: 'Primary'
		},
		{
			name: 'mainColor',
			type: 'color',
			defaultValue: '#3b82f6'
		},
		{
			name: 'mainType',
			type: 'select',
			options: ['source', 'gateway', 'target'],
			defaultValue: 'source'
		},
		{
			name: 'size',
			type: 'select',
			options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
			defaultValue: 'md'
		},
		{
			name: 'snapToGrid',
			type: 'boolean',
			defaultValue: true
		},
		{
			name: 'showEdges',
			type: 'boolean',
			defaultValue: true
		},
		{
			name: 'directed',
			type: 'boolean',
			defaultValue: true
		},
		{
			name: 'selected',
			type: 'boolean',
			defaultValue: true
		}
	];

	let nodes = $state<DemoNode[]>([
		{
			id: 'node-1',
			label: 'Primary',
			type: 'source',
			color: '#3b82f6',
			position: { x: 80, y: 130 }
		},
		{
			id: 'node-2',
			label: 'Gateway',
			type: 'gateway',
			color: '#f59e0b',
			position: { x: 290, y: 70 }
		},
		{
			id: 'node-3',
			label: 'Target',
			type: 'target',
			color: '#14b8a6',
			position: { x: 490, y: 180 }
		}
	]);

	let selectedNodeId = $state('node-1');
	let draggingNodeId = $state<string | null>(null);
	let dragOffset = $state<Position>({ x: 0, y: 0 });

	const links = [
		{ id: 'n-edge-1', from: 'node-1', to: 'node-2' },
		{ id: 'n-edge-2', from: 'node-2', to: 'node-3' }
	] as const;

	function getNodeSize(size: GraphNodeSize): number {
		return NODE_SIZE_PX[(size as CanvasNodeSize) ?? 'md'] ?? NODE_SIZE_PX.md;
	}

	function clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}

	function snap(value: number): number {
		return Math.round(value / GRID_SIZE) * GRID_SIZE;
	}

	function findNode(nodeId: string): DemoNode | undefined {
		return nodes.find((node) => node.id === nodeId);
	}

	function resolveCanvasRect(target: EventTarget | null): DOMRect | null {
		if (!(target instanceof HTMLElement)) {
			return null;
		}

		const canvas = target.closest('[data-graph-canvas="node-story"]');
		if (!(canvas instanceof HTMLElement)) {
			return null;
		}

		return canvas.getBoundingClientRect();
	}

	function centerOf(node: DemoNode, size: GraphNodeSize): Position {
		const nodeSize = getNodeSize(size);
		const radius = nodeSize / 2;
		return {
			x: node.position.x + radius,
			y: node.position.y + radius
		};
	}

	function edgeStyle(from: DemoNode, to: DemoNode, size: GraphNodeSize): Record<string, string> {
		const fromCenter = centerOf(from, size);
		const toCenter = centerOf(to, size);
		const dx = toCenter.x - fromCenter.x;
		const dy = toCenter.y - fromCenter.y;
		const length = Math.sqrt(dx * dx + dy * dy);
		const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

		return {
			'--edge-left': `${fromCenter.x}px`,
			'--edge-top': `${fromCenter.y}px`,
			'--edge-length': `${length}px`,
			'--edge-angle': `${angle}deg`,
			'--edge-color': '#64748b',
			'--edge-thickness': '2px',
			'--edge-label-display': 'none'
		};
	}

	function startDrag(event: PointerEvent, nodeId: string): void {
		const node = findNode(nodeId);
		if (!node) {
			return;
		}
		const canvasRect = resolveCanvasRect(event.currentTarget);
		if (!canvasRect) {
			return;
		}

		selectedNodeId = nodeId;
		draggingNodeId = nodeId;
		dragOffset = {
			x: event.clientX - canvasRect.left - node.position.x,
			y: event.clientY - canvasRect.top - node.position.y
		};
	}

	function dragNode(event: PointerEvent, snapToGrid: boolean, size: GraphNodeSize): void {
		if (!draggingNodeId) {
			return;
		}

		const canvas = event.currentTarget as HTMLElement;
		const rect = canvas.getBoundingClientRect();
		const nodeSize = getNodeSize(size);

		let nextX = event.clientX - rect.left - dragOffset.x;
		let nextY = event.clientY - rect.top - dragOffset.y;

		nextX = clamp(nextX, 0, CANVAS_WIDTH - nodeSize);
		nextY = clamp(nextY, 0, CANVAS_HEIGHT - nodeSize);

		if (snapToGrid) {
			nextX = clamp(snap(nextX), 0, CANVAS_WIDTH - nodeSize);
			nextY = clamp(snap(nextY), 0, CANVAS_HEIGHT - nodeSize);
		}

		nodes = nodes.map((node) =>
			node.id === draggingNodeId ? { ...node, position: { x: nextX, y: nextY } } : node
		);
	}

	function stopDrag(): void {
		draggingNodeId = null;
	}
</script>

<Story
	{controls}
	component={SlotGraphNode}
	title="SlotGraphNode Component"
	description="Interactive graph nodes with selection, drag-and-drop and live edge feedback."
>
	{#snippet children(values: any)}
		{@const nodeSize = (values.size as GraphNodeSize) ?? 'md'}
		<div class="_c1">
			<div class="_c2">
				<span class="_c3"> click to select, drag to move </span>
			</div>

			<div
				data-graph-canvas="node-story"
				class="_c4 [background-size:20px_20px]"
				style={`--gradient-inner: var(--color-border-primary); --gradient-outer: transparent; background-image: var(--gradient-radial-center); width:${CANVAS_WIDTH}px;height:${CANVAS_HEIGHT}px;`}
				onpointermove={(event) => dragNode(event, Boolean(values.snapToGrid), nodeSize)}
				onpointerup={stopDrag}
				onpointerleave={stopDrag}
			>
				{#if values.showEdges}
					{#each links as link (link.id)}
						{@const from = findNode(link.from)}
						{@const to = findNode(link.to)}
						{#if from && to}
							<SlotGraphEdge
								fromNodeId={from.id}
								toNodeId={to.id}
								type="straight"
								directed={Boolean(values.directed)}
								style={edgeStyle(from, to, nodeSize)}
							/>
						{/if}
					{/each}
				{/if}

				{#each nodes as node (node.id)}
					<SlotGraphNode
						id={node.id}
						x={node.position.x}
						y={node.position.y}
						label={node.id === 'node-1' ? String(values.mainLabel ?? node.label) : node.label}
						type={node.id === 'node-1' ? (values.mainType as NodeKind) : node.type}
						size={nodeSize}
						color={node.id === 'node-1' ? String(values.mainColor ?? node.color) : node.color}
						selected={node.id === 'node-1' ? Boolean(values.selected) : selectedNodeId === node.id}
						interactive={true}
						onclick={() => (selectedNodeId = node.id)}
						onpointerdown={(event) => startDrag(event, node.id)}
					/>
				{/each}
			</div>

			<div class="_c5">
				selected: <span class="_c6">{selectedNodeId}</span>
				{#if values.snapToGrid}
					<span class="_c7">snap: {GRID_SIZE}px</span>
				{/if}
			</div>
		</div>
	{/snippet}

	{#snippet variants()}
		<div class="_c8">
			<div>
				<h3 class="_c9">Size Ladder</h3>
				<div class="_c10">
					<div class="_c11">
						<SlotGraphNode id="size-xs" x={12} y={18} label="XS" size="xs" color="#0f766e" />
					</div>
					<div class="_c11">
						<SlotGraphNode id="size-sm" x={10} y={16} label="SM" size="sm" color="#0f766e" />
					</div>
					<div class="_c11">
						<SlotGraphNode id="size-md" x={6} y={12} label="MD" size="md" color="#0f766e" />
					</div>
					<div class="_c11">
						<SlotGraphNode id="size-lg" x={2} y={8} label="LG" size="lg" color="#0f766e" />
					</div>
					<div class="_c11">
						<SlotGraphNode id="size-xl" x={0} y={4} label="XL" size="xl" color="#0f766e" />
					</div>
					<div class="_c11">
						<SlotGraphNode id="size-2xl" x={0} y={0} label="2XL" size="2xl" color="#0f766e" />
					</div>
				</div>
			</div>

			<div>
				<h3 class="_c9">Type Gallery</h3>
				<div class="_c12">
					<div class="_c13">
						<div class="_c14">
							<SlotGraphNode
								id="type-source"
								x={0}
								y={0}
								label="IN"
								type="source"
								size="xl"
								color="#0f766e"
							/>
						</div>
						<strong class="_c15">Source</strong>
						<span class="_c16">solid border</span>
					</div>
					<div class="_c13">
						<div class="_c14">
							<SlotGraphNode
								id="type-gateway"
								x={0}
								y={0}
								label="GW"
								type="gateway"
								size="xl"
								color="#b45309"
								selected={true}
							/>
						</div>
						<strong class="_c15">Gateway</strong>
						<span class="_c16">dashed border</span>
					</div>
					<div class="_c13">
						<div class="_c14">
							<SlotGraphNode
								id="type-target"
								x={0}
								y={0}
								label="OUT"
								type="target"
								size="xl"
								color="#1d4ed8"
							/>
						</div>
						<strong class="_c15">Target</strong>
						<span class="_c16">output marker</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<style>
	._c1 {
		border-radius: 0.5rem;
		border-width: 1px;
		border-style: solid;
		border-color: var(--color-border-primary);
		background-color: var(--color-background-primary);
		padding: 1rem;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	}
	._c10 {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 1rem;
		border-radius: 0.5rem;
		border-width: 1px;
		border-style: solid;
		border-color: var(--color-border-primary);
		background-color: var(--color-background-secondary);
		padding: 1rem;
	}
	._c11 {
		position: relative;
		height: 5rem;
	}
	._c12 {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		border-radius: 0.5rem;
		border-width: 1px;
		border-style: solid;
		border-color: var(--color-border-primary);
		background-color: var(--color-background-secondary);
		padding: 1rem;
	}
	._c13 {
		display: grid;
		gap: 0.5rem;
		border-radius: 0.5rem;
		background-color: #ffffff;
		padding: 1rem;
		text-align: center;
	}
	._c14 {
		position: relative;
		margin-left: auto;
		margin-right: auto;
		height: 4rem;
		width: 4rem;
	}
	._c15 {
		font-size: 0.875rem;
		line-height: 1.25rem;
	}
	._c16 {
		font-size: 0.75rem;
		line-height: 1rem;
		color: var(--color-text-secondary);
	}
	._c2 {
		margin-bottom: 0.75rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.75rem;
		line-height: 1rem;
		color: var(--color-text-secondary);
	}
	._c3 {
		border-radius: 9999px;
		border-width: 1px;
		border-style: solid;
		border-color: var(--color-border-primary);
		background-color: var(--color-background-secondary);
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-top: 0.25rem;
		padding-bottom: 0.25rem;
	}
	._c4 {
		position: relative;
		overflow: hidden;
		border-radius: 0.25rem;
		border-width: 1px;
		border-style: solid;
		border-color: var(--color-border-primary);
	}
	._c5 {
		margin-top: 0.75rem;
		font-size: 0.75rem;
		line-height: 1rem;
		color: var(--color-text-secondary);
	}
	._c6 {
		font-weight: 600;
		color: var(--color-text-primary);
	}
	._c7 {
		margin-left: 0.5rem;
		border-radius: 0.25rem;
		background-color: var(--color-background-secondary);
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-top: 0.125rem;
		padding-bottom: 0.125rem;
	}
	._c8 {
		display: grid;
		gap: 1rem;
		border-radius: 0.5rem;
		border-width: 1px;
		border-style: solid;
		border-color: var(--color-border-primary);
		background-color: var(--color-background-primary);
		padding: 1rem;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	}
	._c9 {
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
</style>
