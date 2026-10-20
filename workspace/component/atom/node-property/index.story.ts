import NodeProperty from './index.svelte';
import type { RecipeNodeProperty } from '$stylist/workspace/interface/recipe/node-property';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_SIZE } from '$stylist/design-token/const/array/size';
import { TOKEN_PROPERTY_TYPE } from '$stylist/workspace/const/array/property-type';

/** Node property editor for different value types. */
export default {
	component: NodeProperty,
	title: 'Node Property',
	description: 'Node property editor for different value types.',
	args: {
		id: 'node-property-story',
		name: 'property',
		label: 'Property',
		type: 'string',
		value: 'My Node',
		size: 'md',
		editable: true,
		error: false,
		errorMessage: 'This field is required',
		icon: 'settings'
	},
	controls: {
		// The editor renders dedicated inputs for string..function.
		type: { type: 'select', options: TOKEN_PROPERTY_TYPE.slice(0, 9) },
		// The editor styles xs-lg.
		size: { type: 'select', options: TOKEN_SIZE.slice(0, 4) },
		editable: { type: 'boolean' },
		error: { type: 'boolean' }
	},
	presets: {
		Number: { label: 'Number', type: 'number', value: 42, min: 0, max: 100, step: 1 },
		Boolean: { label: 'Boolean', type: 'boolean', value: true },
		Enum: { label: 'Enum', type: 'enum', value: 'Auto', options: ['Auto', 'Manual', 'Disabled'] },
		Color: { label: 'Color', type: 'color', value: '#3b82f6' },
		Vector2: { label: 'Vector2', type: 'vector2', value: [100, 200] },
		Vector3: { label: 'Vector3', type: 'vector3', value: [1, 1, 1] },
		Object: { label: 'Object', type: 'object', value: {} },
		Function: { label: 'Function', type: 'function', value: null }
	},
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'background: #1e1e1e; padding: var(--spacing-5); border-radius: var(--border-radius-lg); max-width: 520px;'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeNodeProperty>;
