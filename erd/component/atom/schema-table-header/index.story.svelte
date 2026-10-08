<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import SchemaTableHeader from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'tableName', type: 'text', defaultValue: 'UserAccount' },
		{ name: 'active', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	component={SchemaTableHeader}
	title="Schema Table Header"
	description="Header row for an ERD table node."
	{controls}
>
	{#snippet children(values: any)}
		<div class="schema-table-header-story">
			<SchemaTableHeader
				table={{
					id: 'user-account',
					name: String(values.tableName ?? 'UserAccount'),
					fields: [
						{
							id: 'user-account.id',
							name: 'id',
							type: 'uuid',
							required: true,
							primary: true,
							unique: true,
							notes: []
						},
						{
							id: 'user-account.email',
							name: 'email',
							type: 'varchar',
							required: true,
							primary: false,
							unique: true,
							notes: []
						}
					]
				}}
				active={Boolean(values.active)}
			/>
		</div>
	{/snippet}
</Story>

<style>
	.schema-table-header-story {
		width: 280px;
		overflow: hidden;
		border: 1px solid rgba(22, 31, 44, 0.14);
		border-radius: 0.5rem;
		background: #ffffff;
	}
</style>
