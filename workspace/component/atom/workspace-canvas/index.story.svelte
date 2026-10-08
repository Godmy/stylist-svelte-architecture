<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import WorkspaceNode from '$stylist/workspace/component/organism/workspace-node/index.svelte';
	import WorkspaceCanvas from './index.svelte';

	const detailedPresentation = {
		stage: 'detailed' as const,
		showIcon: true,
		showLabel: true,
		showDescription: false,
		showChildren: true
	};

	const controls: SlotStory[] = [
		{
			name: 'gridMode',
			type: 'select',
			defaultValue: 'dot',
			options: ['dot', 'number', 'letter', 'check', 'x']
		},
		{ name: 'panMode', type: 'select', defaultValue: 'drag', options: ['drag', 'space', 'always'] },
		{ name: 'zoom', type: 'number', defaultValue: 1 },
		{ name: 'gridSize', type: 'number', defaultValue: 20 },
		{ name: 'snapToGrid', type: 'boolean', defaultValue: false },
		{ name: 'width', type: 'number', defaultValue: 720 },
		{ name: 'height', type: 'number', defaultValue: 320 }
	];
</script>

<Story
	{controls}
	title="Workspace Canvas"
	category="Atoms/Architecture/Canvas"
	description="Viewport shell for graph content. Use it to inspect grid modes, pan behavior and zoom while keeping node placement readable."
	tags={['graph', 'canvas', 'grid']}
>
	{#snippet children(values: any)}
		<div
			style="display:grid; gap:1rem; background:#0f172a; padding:var(--spacing-5); border-radius:var(--border-radius-lg);"
		>
			<div style="display:flex; flex-wrap:wrap; gap:0.5rem; color:#cbd5e1; font-size:0.78rem;">
				<span
					style="padding:0.35rem 0.6rem; border-radius:999px; background:rgba(15,23,42,0.88); border:1px solid rgba(148,163,184,0.18);"
					>grid: {values.gridMode}</span
				>
				<span
					style="padding:0.35rem 0.6rem; border-radius:999px; background:rgba(15,23,42,0.88); border:1px solid rgba(148,163,184,0.18);"
					>pan: {values.panMode}</span
				>
				<span
					style="padding:0.35rem 0.6rem; border-radius:999px; background:rgba(15,23,42,0.88); border:1px solid rgba(148,163,184,0.18);"
					>zoom: {values.zoom}</span
				>
				<span
					style="padding:0.35rem 0.6rem; border-radius:999px; background:rgba(15,23,42,0.88); border:1px solid rgba(148,163,184,0.18);"
					>grid size: {values.gridSize}</span
				>
			</div>
			<WorkspaceCanvas
				gridMode={values.gridMode}
				panMode={values.panMode}
				zoom={values.zoom}
				gridSize={values.gridSize}
				snapToGrid={values.snapToGrid}
				width={values.width}
				height={values.height}
				backgroundColor="#1e1e1e"
				gridColor="rgba(128, 128, 128, 0.2)"
			>
				<WorkspaceNode
					id="node1"
					x={100}
					y={90}
					title="Source"
					type="source"
					color="#0f766e"
					presentation={detailedPresentation}
					outputs={[{ id: 'out-1', name: 'out', direction: 'output', type: 'any', label: 'Out' }]}
				/>
				<WorkspaceNode
					id="node2"
					x={360}
					y={140}
					title="Gateway"
					type="gateway"
					color="#b45309"
					selected={true}
					presentation={detailedPresentation}
					inputs={[{ id: 'in-1', name: 'in', direction: 'input', type: 'any', label: 'In' }]}
					outputs={[{ id: 'out-2', name: 'out', direction: 'output', type: 'any', label: 'Out' }]}
				/>
				<WorkspaceNode
					id="node3"
					x={240}
					y={280}
					title="Output"
					type="output"
					color="#1d4ed8"
					presentation={detailedPresentation}
					inputs={[{ id: 'in-2', name: 'in', direction: 'input', type: 'any', label: 'In' }]}
				/>
			</WorkspaceCanvas>
		</div>
	{/snippet}

	{#snippet variants()}
		<div
			style="display:grid; gap:var(--spacing-5); background:#0f172a; padding:var(--spacing-5); border-radius:var(--border-radius-lg);"
		>
			<div
				style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:var(--spacing-5);"
			>
				<div>
					<h4 style="color:#fff; margin-bottom:10px;">Dot</h4>
					<WorkspaceCanvas gridMode="dot" width={300} height={180} />
				</div>
				<div>
					<h4 style="color:#fff; margin-bottom:10px;">Number</h4>
					<WorkspaceCanvas gridMode="number" width={300} height={180} />
				</div>
				<div>
					<h4 style="color:#fff; margin-bottom:10px;">Letter</h4>
					<WorkspaceCanvas gridMode="letter" width={300} height={180} />
				</div>
				<div>
					<h4 style="color:#fff; margin-bottom:10px;">Check</h4>
					<WorkspaceCanvas gridMode="check" width={300} height={180} />
				</div>
			</div>

			<div>
				<h4 style="color:#fff; margin-bottom:10px;">Pan Mode Comparison</h4>
				<div
					style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:var(--spacing-4);"
				>
					<div>
						<h5
							style="color:#cbd5e1; margin:0 0 8px; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;"
						>
							drag
						</h5>
						<WorkspaceCanvas gridMode="dot" panMode="drag" width={220} height={140}>
							<WorkspaceNode
								id="drag-node"
								x={40}
								y={40}
								title="Drag"
								type="source"
								color="#0f766e"
								width={120}
								hidePorts
								hideProperties
								presentation={detailedPresentation}
							/>
						</WorkspaceCanvas>
					</div>
					<div>
						<h5
							style="color:#cbd5e1; margin:0 0 8px; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;"
						>
							space
						</h5>
						<WorkspaceCanvas gridMode="dot" panMode="space" width={220} height={140}>
							<WorkspaceNode
								id="space-node"
								x={40}
								y={40}
								title="Space"
								type="gateway"
								color="#b45309"
								width={120}
								hidePorts
								hideProperties
								presentation={detailedPresentation}
							/>
						</WorkspaceCanvas>
					</div>
					<div>
						<h5
							style="color:#cbd5e1; margin:0 0 8px; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;"
						>
							always
						</h5>
						<WorkspaceCanvas gridMode="dot" panMode="always" width={220} height={140}>
							<WorkspaceNode
								id="always-node"
								x={40}
								y={40}
								title="Always"
								type="output"
								color="#1d4ed8"
								width={120}
								hidePorts
								hideProperties
								presentation={detailedPresentation}
							/>
						</WorkspaceCanvas>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
