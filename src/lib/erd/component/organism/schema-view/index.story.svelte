<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import { DEFAULT_SCHEMA_TEXT } from '$stylist/erd/const/value/schema-text';
	import { schemaTextToDocument } from '$stylist/erd/function/transform/schema-text-to-document';
	import SchemaView from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'zoom', type: 'number', defaultValue: 1, min: 0.5, max: 1.6, step: 0.1 },
		{ name: 'showRelations', type: 'boolean', defaultValue: true },
		{ name: 'highlightRelations', type: 'boolean', defaultValue: true },
		{ name: 'draggable', type: 'boolean', defaultValue: true },
		{ name: 'activeTableId', type: 'select', defaultValue: 'user', options: ['user', 'profile'] }
	];

	const document = schemaTextToDocument(DEFAULT_SCHEMA_TEXT).document;
</script>

<Story
	component={SchemaView}
	title="Schema View"
	description="Scrollable ERD canvas with tables and dependency lines."
	{controls}
>
	{#snippet children(values: any)}
		<SchemaView
			{document}
			zoom={Number(values.zoom ?? 1)}
			showRelations={Boolean(values.showRelations)}
			highlightRelations={Boolean(values.highlightRelations)}
			draggable={Boolean(values.draggable)}
			activeTableId={String(values.activeTableId ?? 'user')}
		/>
	{/snippet}
</Story>
