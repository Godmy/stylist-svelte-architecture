<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import type { SceneCamera } from '$stylist/graph/interface/slot/scene-camera';
	import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';

	import PresenterNodeShell from './index.svelte';

	const camera: SceneCamera = {
		x: 0,
		y: 0,
		depth: 500,
		zoom: 1,
		viewportWidth: 640,
		viewportHeight: 360
	};

	const node: SceneNode = {
		id: 'scene-node-shell',
		title: 'Payments Service',
		label: 'Payments',
		description: 'Semantic zoom node shell with label, icon and linked children.',
		iconText: 'P',
		position: { x: 240, y: 140 },
		depth: 420,
		accent: 'var(--color-primary-500)',
		layer: 'layer3',
		children: [
			{
				id: 'scene-node-ledger',
				title: 'Ledger',
				position: { x: 360, y: 220 },
				depth: 520,
				accent: 'var(--color-success-500)'
			}
		]
	};

	const controls: SlotStory[] = [
		{ name: 'depth', type: 'range', min: 0, max: 1000, step: 20, defaultValue: 500 },
		{ name: 'zoom', type: 'range', min: 0.4, max: 1.8, step: 0.1, defaultValue: 1 },
		{ name: 'selected', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	{controls}
	component={PresenterNodeShell}
	title="PresenterNodeShell"
	category="Molecules/Architecture/Canvas"
	description="Semantic zoom-aware node shell for presenter scenes."
>
	{#snippet children(values: any)}
		<div
			style="position: relative; min-height: 22rem; border-radius: var(--border-radius-xl); overflow: hidden; background: linear-gradient(180deg, #0f172a, #111827);"
		>
			<PresenterNodeShell
				node={{ ...node, depth: values.depth as number }}
				camera={{ ...camera, depth: values.depth as number, zoom: values.zoom as number }}
				selected={values.selected as boolean}
				onselect={(selectedNode: SceneNode) => {
					console.log('Selected node:', selectedNode.id);
				}}
			/>
		</div>
	{/snippet}
</Story>
