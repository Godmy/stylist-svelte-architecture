import SchemaTool from '$stylist/erd/component/organism/schema-tool/index.svelte';
import type { RecipeSchemaTool } from '$stylist/erd/interface/recipe/schema-tool';
import type { ContractStory } from '$stylist/html/interface/contract/story';

export default {
	component: SchemaTool,
	title: 'Schema Tool',
	description: 'Icon toolbar for import, export, zoom and relation visibility.',
	args: {
		zoom: 1,
		showRelations: true,
		highlightRelations: true,
		canImport: true,
		canExport: true,
		layout: 'grid',
		mode: 'live',
		textPanelVisible: true,
		persistLayout: false
	},
	controls: {
		zoom: { type: 'number', min: 0.4, max: 2, step: 0.1 },
		showRelations: { type: 'boolean' },
		highlightRelations: { type: 'boolean' },
		canImport: { type: 'boolean' },
		canExport: { type: 'boolean' },
		// SchemaLayout and SchemaMode have no token arrays.
		layout: { type: 'select', options: ['grid', 'wide', 'columns', 'radial', 'clusters', 'star'] },
		mode: { type: 'select', options: ['live', 'edit', 'migrate'] },
		textPanelVisible: { type: 'boolean' },
		persistLayout: { type: 'boolean' }
	},
	presets: {
		'Migrate mode': { mode: 'migrate', persistLayout: true },
		'Read only': { canImport: false, canExport: false, showRelations: false }
	},
	context: {
		kind: 'element',
		tag: 'div',
		attrs: { style: 'display: flex; padding: 1rem; border-radius: 0.5rem; background: #eef3f8;' },
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeSchemaTool>;
