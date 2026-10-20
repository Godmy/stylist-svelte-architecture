import Stage from './index.svelte';
import type { RecipeStage } from '$stylist/workspace/interface/recipe/stage';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import type { HtmlElementNode } from '$stylist/html/type/struct/html-element-node';

function tile(label: string, left: number, top: number, color: string): HtmlElementNode {
	return {
		kind: 'element',
		tag: 'div',
		attrs: {
			style: `position: absolute; left: ${left}px; top: ${top}px; width: 160px; height: 88px; display: flex; align-items: center; justify-content: center; border-radius: var(--border-radius-lg); background: ${color}; color: #ffffff; font-weight: 600;`
		},
		children: [{ kind: 'text', value: label }]
	};
}

/** World layer translated and scaled by a camera. */
export default {
	component: Stage,
	title: 'Stage',
	description:
		'World layer of a pan and zoom scene: its content is translated and scaled by the camera.',
	args: {
		camera: { x: 0, y: 0, zoom: 1 },
		worldWidth: 640,
		worldHeight: 360
	},
	controls: {
		worldWidth: { type: 'number', min: 160, max: 1600, step: 20 },
		worldHeight: { type: 'number', min: 120, max: 1200, step: 20 }
	},
	presets: {
		Zoomed: { camera: { x: 0, y: 0, zoom: 1.5 } },
		Panned: { camera: { x: 120, y: 60, zoom: 1 } },
		Overview: { camera: { x: 0, y: 0, zoom: 0.6 } }
	},
	content: [
		tile('Source', 40, 48, '#16a34a'),
		tile('Processor', 240, 136, '#2563eb'),
		tile('Output', 440, 224, '#d97706')
	],
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'display: inline-block; border: 1px solid var(--color-border-primary); border-radius: var(--border-radius-md); background: var(--color-background-secondary);'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeStage>;
