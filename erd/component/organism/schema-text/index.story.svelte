<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import { DEFAULT_SCHEMA_TEXT } from '$stylist/erd/const/value/schema-text';
	import SchemaText from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'value', type: 'text', defaultValue: DEFAULT_SCHEMA_TEXT }
	];
</script>

<Story
	component={SchemaText}
	title="Schema Text"
	description="Text editor for the ERD schema dialect."
	{controls}
>
	{#snippet children(values: any)}
		<SchemaText value={String(values.value ?? DEFAULT_SCHEMA_TEXT)} />
	{/snippet}
</Story>
