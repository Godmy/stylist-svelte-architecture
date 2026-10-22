import StylistGraphWorkspace from '$stylist/workspace/component/organism/stylist-graph-workspace/index.svelte';
import type { RecipeStylistGraphWorkspace } from '$stylist/workspace/interface/recipe/stylist-graph-workspace';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Graph workspace with tools, theme switch, node editing and a pan and zoom viewport. */
export default {
	component: StylistGraphWorkspace,
	title: 'Stylist Graph Workspace',
	description:
		'Graph workspace with tools, theme switch, node editing and a pan and zoom viewport over the initial nodes and connections.',
	args: {
		initialNodes: [
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
		],
		initialConnections: [
			['node-a', 'node-b'],
			['node-a', 'node-c']
		]
	},
	// The workspace fills the height of its frame.
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'height: 500px; border: 1px solid var(--color-border-primary); border-radius: var(--border-radius-xl); overflow: hidden; background: var(--color-background-primary);'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeStylistGraphWorkspace>;
