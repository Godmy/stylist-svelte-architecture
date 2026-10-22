import Minimap from '$stylist/workspace/component/organism/minimap/index.svelte';
import type { RecipeMinimap } from '$stylist/workspace/interface/recipe/minimap';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Compact navigator for large graph scenes. */
export default {
	component: Minimap,
	title: 'Minimap',
	description: 'Compact navigator for large graph scenes.',
	args: {
		nodes: [
			{
				id: 'node-1',
				title: 'Collector',
				type: 'source',
				x: 80,
				y: 100,
				color: '#0f766e',
				width: 160,
				height: 84,
				inputs: [],
				outputs: [],
				properties: []
			},
			{
				id: 'node-2',
				title: 'Router',
				type: 'processor',
				x: 320,
				y: 160,
				color: '#b45309',
				width: 180,
				height: 96,
				inputs: [],
				outputs: [],
				properties: []
			},
			{
				id: 'node-3',
				title: 'Dashboard',
				type: 'output',
				x: 620,
				y: 120,
				color: '#1d4ed8',
				width: 180,
				height: 90,
				inputs: [],
				outputs: [],
				properties: []
			},
			{
				id: 'node-4',
				title: 'Archive',
				type: 'custom',
				x: 250,
				y: 360,
				color: '#7c3aed',
				width: 150,
				height: 78,
				inputs: [],
				outputs: [],
				properties: []
			},
			{
				id: 'node-5',
				title: 'Inspector',
				type: 'custom',
				x: 760,
				y: 300,
				color: '#0f766e',
				width: 150,
				height: 78,
				inputs: [],
				outputs: [],
				properties: [],
				selected: true
			}
		],
		zoom: 1,
		offset: { x: 0, y: 0 },
		width: 240,
		height: 172,
		showZoomControls: true,
		showViewport: true,
		backgroundColor: '#f8fafc',
		gridColor: '#cbd5e1',
		nodeColor: '#94a3b8',
		activeNodeColor: '#0f766e',
		viewportColor: '#1d4ed8'
	},
	controls: {
		width: { type: 'number' },
		height: { type: 'number' },
		zoom: { type: 'range', min: 0.25, max: 2, step: 0.05 },
		showZoomControls: { type: 'boolean' },
		showViewport: { type: 'boolean' },
		backgroundColor: { type: 'color' },
		gridColor: { type: 'color' },
		nodeColor: { type: 'color' },
		activeNodeColor: { type: 'color' },
		viewportColor: { type: 'color' }
	},
	presets: {
		'Compact Navigator': {
			width: 180,
			height: 132,
			showZoomControls: false,
			backgroundColor: '#ffffff',
			gridColor: '#dbe4ee'
		},
		'Workbench Panel': {
			zoom: 1.15,
			offset: { x: 120, y: 40 },
			width: 300,
			height: 190,
			activeNodeColor: '#b45309',
			viewportColor: '#7c3aed'
		}
	}
} satisfies ContractStory<RecipeMinimap>;
