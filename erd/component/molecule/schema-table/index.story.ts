import SchemaTable from '$stylist/erd/component/molecule/schema-table/index.svelte';
import type { RecipeErdTable } from '$stylist/erd/interface/recipe/erd-table';
import type { ContractStory } from '$stylist/html/interface/contract/story';

export default {
	component: SchemaTable,
	title: 'Schema Table',
	description: 'ERD table molecule composed from header and field atoms.',
	args: {
		table: {
			id: 'invoice',
			name: 'Invoice',
			fields: [
				{
					id: 'invoice.id',
					name: 'id',
					type: 'uuid',
					required: true,
					primary: true,
					unique: true,
					notes: []
				},
				{
					id: 'invoice.customer_id',
					name: 'customer_id',
					type: 'uuid',
					required: true,
					primary: false,
					unique: false,
					reference: 'Customer.id',
					notes: ['required']
				},
				{
					id: 'invoice.total',
					name: 'total',
					type: 'decimal',
					required: true,
					primary: false,
					unique: false,
					notes: ['required']
				},
				{
					id: 'invoice.status',
					name: 'status',
					type: 'varchar',
					required: true,
					primary: false,
					unique: false,
					notes: ['required']
				}
			]
		},
		active: true,
		dimmed: false,
		relatedFieldIds: ['invoice.customer_id']
	},
	controls: {
		active: { type: 'boolean' },
		dimmed: { type: 'boolean' }
	},
	presets: {
		'No highlight': { relatedFieldIds: [] },
		Dimmed: { active: false, dimmed: true, relatedFieldIds: [] }
	},
	context: {
		kind: 'element',
		tag: 'div',
		attrs: { style: 'padding: 1rem; border-radius: 0.5rem; background: #eef3f8;' },
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeErdTable>;
