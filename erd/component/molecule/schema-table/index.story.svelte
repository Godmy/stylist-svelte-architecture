<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import SchemaTable from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'tableName', type: 'text', defaultValue: 'Invoice' },
		{ name: 'active', type: 'boolean', defaultValue: true },
		{ name: 'highlightCustomer', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	component={SchemaTable}
	title="Schema Table"
	description="ERD table molecule composed from header and field atoms."
	{controls}
>
	{#snippet children(values: any)}
		<div class="schema-table-story">
			<SchemaTable
				table={{
					id: 'invoice',
					name: String(values.tableName ?? 'Invoice'),
					fields: [
						{
							id: 'invoice.id',
							name: 'id',
							type: 'uuid',
							required: true,
							primary: true,
							unique: true,
							notes: []
						},
						{
							id: 'invoice.customer_id',
							name: 'customer_id',
							type: 'uuid',
							required: true,
							primary: false,
							unique: false,
							reference: 'Customer.id',
							notes: ['required']
						},
						{
							id: 'invoice.total',
							name: 'total',
							type: 'decimal',
							required: true,
							primary: false,
							unique: false,
							notes: ['required']
						},
						{
							id: 'invoice.status',
							name: 'status',
							type: 'varchar',
							required: true,
							primary: false,
							unique: false,
							notes: ['required']
						}
					]
				}}
				active={Boolean(values.active)}
				relatedFieldIds={Boolean(values.highlightCustomer) ? ['invoice.customer_id'] : []}
			/>
		</div>
	{/snippet}
</Story>

<style>
	.schema-table-story {
		padding: 1rem;
		border-radius: 0.5rem;
		background: #eef3f8;
	}
</style>
