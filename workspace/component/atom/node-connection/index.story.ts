import NodeConnection from '$stylist/workspace/component/atom/node-connection/index.svelte';
import type { RecipeNodeConnection } from '$stylist/workspace/interface/recipe/node-connection';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_TRAJECTORY } from '$stylist/workspace/const/array/trajectory';
import { TOKEN_BORDER_STYLE } from '$stylist/layout/const/array/border-style';

// The connection draws bezier, straight, step and arc paths.
const DRAWN_TRAJECTORIES: readonly string[] = ['bezier', 'straight', 'step', 'arc'];

/** Connection line between two node ports; index.story.svelte provides the SVG parent. */
export default {
	component: NodeConnection,
	title: 'Connection Line',
	description:
		'Connection line between two node ports with path type, line style, arrow and label.',
	args: {
		id: 'demo-connection',
		startX: 40,
		startY: 60,
		endX: 400,
		endY: 160,
		type: 'bezier',
		color: '#3b82f6',
		lineStyle: 'solid',
		strokeWidth: 2,
		active: false,
		animated: false,
		showArrow: true,
		label: ''
	},
	controls: {
		type: {
			type: 'select',
			options: TOKEN_TRAJECTORY.filter((type) => DRAWN_TRAJECTORIES.includes(type))
		},
		// The path styles solid, dashed and dotted lines.
		lineStyle: { type: 'select', options: TOKEN_BORDER_STYLE.slice(0, 3) },
		color: { type: 'color' },
		strokeWidth: { type: 'range', min: 1, max: 8, step: 1 },
		startX: { type: 'number' },
		startY: { type: 'number' },
		endX: { type: 'number' },
		endY: { type: 'number' },
		active: { type: 'boolean' },
		animated: { type: 'boolean' },
		showArrow: { type: 'boolean' },
		label: { type: 'text' }
	},
	presets: {
		Straight: { type: 'straight', color: '#22c55e', startY: 110, endY: 110 },
		'Dashed Step': { type: 'step', color: '#f59e0b', lineStyle: 'dashed', showArrow: false },
		'Active With Label': { active: true, animated: true, label: 'active' }
	}
} satisfies ContractStory<RecipeNodeConnection>;
