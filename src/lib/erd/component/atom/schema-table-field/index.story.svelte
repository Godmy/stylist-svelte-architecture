<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import SchemaTableField from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'name', type: 'text', defaultValue: 'organization_id' },
		{ name: 'type', type: 'text', defaultValue: 'uuid' },
		{ name: 'primary', type: 'boolean', defaultValue: false },
		{ name: 'required', type: 'boolean', defaultValue: true },
		{ name: 'unique', type: 'boolean', defaultValue: false },
		{ name: 'related', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	component={SchemaTableField}
	title="Schema Table Field"
	description="Field row with primary, required, unique and relation badges."
	{controls}
>
	{#snippet children(values: any)}
		<div class="schema-table-field-story">
			<SchemaTableField
				field={{
					id: `user-account.${String(values.name ?? 'organization_id')}`,
					name: String(values.name ?? 'organization_id'),
					type: String(values.type ?? 'uuid'),
					required: Boolean(values.required),
					primary: Boolean(values.primary),
					unique: Boolean(values.unique),
					reference: 'Organization.id',
					notes: ['required']
				}}
				related={Boolean(values.related)}
			/>
		</div>
	{/snippet}
</Story>

<style>
	.schema-table-field-story {
		width: 340px;
		overflow: hidden;
		border: 1px solid rgba(22, 31, 44, 0.14);
		border-radius: 0.5rem;
		background: #ffffff;
	}
</style>
