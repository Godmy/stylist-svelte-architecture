<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import StylistGraphWorkspace from './index.svelte';
	import type { GraphWorkspaceNode } from '$stylist/workspace/interface/slot/graph-workspace-node';
	import type { GraphWorkspaceConnectionInput } from '$stylist/workspace/type/alias/graph-workspace-connection-input';

	const initialNodes: GraphWorkspaceNode[] = [
		{
			id: 'node-a',
			title: 'Data Source',
			category: 'signal',
			x: 80,
			y: 120,
			width: 160,
			height: 80,
			color: 'var(--color-success-500)',
			accent: 'var(--color-success-700)',
			summary: 'Raw input stream',
			details: ['type: stream', 'rate: 60hz'],
			shape: 'rounded'
		},
		{
			id: 'node-b',
			title: 'Processor',
			category: 'cluster',
			x: 340,
			y: 80,
			width: 160,
			height: 80,
			color: 'var(--color-secondary-500)',
			accent: 'var(--color-secondary-700)',
			summary: 'Transform & filter',
			details: ['ops: map, filter'],
			shape: 'rounded'
		},
		{
			id: 'node-c',
			title: 'Output',
			category: 'delivery',
			x: 340,
			y: 220,
			width: 160,
			height: 80,
			color: 'var(--color-warning-500)',
			accent: 'var(--color-warning-700)',
			summary: 'Deliver result',
			details: ['target: api'],
			shape: 'rounded'
		}
	];

	const initialConnections: GraphWorkspaceConnectionInput[] = [
		['node-a', 'node-b'],
		['node-a', 'node-c']
	];
</script>

<Story
	id="organisms-graph-stylist-graph-workspace"
	title="Organisms / Graph / Stylist Graph Workspace"
	component={StylistGraphWorkspace}
	category="Organisms/Graph"
>
	{#snippet children()}
		<div
			style="height: 500px; border: 1px solid var(--color-border-primary); border-radius: var(--border-radius-xl); overflow: hidden; background: var(--color-background-primary);"
		>
			<StylistGraphWorkspace {initialNodes} {initialConnections} />
		</div>
	{/snippet}
</Story>
