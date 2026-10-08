<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import WorkspacePalette from './index.svelte';

	const sampleItems = [
		{
			id: '1',
			type: 'source',
			title: 'Data Source',
			description: 'Input data source node',
			icon: 'database',
			color: 'var(--color-primary-500)',
			category: 'source'
		},
		{
			id: '2',
			type: 'processor',
			title: 'Data Processor',
			description: 'Process and transform data',
			icon: 'cpu',
			color: 'var(--color-warning-500)',
			category: 'processor'
		},
		{
			id: '3',
			type: 'output',
			title: 'Data Output',
			description: 'Output data destination',
			icon: 'export',
			color: 'var(--color-success-500)',
			category: 'output'
		}
	];

	const controls: SlotStory[] = [];
</script>

<Story
	component={WorkspacePalette}
	title="WorkspacePalette"
	description="Palette of ontology nodes."
	{controls}
>
	{#snippet children()}
		<div class="story-container">
			<div class="story-preview">
				<WorkspacePalette
					items={sampleItems}
					isOpen={true}
					viewMode="list"
					x={20}
					y={20}
					width={320}
					height={480}
					dismissible={true}
					onSearch={() => {}}
					onNodeSelect={() => {}}
					onClose={() => {}}
					onViewModeChange={() => {}}
					onCategorySelect={() => {}}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<style>
	.story-container {
		position: relative;
		min-height: 600px;
		padding: var(--spacing-6);
		background: var(--color-background-secondary);
	}
	.story-preview {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
