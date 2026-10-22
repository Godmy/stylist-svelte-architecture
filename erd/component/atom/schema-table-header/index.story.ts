import SchemaTableHeader from '$stylist/erd/component/atom/schema-table-header/index.svelte';
import type { RecipeErdTableHeader } from '$stylist/erd/interface/recipe/erd-table-header';
import type { ContractStory } from '$stylist/html/interface/contract/story';

export default {
	component: SchemaTableHeader,
	title: 'Schema Table Header',
	description: 'Header row for an ERD table node.',
	args: {
		table: {
			id: 'user-account',
			name: 'UserAccount',
			fields: [
				{
					id: 'user-account.id',
					name: 'id',
					type: 'uuid',
					required: true,
					primary: true,
					unique: true,
					notes: []
				},
				{
					id: 'user-account.email',
					name: 'email',
					type: 'varchar',
					required: true,
					primary: false,
					unique: true,
					notes: []
				}
			]
		},
		active: true
	},
	controls: {
		active: { type: 'boolean' }
	},
	presets: {
		Inactive: { active: false }
	},
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'width: 280px; overflow: hidden; border: 1px solid rgba(22, 31, 44, 0.14); border-radius: 0.5rem; background: #ffffff;'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeErdTableHeader>;
