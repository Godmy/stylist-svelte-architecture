<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import SchemaTool from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'zoom', type: 'number', defaultValue: 1, min: 0.4, max: 2, step: 0.1 },
		{ name: 'showRelations', type: 'boolean', defaultValue: true },
		{ name: 'highlightRelations', type: 'boolean', defaultValue: true },
		{ name: 'canImport', type: 'boolean', defaultValue: true },
		{ name: 'canExport', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	component={SchemaTool}
	title="Schema Tool"
	description="Icon toolbar for import, export, zoom and relation visibility."
	{controls}
>
	{#snippet children(values: any)}
		<div class="schema-tool-story">
			<SchemaTool
				zoom={Number(values.zoom ?? 1)}
				showRelations={Boolean(values.showRelations)}
				highlightRelations={Boolean(values.highlightRelations)}
				canImport={Boolean(values.canImport)}
				canExport={Boolean(values.canExport)}
			/>
		</div>
	{/snippet}
</Story>

<style>
	.schema-tool-story {
		display: flex;
		padding: 1rem;
		border-radius: 0.5rem;
		background: #eef3f8;
	}
</style>
