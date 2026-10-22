import OntologyEdgeComponent from '$stylist/graph/component/molecule/ontology-edge-component/index.svelte';
import type { RecipeOntologyEdgeComponent } from '$stylist/graph/interface/recipe/ontology-edge-component';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Edge renderer for ontology graph relationships. */
export default {
	component: OntologyEdgeComponent,
	title: 'OntologyEdgeComponent',
	description: 'Edge renderer for ontology graph relationships.',
	args: {
		showLabel: true,
		edge: {
			id: 'edge-1',
			source: 'account',
			target: 'subscription',
			relationship: 'owns',
			label: 'Owns',
			cardinality: '1..*'
		},
		sourceNode: {
			id: 'account',
			name: 'Account',
			type: 'entity',
			position: { x: 80, y: 60 },
			width: 140,
			height: 80
		},
		targetNode: {
			id: 'subscription',
			name: 'SlotSubscription',
			type: 'entity',
			position: { x: 260, y: 220 },
			width: 160,
			height: 90
		}
	},
	controls: { showLabel: { type: 'boolean' } },
	presets: {
		'Sub class of': {
			edge: {
				id: 'edge-2',
				source: 'account',
				target: 'subscription',
				relationship: 'subClassOf',
				label: 'subClassOf'
			}
		},
		'Disjoint with': {
			edge: {
				id: 'edge-3',
				source: 'account',
				target: 'subscription',
				relationship: 'disjointWith',
				label: 'disjointWith'
			}
		}
	},
	// The edge SVG fills its positioned parent.
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'position: relative; height: 16rem; max-width: 28rem; margin: 0 auto; overflow: hidden; border: 1px solid var(--color-border-primary); border-radius: 0.5rem; background-color: var(--color-background-primary);'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeOntologyEdgeComponent>;
