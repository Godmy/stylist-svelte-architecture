<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import DrawingSurface from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'width', type: 'number', defaultValue: 640, min: 300, max: 1000, step: 20 },
		{ name: 'height', type: 'number', defaultValue: 360, min: 200, max: 700, step: 20 },
		{ name: 'drawingEnabled', type: 'boolean', defaultValue: true },
		{ name: 'tool', type: 'select', defaultValue: 'pen', options: ['pen', 'eraser', 'select'] },
		{ name: 'strokeWidth', type: 'number', defaultValue: 2, min: 1, max: 24, step: 1 },
		{ name: 'strokeColor', type: 'color', defaultValue: '#111827' },
		{ name: 'backgroundColor', type: 'color', defaultValue: '#ffffff' }
	];
</script>

<Story
	component={DrawingSurface}
	title="DrawingSurface"
	description="Canvas-based sketch layer. The story exposes tool, stroke and surface settings without additional chrome."
	{controls}
>
	{#snippet children(values: any)}
		<div class="surface-shell">
			<div class="chip-row">
				<span>tool: {values.tool}</span>
				<span>enabled: {values.drawingEnabled ? 'yes' : 'no'}</span>
				<span>stroke: {values.strokeWidth}px</span>
			</div>

			<DrawingSurface
				{...{
					width: values.width,
					height: values.height,
					drawingEnabled: values.drawingEnabled,
					tool: values.tool,
					strokeWidth: values.strokeWidth,
					strokeColor: values.strokeColor,
					backgroundColor: values.backgroundColor
				} as any}
			/>
		</div>
	{/snippet}
</Story>

<style>
	.surface-shell {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, #f8fafc, #eef2f7);
		border: 1px solid rgba(148, 163, 184, 0.24);
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
</style>
