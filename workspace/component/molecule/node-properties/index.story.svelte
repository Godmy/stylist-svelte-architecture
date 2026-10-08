<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import NodeProperties from './index.svelte';
	import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';

	const controls: SlotStory[] = [
		{ name: 'title', type: 'text', defaultValue: 'Properties' },
		{ name: 'nodeId', type: 'text', defaultValue: 'node-1' },
		{ name: 'size', type: 'select', defaultValue: 'md', options: ['sm', 'md', 'lg'] },
		{ name: 'compact', type: 'boolean', defaultValue: false },
		{ name: 'showHeader', type: 'boolean', defaultValue: true },
		{ name: 'showClose', type: 'boolean', defaultValue: true },
		{ name: 'editable', type: 'boolean', defaultValue: true },
		{ name: 'groupByType', type: 'boolean', defaultValue: true }
	];

	const sampleProperties: SlotWorkspaceNode[] = [
		{
			id: 'name',
			name: 'name',
			type: 'string',
			value: 'My Node',
			label: 'Node Name',
			description: 'The name of the node'
		},
		{
			id: 'type',
			name: 'type',
			type: 'enum',
			value: 'processor',
			label: 'Type',
			description: 'Node type',
			options: ['processor', 'memory', 'storage', 'network']
		},
		{
			id: 'status',
			name: 'status',
			type: 'enum',
			value: 'active',
			label: 'Status',
			options: ['active', 'inactive', 'pending']
		},
		{
			id: 'priority',
			name: 'priority',
			type: 'number',
			value: 5,
			label: 'Priority',
			description: 'Priority level (1-10)'
		},
		{
			id: 'enabled',
			name: 'enabled',
			type: 'boolean',
			value: true,
			label: 'Enabled',
			description: 'Enable this node'
		},
		{
			id: 'tags',
			name: 'tags',
			type: 'string',
			value: 'production, critical',
			label: 'Tags',
			description: 'Comma-separated tags'
		}
	];
</script>

<Story
	{controls}
	component={NodeProperties}
	title="Node Properties Panel"
	category="Molecules/Information/Panels"
	description="Panel for displaying and editing node properties"
>
	{#snippet children(values: any)}
		<NodeProperties
			id="node-properties-story"
			nodeId={values.nodeId as string}
			title={values.title as string}
			size={values.size as 'sm' | 'md' | 'lg'}
			compact={values.compact as boolean}
			showHeader={values.showHeader as boolean}
			showClose={values.showClose as boolean}
			editable={values.editable as boolean}
			groupByType={values.groupByType as boolean}
			properties={sampleProperties}
			onPropertyChange={(propertyId: string, value: unknown) =>
				console.log('Property changed:', propertyId, value)}
			onclose={() => console.log('Panel closed')}
		/>
	{/snippet}
</Story>
