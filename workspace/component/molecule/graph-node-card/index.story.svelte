<script lang="ts">
	import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import Story from '$stylist/theme/component/molecule/story/index.svelte';

	import GraphNodeCard from './index.svelte';

	const node1: SlotWorkspaceNode = {
		id: '1',
		name: 'User Node',
		type: 'object',
		description: 'Represents a user in the system',
		fields: [
			{ name: 'id', type: 'ID', isRequired: true },
			{ name: 'name', type: 'String', isRequired: true },
			{ name: 'email', type: 'String' }
		]
	};

	const controls: SlotStory[] = [
		{ name: 'expanded', type: 'boolean', defaultValue: false },
		{ name: 'selected', type: 'boolean', defaultValue: false },
		{ name: 'highlight', type: 'boolean', defaultValue: false },
		{ name: 'showDetails', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	{controls}
	title="GraphNodeCard"
	category="Organisms/Card"
	description="Graph node card component for displaying node information."
	tags={['card', 'graph', 'node', 'ontology']}
>
	{#snippet children(values: any)}
		<GraphNodeCard
			node={node1}
			expanded={values.expanded}
			showDetails={values.showDetails}
			selected={values.selected}
			highlight={values.highlight}
		/>
	{/snippet}
</Story>
