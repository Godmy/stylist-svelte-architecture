import NodePort from '$stylist/workspace/component/atom/node-port/index.svelte';
import type { RecipeNodePort } from '$stylist/workspace/interface/recipe/node-port';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_SIZE } from '$stylist/design-token/const/array/size';
import { TOKEN_PROPERTY_TYPE } from '$stylist/workspace/const/array/property-type';
import { TOKEN_RELATIONSHIP } from '$stylist/workspace/const/array/relationship';

// Ports carry data values, not editor-only value kinds.
const EDITOR_ONLY_TYPES: readonly string[] = ['enum', 'color', 'vector2', 'vector3', 'function'];

/** Connection point for graph nodes. */
export default {
	component: NodePort,
	title: 'Graph Port',
	description:
		'Connection point for graph nodes. Use the live controls to inspect direction, size, type and state.',
	args: {
		id: 'story-port',
		direction: 'input',
		dataType: 'number',
		size: 'md',
		label: 'Value',
		connected: false,
		active: false
	},
	controls: {
		// A port is either an input or an output.
		direction: { type: 'select', options: TOKEN_RELATIONSHIP.slice(1, 3) },
		dataType: {
			type: 'select',
			options: TOKEN_PROPERTY_TYPE.filter((type) => !EDITOR_ONLY_TYPES.includes(type))
		},
		// The port styles xs-lg.
		size: { type: 'select', options: TOKEN_SIZE.slice(0, 4) },
		label: { type: 'text' },
		connected: { type: 'boolean' },
		active: { type: 'boolean' }
	},
	presets: {
		Output: { direction: 'output', dataType: 'string', label: 'Result' },
		'Connected Event': { dataType: 'event', label: 'Trigger', connected: true, active: true },
		'Large Object': { dataType: 'object', size: 'lg', label: 'Payload' }
	},
	// The port is absolutely positioned on the edge of its node.
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'position: relative; height: 160px; overflow: hidden; border-radius: 1rem; background: linear-gradient(180deg, #0f172a, #111827);'
		},
		children: [
			{
				kind: 'element',
				tag: 'div',
				attrs: {
					style:
						'position: absolute; inset: 1.5rem auto 1.5rem 50%; width: 7rem; transform: translateX(-50%); border-radius: 1rem; background: rgba(59, 130, 246, 0.25); border: 1px solid rgba(96, 165, 250, 0.35);'
				},
				children: []
			},
			{
				kind: 'element',
				tag: 'div',
				attrs: {
					style:
						'position: absolute; top: 50%; left: 50%; width: 10rem; transform: translate(-50%, -50%);'
				},
				children: [{ kind: 'outlet' }]
			}
		]
	}
} satisfies ContractStory<RecipeNodePort>;
