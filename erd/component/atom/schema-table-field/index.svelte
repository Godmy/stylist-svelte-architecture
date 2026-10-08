<script lang="ts">
	import type { RecipeErdTableField } from '$stylist/erd/interface/recipe/erd-table-field';

	let { field, active = false, related = false }: RecipeErdTableField = $props();
</script>

<div
	class={`schema-table-field ${active ? 'schema-table-field--active' : ''} ${related ? 'schema-table-field--related' : ''}`}
>
	<div class="schema-table-field__main">
		<span class="schema-table-field__name">{field.name}</span>
		<span class="schema-table-field__type">{field.type}</span>
	</div>
	<div class="schema-table-field__badges">
		{#if field.primary}
			<span>PK</span>
		{/if}
		{#if field.required}
			<span>NN</span>
		{/if}
		{#if field.unique}
			<span>UQ</span>
		{/if}
		{#if field.reference}
			<span>FK</span>
		{/if}
	</div>
</div>

<style>
	.schema-table-field {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.65rem;
		padding: 0.58rem 0.8rem;
		border-bottom: 1px solid var(--color-border-primary, rgba(22, 31, 44, 0.08));
		background: var(--color-background-primary, transparent);
		color: var(--color-text-primary, #202b3c);
	}

	.schema-table-field--active,
	.schema-table-field--related {
		background: color-mix(in srgb, #d46b34 12%, var(--color-background-primary, #fff7ed));
	}

	.schema-table-field__main {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.6rem;
		min-width: 0;
	}

	.schema-table-field__name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.84rem;
		font-weight: 650;
	}

	.schema-table-field__type {
		color: var(--color-text-secondary, #637083);
		font-size: 0.78rem;
	}

	.schema-table-field__badges {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.25rem;
	}

	.schema-table-field__badges span {
		padding: 0.12rem 0.28rem;
		border-radius: 0.35rem;
		background: var(--color-background-secondary, #e8edf4);
		color: var(--color-text-secondary, #3b4657);
		font-size: 0.62rem;
		font-weight: 700;
	}
</style>
