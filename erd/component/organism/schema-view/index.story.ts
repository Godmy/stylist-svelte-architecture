import SchemaView from './index.svelte';
import type { RecipeErdSchemaView } from '$stylist/erd/interface/recipe/erd-schema-view';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { DEFAULT_SCHEMA_TEXT } from '$stylist/erd/const/value/schema-text';
import { schemaTextToDocument } from '$stylist/erd/function/transform/schema-text-to-document';

export default {
	component: SchemaView,
	title: 'Schema View',
	description: 'Scrollable ERD canvas with tables and dependency lines.',
	args: {
		document: schemaTextToDocument(DEFAULT_SCHEMA_TEXT).document,
		zoom: 1,
		showRelations: true,
		highlightRelations: true,
		draggable: true,
		activeTableId: 'user'
	},
	controls: {
		zoom: { type: 'number', min: 0.5, max: 1.6, step: 0.1 },
		showRelations: { type: 'boolean' },
		highlightRelations: { type: 'boolean' },
		draggable: { type: 'boolean' },
		// Table ids of DEFAULT_SCHEMA_TEXT.
		activeTableId: { type: 'select', options: ['user', 'profile'] }
	},
	presets: {
		'Profile active': { activeTableId: 'profile' },
		'Without relations': { showRelations: false }
	}
} satisfies ContractStory<RecipeErdSchemaView>;
