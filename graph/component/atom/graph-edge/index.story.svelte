<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import SlotGraphEdge from './index.svelte';
	import SlotGraphNode from '../graph-node/index.svelte';
	import type { TokenSize as GraphNodeSize } from '$stylist/theme/type/alias/size';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';

	type Position = { x: number; y: number };
	type CanvasNodeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
	type DemoNode = {
		id: string;
		label: string;
		type: 'source' | 'gateway' | 'target';
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
	const CANVAS_WIDTH = 640;
	const CANVAS_HEIGHT = 320;

	const controls: SlotStory[] = [
		{
			name: 'edgeType',
			type: 'select',
			options: ['straight', 'curve', 'polyline'],
			defaultValue: 'straight'
		},
		{ name: 'directed', type: 'boolean', defaultValue: true },
		{ name: 'active', type: 'boolean', defaultValue: false },
		{
			name: 'nodeSize',
			type: 'select',
			options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
			defaultValue: 'md'
		},
		{ name: 'edgeColor', type: 'color', defaultValue: '#2563eb' },
		{ name: 'edgeThickness', type: 'range', defaultValue: 3, min: 1, max: 8, step: 1 },
		{ name: 'showLabels', type: 'boolean', defaultValue: true },
		{ name: 'snapToGrid', type: 'boolean', defaultValue: true }
	];

	let nodes = $state<DemoNode[]>([
		{ id: 'node-1', label: 'Source', type: 'source', color: '#14b8a6', position: { x: 80, y: 90 } },
		{
			id: 'node-2',
			label: 'Gateway',
			type: 'gateway',
			color: '#f59e0b',
			position: { x: 280, y: 50 }
		},
		{
			id: 'node-3',
			label: 'Target',
			type: 'target',
			color: '#3b82f6',
			position: { x: 500, y: 200 }
		}
	]);

	let selectedNodeId = $state('node-1');
	let draggingNodeId = $state<string | null>(null);
	let dragOffset = $state<Position>({ x: 0, y: 0 });

	const edges = [
		{ id: 'edge-1', from: 'node-1', to: 'node-2' },
		{ id: 'edge-2', from: 'node-2', to: 'node-3' },
		{ id: 'edge-3', from: 'node-1', to: 'node-3' }
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
		if (!(target instanceof HTMLElement)) return null;
		const canvas = target.closest('[data-graph-canvas="edge-story"]');
		if (!(canvas instanceof HTMLElement)) return null;
		return canvas.getBoundingClientRect();
	}

	function centerOf(node: DemoNode, size: GraphNodeSize): Position {
		const nodeSize = getNodeSize(size);
		const radius = nodeSize / 2;
		return { x: node.position.x + radius, y: node.position.y + radius };
	}

	function edgeStyle(from: DemoNode, to: DemoNode, values: any): Record<string, string> {
		const currentSize = (values.nodeSize as GraphNodeSize) ?? 'md';
		const fromCenter = centerOf(from, currentSize);
		const toCenter = centerOf(to, currentSize);
		const dx = toCenter.x - fromCenter.x;
		const dy = toCenter.y - fromCenter.y;
		const length = Math.sqrt(dx * dx + dy * dy);
		const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

		return {
			'--edge-left': `${fromCenter.x}px`,
			'--edge-top': `${fromCenter.y}px`,
			'--edge-length': `${length}px`,
			'--edge-angle': `${angle}deg`,
			'--edge-color': String(values.edgeColor ?? '#2563eb'),
			'--edge-thickness': `${Number(values.edgeThickness ?? 3)}px`,
			'--edge-label-display': values.showLabels ? 'inline-flex' : 'none'
		};
	}

	function startDrag(event: PointerEvent, nodeId: string): void {
		const node = findNode(nodeId);
		if (!node) return;
		const canvasRect = resolveCanvasRect(event.currentTarget);
		if (!canvasRect) return;

		selectedNodeId = nodeId;
		draggingNodeId = nodeId;
		dragOffset = {
			x: event.clientX - canvasRect.left - node.position.x,
			y: event.clientY - canvasRect.top - node.position.y
		};
	}

	function dragNode(event: PointerEvent, snapToGrid: boolean, size: GraphNodeSize): void {
		if (!draggingNodeId) return;

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
	component={SlotGraphEdge}
	title="SlotGraphEdge Component"
	description="Interactive graph edges between draggable nodes. Use the controls to compare straight, curved and polyline routing."
>
	{#snippet children(values: any)}
		<div class="edge-story-shell">
			<div class="edge-story-chips">
				<span>type: {values.edgeType}</span>
				<span>directed: {values.directed ? 'yes' : 'no'}</span>
				<span>drag nodes to recalc geometry</span>
			</div>

			<div
				data-graph-canvas="edge-story"
				class="edge-stage"
				onpointermove={(event) =>
					dragNode(event, Boolean(values.snapToGrid), (values.nodeSize as GraphNodeSize) ?? 'md')}
				onpointerup={stopDrag}
				onpointerleave={stopDrag}
			>
				{#each edges as edge (edge.id)}
					{@const from = findNode(edge.from)}
					{@const to = findNode(edge.to)}
					{#if from && to}
						<SlotGraphEdge
							fromNodeId={edge.from}
							toNodeId={edge.to}
							directed={Boolean(values.directed)}
							active={Boolean(values.active)}
							type={(values.edgeType as 'straight' | 'curve' | 'polyline') ?? 'straight'}
							label={values.showLabels ? `${from.label} -> ${to.label}` : ''}
							style={edgeStyle(from, to, values)}
						/>
					{/if}
				{/each}

				{#each nodes as node (node.id)}
					<SlotGraphNode
						id={node.id}
						label={node.label}
						x={node.position.x}
						y={node.position.y}
						type={node.type}
						color={node.color}
						size={(values.nodeSize as GraphNodeSize) ?? 'md'}
						selected={selectedNodeId === node.id}
						interactive={true}
						onpointerdown={(event) => startDrag(event, node.id)}
						onclick={() => (selectedNodeId = node.id)}
					/>
				{/each}
			</div>

			<div class="edge-story-footer">
				selected: <strong>{selectedNodeId}</strong>
				{#if values.snapToGrid}
					<span class="snap-chip">snap: {GRID_SIZE}px</span>
				{/if}
			</div>
		</div>
	{/snippet}

	{#snippet variants()}
		<div class="edge-story-shell">
			<div class="edge-story-chips">
				<span>variant gallery</span>
				<span>same anchors, different route geometry</span>
			</div>

			<div class="_c1">
				{#each [{ id: 'straight', label: 'Straight', type: 'straight', color: '#334155' }, { id: 'curve', label: 'Curve', type: 'curve', color: '#2563eb' }, { id: 'polyline', label: 'Polyline', type: 'polyline', color: '#0f766e' }] as item}
					<div class="variant-track">
						<div class="variant-copy">
							<strong>{item.label}</strong>
							<span>{item.type}</span>
						</div>
						<div class="variant-stage">
							<div class="variant-anchor variant-anchor-start">A</div>
							<div class="variant-anchor variant-anchor-end">B</div>
							<SlotGraphEdge
								fromNodeId={`${item.id}-a`}
								toNodeId={`${item.id}-b`}
								type={item.type as 'straight' | 'curve' | 'polyline'}
								directed={item.type !== 'polyline'}
								active={true}
								label={item.label}
								style={{
									'--edge-left': '32px',
									'--edge-top': '40px',
									'--edge-length': '260px',
									'--edge-angle': '0deg',
									'--edge-color': item.color,
									'--edge-thickness': '3px',
									'--edge-label-display': 'inline-flex'
								}}
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/snippet}
</Story>

<style>
	.edge-story-shell {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, #f8fafc, #eef2f7);
		border: 1px solid rgba(148, 163, 184, 0.24);
	}

	.edge-story-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.78rem;
		color: #475569;
	}

	.edge-story-chips span,
	.snap-chip {
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		background: white;
		border: 1px solid rgba(148, 163, 184, 0.3);
	}

	.edge-stage {
		position: relative;
		overflow: hidden;
		width: 640px;
		height: 320px;
		border-radius: 0.9rem;
		border: 1px solid rgba(148, 163, 184, 0.3);
		background:
			radial-gradient(circle at center, rgba(148, 163, 184, 0.18), transparent 60%),
			linear-gradient(180deg, #ffffff, #f8fafc);
		background-size:
			20px 20px,
			auto;
	}

	.edge-story-footer {
		font-size: 0.82rem;
		color: #475569;
	}

	.variant-track {
		display: grid;
		grid-template-columns: 120px minmax(0, 1fr);
		gap: 0.75rem;
		align-items: center;
		padding: 0.75rem;
		border-radius: 0.9rem;
		background: white;
		border: 1px solid rgba(148, 163, 184, 0.24);
	}

	.variant-copy {
		display: grid;
		gap: 0.2rem;
		font-size: 0.78rem;
		color: #64748b;
	}

	.variant-copy strong {
		font-size: 0.9rem;
		color: #172033;
	}

	.variant-stage {
		position: relative;
		height: 80px;
		border-radius: 0.8rem;
		border: 1px solid rgba(148, 163, 184, 0.24);
		background:
			repeating-linear-gradient(
				90deg,
				transparent,
				transparent 27px,
				rgba(148, 163, 184, 0.1) 27px,
				rgba(148, 163, 184, 0.1) 28px
			),
			linear-gradient(180deg, #f8fafc, #eef2f7);
	}

	.variant-anchor {
		position: absolute;
		top: 50%;
		width: 24px;
		height: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: #172033;
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
		transform: translateY(-50%);
	}

	.variant-anchor-start {
		left: 8px;
	}
	.variant-anchor-end {
		right: 8px;
	}

	._c1 {
		display: grid;
		gap: 0.75rem;
	}
</style>
