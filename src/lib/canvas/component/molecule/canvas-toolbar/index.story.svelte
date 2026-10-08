<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import CanvasToolbar from './index.svelte';

	const controls: SlotStory[] = [
		{
			name: 'selectedTool',
			type: 'select',
			defaultValue: 'pen',
			options: ['pen', 'eraser', 'select', 'text', 'shape']
		},
		{ name: 'lineWidth', type: 'number', defaultValue: 2, min: 1, max: 20, step: 1 },
		{ name: 'strokeColor', type: 'color', defaultValue: '#2563eb' }
	];
</script>

<Story
	component={CanvasToolbar}
	title="CanvasToolbar"
	description="Tool selector for sketch surfaces. The stage frames it as a floating control bar over a whiteboard."
	{controls}
>
	{#snippet children(values: any)}
		<div class="canvas-toolbar-shell">
			<div class="canvas-stage">
				<div class="whiteboard-note">Whiteboard controls</div>
				<CanvasToolbar
					{...{
						selectedTool: values.selectedTool,
						drawingOptions: {
							lineWidth: values.lineWidth,
							strokeColor: values.strokeColor,
							tool: values.selectedTool,
							mode: values.selectedTool === 'eraser' ? 'erase' : 'draw'
						}
					} as any}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<style>
	.canvas-toolbar-shell {
		padding: 1rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, #f8fafc, #eef2f7);
		border: 1px solid rgba(148, 163, 184, 0.24);
	}

	.canvas-stage {
		display: grid;
		gap: 0.75rem;
		justify-content: start;
		padding: 1rem;
		border-radius: 1rem;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98)),
			repeating-linear-gradient(
				90deg,
				transparent,
				transparent 31px,
				rgba(148, 163, 184, 0.08) 31px,
				rgba(148, 163, 184, 0.08) 32px
			);
		border: 1px solid rgba(148, 163, 184, 0.3);
	}

	.whiteboard-note {
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #64748b;
	}
</style>
