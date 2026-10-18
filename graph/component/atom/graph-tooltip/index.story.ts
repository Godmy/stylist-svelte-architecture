import GraphTooltip from './index.svelte';
import type { RecipeGraphTooltip } from '$stylist/graph/interface/recipe/graph-tooltip';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Hover card of a Zwicky graph node, kept inside its container. */
export default {
	component: GraphTooltip,
	title: 'GraphTooltip',
	description:
		'Hover card of a Zwicky graph node: family, path, domain/cluster/joint chips and dependencies. It flips to stay inside the container.',
	args: {
		node: {
			id: 'graph/component/atom/graph-dot',
			path: 'modules/architecture/graph/component/atom/graph-dot',
			domain: 'graph',
			cluster: 'component',
			joint: 'atom',
			family: 'graph-dot',
			level: 'family',
			x: 0,
			y: 0,
			z: 0,
			size: 1,
			color: [0.18, 0.88, 0.76],
			dependencyIds: [
				'graph/interface/recipe/graph-dot',
				'theme/type/compute/intersect-all',
				'design-token/type/alias/size'
			]
		},
		x: 40,
		y: 40,
		containerWidth: 640,
		containerHeight: 360
	},
	controls: {
		x: { type: 'range', min: 0, max: 640, step: 10 },
		y: { type: 'range', min: 0, max: 360, step: 10 },
		containerWidth: { type: 'number', min: 320, max: 1280, step: 10 },
		containerHeight: { type: 'number', min: 240, max: 960, step: 10 }
	},
	presets: {
		'Near the right edge': { x: 520, y: 220 },
		'Without dependencies': {
			node: {
				id: 'graph/const/value/instanced-max-count',
				path: 'modules/architecture/graph/const/value/instanced-max-count',
				domain: 'graph',
				cluster: 'const',
				joint: 'value',
				family: 'instanced-max-count',
				level: 'family',
				x: 0,
				y: 0,
				z: 0,
				size: 1,
				color: [0.18, 0.88, 0.76],
				dependencyIds: []
			}
		}
	},
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'position: relative; width: 640px; height: 360px; overflow: hidden; border-radius: 0.5rem; background: #050810;'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeGraphTooltip>;
