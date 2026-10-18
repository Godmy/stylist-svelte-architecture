import WorkspaceNode from './index.svelte';
import type { RecipeWorkspaceNode } from '$stylist/workspace/interface/recipe/workspace-node';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_SIZE } from '$stylist/design-token/const/array/size';

/** Node component for litegraph-based node editors with inputs, outputs, and properties. */
export default {
	component: WorkspaceNode,
	title: 'LiteGraphNode',
	description:
		'Node component for litegraph-based node editors with inputs, outputs, and properties.',
	args: {
		id: 'node-1',
		title: 'Process Data',
		type: 'processor',
		mode: 'default',
		status: 'idle',
		x: 50,
		y: 50,
		width: 200,
		color: '#3b82f6',
		size: 'md',
		inputs: [
			{ id: 'in-1', direction: 'input', label: 'Data In', dataType: 'string' },
			{ id: 'in-2', direction: 'input', label: 'Config', dataType: 'object' }
		],
		outputs: [
			{ id: 'out-1', direction: 'output', label: 'Result', dataType: 'string' },
			{ id: 'out-2', direction: 'output', label: 'Error', dataType: 'object' }
		],
		properties: [
			{ id: 'prop-1', name: 'timeout', type: 'number', value: 30, label: 'Timeout (s)' },
			{ id: 'prop-2', name: 'retry', type: 'boolean', value: true, label: 'Retry on Failure' }
		],
		selected: false,
		draggable: true,
		hideHeader: false,
		hidePorts: false,
		hideProperties: false
	},
	controls: {
		// Litegraph execution modes and run states have no shared token.
		mode: { type: 'select', options: ['default', 'once', 'always', 'never'] },
		status: { type: 'select', options: ['idle', 'running', 'completed', 'error'] },
		// The node styles sm-lg.
		size: { type: 'select', options: TOKEN_SIZE.slice(1, 4) },
		color: { type: 'color' },
		selected: { type: 'boolean' },
		draggable: { type: 'boolean' },
		hideHeader: { type: 'boolean' },
		hidePorts: { type: 'boolean' },
		hideProperties: { type: 'boolean' }
	},
	presets: {
		Running: { status: 'running', selected: true },
		Error: { status: 'error', color: '#ef4444' }
	},
	// The node is absolutely positioned at x/y inside its canvas.
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'position: relative; width: 100%; height: 400px; padding: 0 2rem; box-sizing: border-box; background: var(--color-background-secondary); border-radius: var(--border-radius-md);'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeWorkspaceNode>;
