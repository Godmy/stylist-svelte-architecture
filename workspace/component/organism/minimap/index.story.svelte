<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import type { RecipeWorkspaceNode } from '$stylist/workspace/interface/recipe/workspace-node';
	import Minimap from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'width', type: 'number', defaultValue: 240 },
		{ name: 'height', type: 'number', defaultValue: 172 },
		{ name: 'zoom', type: 'range', min: 0.25, max: 2, step: 0.05, defaultValue: 1 },
		{ name: 'offsetX', type: 'number', defaultValue: 0 },
		{ name: 'offsetY', type: 'number', defaultValue: 0 },
		{ name: 'showZoomControls', type: 'boolean', defaultValue: true },
		{ name: 'showViewport', type: 'boolean', defaultValue: true },
		{ name: 'backgroundColor', type: 'color', defaultValue: '#f8fafc' },
		{ name: 'gridColor', type: 'color', defaultValue: '#cbd5e1' },
		{ name: 'nodeColor', type: 'color', defaultValue: '#94a3b8' },
		{ name: 'activeNodeColor', type: 'color', defaultValue: '#0f766e' },
		{ name: 'viewportColor', type: 'color', defaultValue: '#1d4ed8' }
	];

	const sampleNodes: RecipeWorkspaceNode[] = [
		{
			id: 'node-1',
			title: 'Collector',
			type: 'source' as const,
			x: 80,
			y: 100,
			color: '#0f766e',
			width: 160,
			height: 84,
			inputs: [],
			outputs: [],
			properties: []
		},
		{
			id: 'node-2',
			title: 'Router',
			type: 'processor' as const,
			x: 320,
			y: 160,
			color: '#b45309',
			width: 180,
			height: 96,
			inputs: [],
			outputs: [],
			properties: []
		},
		{
			id: 'node-3',
			title: 'Dashboard',
			type: 'output' as const,
			x: 620,
			y: 120,
			color: '#1d4ed8',
			width: 180,
			height: 90,
			inputs: [],
			outputs: [],
			properties: []
		},
		{
			id: 'node-4',
			title: 'Archive',
			type: 'custom' as const,
			x: 250,
			y: 360,
			color: '#7c3aed',
			width: 150,
			height: 78,
			inputs: [],
			outputs: [],
			properties: []
		},
		{
			id: 'node-5',
			title: 'Inspector',
			type: 'custom' as const,
			x: 760,
			y: 300,
			color: '#0f766e',
			width: 150,
			height: 78,
			inputs: [],
			outputs: [],
			properties: [],
			selected: true
		}
	];
</script>

<Story
	{controls}
	component={Minimap}
	title="Minimap Component"
	description="Compact navigator for large graph scenes. The story keeps the main scene visible so the minimap has clear context."
>
	{#snippet children(values: any)}
		<div class="minimap-shell">
			<div class="scene-preview">
				<div class="scene-card scene-card-source">Collector</div>
				<div class="scene-card scene-card-router">Router</div>
				<div class="scene-card scene-card-dashboard">Dashboard</div>
				<div class="scene-card scene-card-archive">Archive</div>
				<div class="scene-card scene-card-inspector">Inspector</div>
				<div class="viewport-frame"></div>
			</div>

			<div class="minimap-side">
				<div class="chip-row">
					<span>zoom: {values.zoom}</span>
					<span>viewport: {values.showViewport ? 'visible' : 'hidden'}</span>
					<span>offset: {values.offsetX}, {values.offsetY}</span>
				</div>

				<Minimap
					nodes={sampleNodes}
					zoom={Number(values.zoom) || 1}
					offset={{ x: Number(values.offsetX) || 0, y: Number(values.offsetY) || 0 }}
					width={Number(values.width) || 240}
					height={Number(values.height) || 172}
					showZoomControls={Boolean(values.showZoomControls)}
					showViewport={Boolean(values.showViewport)}
					backgroundColor={String(values.backgroundColor)}
					gridColor={String(values.gridColor)}
					nodeColor={String(values.nodeColor)}
					activeNodeColor={String(values.activeNodeColor)}
					viewportColor={String(values.viewportColor)}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet variants()}
		<div class="variants-shell">
			<div class="variant-card">
				<h3>Compact Navigator</h3>
				<Minimap
					nodes={sampleNodes}
					zoom={1}
					offset={{ x: 0, y: 0 }}
					width={180}
					height={132}
					showZoomControls={false}
					showViewport={true}
					backgroundColor="#ffffff"
					gridColor="#dbe4ee"
					nodeColor="#94a3b8"
					activeNodeColor="#0f766e"
					viewportColor="#1d4ed8"
				/>
			</div>

			<div class="variant-card">
				<h3>Workbench Panel</h3>
				<Minimap
					nodes={sampleNodes}
					zoom={1.15}
					offset={{ x: 120, y: 40 }}
					width={300}
					height={190}
					showZoomControls={true}
					showViewport={true}
					backgroundColor="#f8fafc"
					gridColor="#cbd5e1"
					nodeColor="#94a3b8"
					activeNodeColor="#b45309"
					viewportColor="#7c3aed"
				/>
			</div>
		</div>
	{/snippet}
</Story>

<style>
	.minimap-shell {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		align-items: start;
		padding: 1rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, #f8fafc, #eef2f7);
		border: 1px solid rgba(148, 163, 184, 0.24);
	}

	.scene-preview {
		position: relative;
		min-height: 320px;
		border-radius: 1rem;
		overflow: hidden;
		border: 1px solid rgba(148, 163, 184, 0.24);
		background:
			radial-gradient(circle at top left, rgba(29, 78, 216, 0.12), transparent 18rem),
			linear-gradient(180deg, #ffffff, #f8fafc);
	}

	.scene-card {
		position: absolute;
		padding: 0.85rem 1rem;
		border-radius: 0.9rem;
		color: white;
		font-size: 0.84rem;
		font-weight: 700;
		box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
	}

	.scene-card-source {
		left: 48px;
		top: 52px;
		background: #0f766e;
	}
	.scene-card-router {
		left: 220px;
		top: 120px;
		background: #b45309;
	}
	.scene-card-dashboard {
		left: 430px;
		top: 72px;
		background: #1d4ed8;
	}
	.scene-card-archive {
		left: 160px;
		top: 240px;
		background: #7c3aed;
	}
	.scene-card-inspector {
		left: 520px;
		top: 220px;
		background: #0f766e;
	}

	.viewport-frame {
		position: absolute;
		left: 160px;
		top: 90px;
		width: 240px;
		height: 140px;
		border: 2px solid rgba(15, 23, 42, 0.55);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.16);
		backdrop-filter: blur(2px);
	}

	.minimap-side {
		display: grid;
		gap: 0.75rem;
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.78rem;
		color: #475569;
	}

	.chip-row span {
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		background: white;
		border: 1px solid rgba(148, 163, 184, 0.3);
	}

	.variants-shell {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		padding: 1rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, #f8fafc, #eef2f7);
		border: 1px solid rgba(148, 163, 184, 0.24);
	}

	.variant-card {
		display: grid;
		gap: 0.75rem;
		justify-content: start;
		padding: 1rem;
		border-radius: 1rem;
		background: white;
		border: 1px solid rgba(148, 163, 184, 0.24);
	}

	.variant-card h3 {
		margin: 0;
		font-size: 0.95rem;
		color: #172033;
	}
</style>
