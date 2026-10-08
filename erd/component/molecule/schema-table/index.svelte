<script lang="ts">
	import SchemaTableField from '$stylist/erd/component/atom/schema-table-field/index.svelte';
	import SchemaTableHeader from '$stylist/erd/component/atom/schema-table-header/index.svelte';
	import type { RecipeErdTable } from '$stylist/erd/interface/recipe/erd-table';

	let { table, active = false, dimmed = false, relatedFieldIds = [] }: RecipeErdTable = $props();
</script>

<article
	class={`schema-table ${active ? 'schema-table--active' : ''} ${dimmed ? 'schema-table--dimmed' : ''}`}
>
	<SchemaTableHeader {table} {active} />
	<div class="schema-table__fields">
		{#each table.fields as field (field.id)}
			<SchemaTableField {field} related={relatedFieldIds.includes(field.id)} />
		{/each}
	</div>
</article>

<style>
	.schema-table {
		width: 260px;
		overflow: hidden;
		border: 1px solid var(--color-border-primary, rgba(22, 31, 44, 0.14));
		border-radius: 0.5rem;
		background: var(--color-background-primary, #ffffff);
		box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
		transition:
			opacity 0.15s ease,
			filter 0.15s ease;
	}

	.schema-table--active {
		border-color: var(--color-primary-500, #4d92cf);
		box-shadow: 0 18px 34px rgba(77, 146, 207, 0.18);
	}

	/* Paired with .schema-dependency--dimmed: tables that aren't the
	   hovered/pinned table or one of its direct neighbors recede instead of
	   competing for attention. */
	.schema-table--dimmed {
		opacity: 0.3;
		filter: saturate(0.5);
	}

	.schema-table__fields {
		display: grid;
	}
</style>
