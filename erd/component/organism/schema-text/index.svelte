<script lang="ts">
	import { DEFAULT_SCHEMA_TEXT } from '$stylist/erd/const/value/schema-text';
	import { schemaTextToDocument } from '$stylist/erd/function/transform/schema-text-to-document';
	import type { RecipeSchemaText } from '$stylist/erd/interface/recipe/schema-text';

	let {
		value = $bindable(DEFAULT_SCHEMA_TEXT),
		placeholder = DEFAULT_SCHEMA_TEXT
	}: RecipeSchemaText = $props();
	let result = $derived(schemaTextToDocument(value));

	function handleInput(event: Event): void {
		value = (event.target as HTMLTextAreaElement).value;
	}
</script>

<section class="schema-text">
	<textarea spellcheck="false" {placeholder} {value} oninput={handleInput}></textarea>
	{#if result.errors.length > 0}
		<ul class="schema-text__errors">
			{#each result.errors as error}
				<li>{error}</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	/* flex column, not grid+min-height:100% -- the old version forced the
	   whole section to 100% of its (now full-viewport) parent height even
	   though its actual content (textarea + errors) never grows to fill
	   that much space, leaving a large dead gap. Here the textarea is the
	   one flexible element (flex:1); errors stay their natural size right
	   below it. */
	.schema-text {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		height: 100%;
		min-height: 0;
	}

	.schema-text textarea {
		flex: 1;
		min-height: 0;
		resize: vertical;
		padding: 0.9rem;
		border: 1px solid var(--color-border-primary, rgba(22, 31, 44, 0.14));
		border-radius: 0.5rem;
		background: var(--color-background-secondary, #f9fafb);
		color: var(--color-text-primary, #111827);
		font:
			0.86rem/1.55 ui-monospace,
			SFMono-Regular,
			Menlo,
			Monaco,
			Consolas,
			monospace;
		tab-size: 2;
	}

	.schema-text__errors {
		flex-shrink: 0;
		margin: 0;
		padding: 0.7rem 0.9rem 0.7rem 1.6rem;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--color-danger-600, #dc2626) 10%, transparent);
		color: var(--color-danger-600, #dc2626);
		font-size: 0.78rem;
	}
</style>
