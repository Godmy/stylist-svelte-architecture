<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import schemaSource from '$stylist/erd/data/md/schema/schema.md?raw';
	import Schema from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'zoom', type: 'number', defaultValue: 1, min: 0.5, max: 1.6, step: 0.1 },
		{ name: 'showRelations', type: 'boolean', defaultValue: true },
		{ name: 'highlightRelations', type: 'boolean', defaultValue: true },
		{ name: 'draggable', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	component={Schema}
	title="Schema"
	description="Composed ERD organism with text dialect editor, toolbar controls and draggable schema view."
	{controls}
>
	{#snippet children(values: any)}
		<Schema
			value={schemaSource}
			zoom={Number(values.zoom ?? 1)}
			showRelations={Boolean(values.showRelations)}
			highlightRelations={Boolean(values.highlightRelations)}
			draggable={Boolean(values.draggable)}
		/>
	{/snippet}
</Story>
