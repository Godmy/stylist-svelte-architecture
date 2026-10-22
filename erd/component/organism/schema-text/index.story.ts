import SchemaText from '$stylist/erd/component/organism/schema-text/index.svelte';
import type { RecipeSchemaText } from '$stylist/erd/interface/recipe/schema-text';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { DEFAULT_SCHEMA_TEXT } from '$stylist/erd/const/value/schema-text';

export default {
	component: SchemaText,
	title: 'Schema Text',
	description: 'Text editor for the ERD schema dialect.',
	args: { value: DEFAULT_SCHEMA_TEXT },
	controls: {
		value: { type: 'text' },
		placeholder: { type: 'text' }
	},
	presets: {
		Empty: { value: '', placeholder: 'Table Name\n  id uuid pk' }
	}
} satisfies ContractStory<RecipeSchemaText>;
