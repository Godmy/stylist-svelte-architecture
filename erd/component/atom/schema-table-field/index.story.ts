import SchemaTableField from '$stylist/erd/component/atom/schema-table-field/index.svelte';
import type { RecipeErdTableField } from '$stylist/erd/interface/recipe/erd-table-field';
import type { ContractStory } from '$stylist/html/interface/contract/story';

export default {
	component: SchemaTableField,
	title: 'Schema Table Field',
	description: 'Field row with primary, required, unique and relation badges.',
	args: {
		field: {
			id: 'user-account.organization_id',
			name: 'organization_id',
			type: 'uuid',
			required: true,
			primary: false,
			unique: false,
			reference: 'Organization.id',
			notes: ['required']
		},
		related: true,
		active: false
	},
	controls: {
		related: { type: 'boolean' },
		active: { type: 'boolean' }
	},
	presets: {
		'Primary key': {
			field: {
				id: 'user-account.id',
				name: 'id',
				type: 'uuid',
				required: true,
				primary: true,
				unique: true,
				notes: []
			},
			related: false
		},
		Unique: {
			field: {
				id: 'user-account.email',
				name: 'email',
				type: 'varchar',
				required: true,
				primary: false,
				unique: true,
				notes: ['required']
			},
			related: false
		}
	},
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'width: 340px; overflow: hidden; border: 1px solid rgba(22, 31, 44, 0.14); border-radius: 0.5rem; background: #ffffff;'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeErdTableField>;
