<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import GraphvizDirectedEdge from './index.svelte';
</script>

<Story
	id="molecules-graphviz-directed-edge"
	title="Molecules / Ontology / Graphviz Directed Edge"
	component={GraphvizDirectedEdge}
	category="Molecules/Ontology"
>
	{#snippet children()}
		<div class="_c1" style="height: 220px; position: relative;">
			<GraphvizDirectedEdge
				id="edge-a"
				sourceX={40}
				sourceY={40}
				targetX={190}
				targetY={130}
				text="Edge"
				style="dashed"
				color="#2563eb"
			/>
		</div>
	{/snippet}
</Story>

<style>
	._c1 {
		border-radius: 0.25rem;
		border-width: 1px;
		border-style: solid;
		padding: 1rem;
	}
</style>
