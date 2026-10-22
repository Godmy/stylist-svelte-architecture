import SchemaDependency from '$stylist/erd/component/atom/schema-dependency/index.svelte';
import type { RecipeErdDependency } from '$stylist/erd/interface/recipe/erd-dependency';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** SVG relation marker; index.story.svelte draws the two tables it connects. */
export default {
	component: SchemaDependency,
	title: 'Schema Dependency',
	description: 'SVG relation marker between two schema fields.',
	args: {
		dependency: {
			id: 'user.organization--organization.id',
			sourceTable: 'user',
			sourceField: 'organization_id',
			targetTable: 'organization',
			targetField: 'id',
			label: 'User.organization_id -> Organization.id'
		},
		x1: 188,
		y1: 88,
		x2: 332,
		y2: 128,
		active: true,
		dimmed: false
	},
	controls: {
		active: { type: 'boolean' },
		dimmed: { type: 'boolean' },
		// The target table follows the end point of the relation.
		y2: { type: 'range', min: 48, max: 208, step: 10 }
	},
	presets: {
		Aligned: { y2: 88 },
		Dimmed: { active: false, dimmed: true }
	}
} satisfies ContractStory<RecipeErdDependency>;
