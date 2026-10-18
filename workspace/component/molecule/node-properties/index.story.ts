import NodeProperties from './index.svelte';
import type { RecipeNodeProperties } from '$stylist/workspace/interface/recipe/node-properties';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_SIZE } from '$stylist/design-token/const/array/size';

/** Panel for displaying and editing node properties. */
export default {
	component: NodeProperties,
	title: 'Node Properties Panel',
	description: 'Panel for displaying and editing node properties',
	args: {
		id: 'node-properties-story',
		nodeId: 'node-1',
		title: 'Properties',
		size: 'md',
		compact: false,
		showHeader: true,
		showClose: true,
		editable: true,
		groupByType: true,
		properties: [
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
		]
	},
	controls: {
		title: { type: 'text' },
		nodeId: { type: 'text' },
		// The panel styles sm-lg.
		size: { type: 'select', options: TOKEN_SIZE.slice(1, 4) },
		compact: { type: 'boolean' },
		showHeader: { type: 'boolean' },
		showClose: { type: 'boolean' },
		editable: { type: 'boolean' },
		groupByType: { type: 'boolean' }
	}
} satisfies ContractStory<RecipeNodeProperties>;
