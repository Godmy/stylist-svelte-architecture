<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import WorkspaceToolbar from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'size', type: 'select', defaultValue: 'md', options: ['sm', 'md', 'lg'] },
		{
			name: 'orientation',
			type: 'select',
			defaultValue: 'horizontal',
			options: ['horizontal', 'vertical']
		},
		{ name: 'compact', type: 'boolean', defaultValue: false },
		{ name: 'showTooltips', type: 'boolean', defaultValue: true }
	];

	const defaultItems = [
		{ id: 'zoom-in', type: 'button' as const, icon: 'plus', label: 'Zoom In', tooltip: 'Zoom in' },
		{
			id: 'zoom-out',
			type: 'button' as const,
			icon: 'minus',
			label: 'Zoom Out',
			tooltip: 'Zoom out'
		},
		{
			id: 'fit',
			type: 'button' as const,
			icon: 'maximize',
			label: 'Fit',
			tooltip: 'Fit to screen'
		},
		{ id: 'separator-1', type: 'separator' as const },
		{ id: 'layout', type: 'select' as const, options: ['Dagre', 'Force', 'Grid'], value: 'Dagre' },
		{ id: 'separator-2', type: 'separator' as const },
		{
			id: 'export',
			type: 'button' as const,
			icon: 'download',
			label: 'Export',
			tooltip: 'Export graph'
		}
	];
</script>

<Story
	component={WorkspaceToolbar}
	title="WorkspaceToolbar"
	description="Toolbar for graph scenes with zoom, layout and export actions. The wrapper frame mirrors a graph workbench."
	{controls}
>
	{#snippet children(values: any)}
		<div class="toolbar-shell">
			<div class="toolbar-stage">
				<div class="toolbar-workbench">
					<div class="toolbar-header">Graph Workbench</div>
					<WorkspaceToolbar
						id="workspace-toolbar"
						items={defaultItems}
						size={values.size}
						orientation={values.orientation}
						compact={values.compact}
						showTooltips={values.showTooltips}
					/>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<style>
	.toolbar-shell {
		padding: 1rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, #0f172a, #111827);
	}

	.toolbar-stage {
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid rgba(148, 163, 184, 0.18);
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92));
	}

	.toolbar-workbench {
		display: grid;
		gap: 0.75rem;
		justify-content: start;
	}

	.toolbar-header {
		color: #cbd5e1;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
