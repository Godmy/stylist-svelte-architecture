<script lang="ts">
	import type { RecipeFieldHighlighter as IFieldHighlighterProps } from '$stylist/graph/interface/recipe/field-highlighter';
	import createFieldHighlighterState from './state.svelte';

	let props: IFieldHighlighterProps = $props();
	const state = createFieldHighlighterState(() => props);
</script>

<div class="field-highlighter-visualization">
	{#each state.data.edges as edge}
		<div class={`fh-edge ${state.isEdgeHighlighted(edge) ? 'fh-edge--highlighted' : ''}`}>
			{edge.fromNodeId} -> {edge.toNodeId}{#if edge.label}
				({edge.label}){/if}
		</div>
	{/each}

	{#each state.data.nodes as node}
		<button
			type="button"
			class={`fh-node ${state.selectedNode?.id === node.id || state.isNodeHighlighted(node) ? 'fh-node--selected' : ''}`}
			onclick={() => state.handleNodeClick(node)}
			style="left: {node.x || 0}px; top: {node.y || 0}px;"
		>
			<div class="fh-node__label">{node.label || node.id}</div>
			{#if node.children}
				<div class="fh-node__meta">
					{@render node.children()}
				</div>
			{/if}
		</button>
	{/each}
</div>

<style>
	.fh-edge {
		border-radius: var(--border-radius-base, 0.375rem);
		border: 1px solid var(--color-border-primary);
		padding: 0.25rem 0.5rem;
		font-size: var(--text-size-xs, 0.75rem);
	}

	.fh-edge--highlighted {
		border-color: var(--color-primary-400);
	}

	.fh-node {
		position: absolute;
		border-radius: var(--border-radius-base, 0.375rem);
		border: 1px solid var(--color-border-primary);
		background-color: var(--color-background-primary);
		padding: 0.5rem 0.75rem;
		text-align: start;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		cursor: pointer;
	}

	.fh-node--selected {
		border-color: var(--color-primary-500);
	}

	.fh-node__label {
		font-weight: 500;
	}

	.fh-node__meta {
		margin-block-start: 0.25rem;
		font-size: var(--text-size-xs, 0.75rem);
		color: var(--color-text-secondary);
	}
</style>
