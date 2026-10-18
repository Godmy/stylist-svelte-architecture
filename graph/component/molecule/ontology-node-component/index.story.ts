import OntologyNodeComponent from './index.svelte';
import type { RecipeOntologyNodeComponent } from '$stylist/graph/interface/recipe/ontology-node-component';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Node renderer for ontology graph nodes. */
export default {
	component: OntologyNodeComponent,
	title: 'OntologyNodeComponent',
	description: 'Node renderer for ontology graph nodes.',
	args: {
		showLabel: true,
		node: {
			id: 'test-node',
			name: 'Test Node',
			type: 'class',
			position: { x: 100, y: 100 },
			width: 120,
			height: 60
		}
	},
	controls: { showLabel: { type: 'boolean' } },
	presets: {
		'Object property': {
			node: {
				id: 'owns',
				name: 'owns',
				label: 'owns',
				type: 'object-property',
				position: { x: 100, y: 100 },
				width: 120,
				height: 60
			}
		},
		'With attributes': {
			node: {
				id: 'account',
				name: 'Account',
				label: 'Account',
				type: 'class',
				position: { x: 100, y: 100 },
				width: 160,
				height: 80,
				attributes: ['id', 'email', 'createdAt']
			}
		}
	},
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'display: flex; height: 16rem; max-width: 28rem; margin: 0 auto; align-items: center; justify-content: center; border: 1px solid var(--color-border-primary); border-radius: 0.5rem;'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeOntologyNodeComponent>;
