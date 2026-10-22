import SchemaHeader from '$stylist/erd/component/organism/schema-header/index.svelte';
import type { RecipeSchemaHeader } from '$stylist/erd/interface/recipe/schema-header';
import type { ContractStory } from '$stylist/html/interface/contract/story';

export default {
	component: SchemaHeader,
	title: 'Schema Header',
	description: 'Title, schema statistics and the tool bar of the ERD editor.',
	args: {
		title: 'Schema',
		stats: { tables: 12, relations: 18, errors: 0 },
		zoom: 1,
		showRelations: true,
		highlightRelations: true,
		layout: 'grid',
		canImport: true,
		canExport: true,
		mode: 'live',
		textPanelVisible: true,
		persistLayout: false
	},
	controls: {
		title: { type: 'text' },
		zoom: { type: 'number', min: 0.4, max: 2, step: 0.1 },
		showRelations: { type: 'boolean' },
		highlightRelations: { type: 'boolean' },
		// SchemaLayout and SchemaMode have no token arrays.
		layout: { type: 'select', options: ['grid', 'wide', 'columns', 'radial', 'clusters', 'star'] },
		mode: { type: 'select', options: ['live', 'edit', 'migrate'] },
		canImport: { type: 'boolean' },
		canExport: { type: 'boolean' },
		textPanelVisible: { type: 'boolean' },
		persistLayout: { type: 'boolean' }
	},
	presets: {
		'With errors': { stats: { tables: 12, relations: 18, errors: 3 }, mode: 'edit' },
		'Without stats': { stats: undefined, canImport: false, canExport: false }
	},
	layout: 'fullscreen'
} satisfies ContractStory<RecipeSchemaHeader>;
