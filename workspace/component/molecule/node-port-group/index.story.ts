import NodePortGroup from './index.svelte';
import type { RecipeNodePortGroup } from '$stylist/workspace/interface/recipe/node-port-group';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_SIZE } from '$stylist/design-token/const/array/size';
import { TOKEN_RELATIONSHIP } from '$stylist/workspace/const/array/relationship';

/** Group of connection ports for node inputs/outputs with labels and dividers. */
export default {
	component: NodePortGroup,
	title: 'NodePortGroup',
	description: 'Group of connection ports for node inputs/outputs with labels and dividers.',
	args: {
		id: 'node-port-group-1',
		direction: 'input',
		ports: [
			{ id: 'in-1', direction: 'input', label: 'Data In', dataType: 'string', connected: true },
			{ id: 'in-2', direction: 'input', label: 'Config', dataType: 'object', connected: false },
			{ id: 'in-3', direction: 'input', label: 'Options', dataType: 'array', connected: true }
		],
		portSize: 'md',
		showLabels: true,
		compact: false,
		divider: false,
		style: 'position: relative; width: 100%;'
	},
	controls: {
		// A port group holds either inputs or outputs.
		direction: { type: 'select', options: TOKEN_RELATIONSHIP.slice(1, 3) },
		// Ports style xs-lg.
		portSize: { type: 'select', options: TOKEN_SIZE.slice(0, 4) },
		showLabels: { type: 'boolean' },
		compact: { type: 'boolean' },
		divider: { type: 'boolean' },
		title: { type: 'text' }
	},
	presets: {
		Outputs: {
			direction: 'output',
			ports: [
				{ id: 'out-1', direction: 'output', label: 'Result', dataType: 'string', connected: true },
				{ id: 'out-2', direction: 'output', label: 'Error', dataType: 'object', connected: false }
			]
		}
	},
	// The ports are positioned on the edges of their node.
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'position: relative; width: 220px; margin: 0 2rem; padding: var(--spacing-4) 1.5rem; background: var(--color-background-secondary); border: 1px solid var(--color-border-primary); border-radius: var(--border-radius-md);'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeNodePortGroup>;
