import Schema from '$stylist/erd/component/organism/schema/index.svelte';
import type { RecipeSchema } from '$stylist/erd/interface/recipe/schema';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import schemaSource from '$stylist/erd/data/md/schema/schema.md?raw';

/** No presets: every preset remounts the full sample schema (150 KB), which is slow. */
export default {
	component: Schema,
	title: 'Schema',
	description:
		'Composed ERD organism with text dialect editor, toolbar controls and draggable schema view.',
	args: {
		value: schemaSource,
		zoom: 1,
		showRelations: true,
		highlightRelations: true,
		draggable: true
	},
	controls: {
		zoom: { type: 'number', min: 0.5, max: 1.6, step: 0.1 },
		showRelations: { type: 'boolean' },
		highlightRelations: { type: 'boolean' },
		draggable: { type: 'boolean' }
	},
	layout: 'fullscreen'
} satisfies ContractStory<RecipeSchema>;
