import SharedCanvas from '$stylist/canvas/component/organism/shared-canvas/index.svelte';
import { SHARED_CANVAS_TOOL_DEFINITIONS } from '$stylist/canvas/const/record/canvas-tool-definitions';
import type { RecipeSharedCanvas } from '$stylist/canvas/interface/recipe/shared-canvas';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Infinite whiteboard: hand and select modes, text, stickies, shapes, pen, lines, frames, icons. */
export default {
	component: SharedCanvas,
	title: 'SharedCanvas',
	description:
		'Whiteboard: drag the board with the hand tool, Space or the middle button; select, move and resize objects; add text with fonts, sticky notes, shapes, freehand drawing, lines, arrows, frames and icons. Ctrl+wheel zooms, Ctrl+Z / Ctrl+Shift+Z undo and redo, Delete removes, double-click edits text.',
	args: {
		height: 600,
		objects: [
			{
				id: 'frame1',
				type: 'frame',
				title: 'Frame 1',
				x: 420,
				y: 80,
				width: 360,
				height: 220,
				fill: '#ffffff',
				color: '#9ca3af'
			},
			{
				id: 'square1',
				type: 'shape',
				shape: 'rectangle',
				x: 450,
				y: 120,
				width: 60,
				height: 60,
				color: '#111827',
				fill: 'transparent',
				strokeWidth: 1.5
			},
			{
				id: 'triangle1',
				type: 'shape',
				shape: 'triangle',
				x: 440,
				y: 210,
				width: 70,
				height: 60,
				color: '#111827',
				fill: 'transparent',
				strokeWidth: 1.5
			},
			{
				id: 'star1',
				type: 'shape',
				shape: 'star',
				x: 640,
				y: 140,
				width: 90,
				height: 90,
				color: '#ca8a04',
				fill: '#fde68a',
				strokeWidth: 2,
				text: ''
			},
			{
				id: 'arrow1',
				type: 'line',
				arrow: true,
				points: [
					{ x: 520, y: 150 },
					{ x: 630, y: 180 }
				],
				color: '#6b7280',
				strokeWidth: 2
			},
			{
				id: 'text1',
				type: 'text',
				x: 120,
				y: 100,
				width: 240,
				height: 40,
				text: 'Shared Canvas',
				color: '#111827',
				font: { family: 'serif', size: 28, bold: true }
			},
			{
				id: 'sticky1',
				type: 'sticky',
				x: 120,
				y: 180,
				width: 180,
				height: 180,
				text: 'Двойной щелчок — редактировать',
				fill: '#fde68a',
				color: '#111827',
				font: { family: 'hand', size: 20, align: 'center' }
			},
			{
				id: 'icon1',
				type: 'icon',
				icon: 'lightbulb',
				x: 330,
				y: 200,
				width: 56,
				height: 56,
				color: '#f97316'
			},
			{
				id: 'path1',
				type: 'path',
				points: [
					{ x: 140, y: 420 },
					{ x: 180, y: 390 },
					{ x: 220, y: 430 },
					{ x: 260, y: 395 },
					{ x: 300, y: 425 }
				],
				color: '#3b82f6',
				strokeWidth: 4
			}
		],
		users: [
			{ id: 'user1', name: 'Alice', color: '#8b5cf6' },
			{ id: 'user2', name: 'Bob', color: '#ec4899', cursorPosition: { x: 560, y: 260 } }
		],
		currentUserId: 'user1',
		selectedTool: 'select',
		showUsers: true,
		showToolbar: true,
		showZoomControls: true,
		showGrid: true,
		readonly: false
	},
	controls: {
		height: { type: 'select', options: [400, 500, 600, 700] },
		selectedTool: {
			type: 'select',
			options: SHARED_CANVAS_TOOL_DEFINITIONS.map((tool) => tool.id)
		},
		showUsers: { type: 'boolean' },
		showToolbar: { type: 'boolean' },
		showZoomControls: { type: 'boolean' },
		showGrid: { type: 'boolean' },
		readonly: { type: 'boolean' }
	},
	presets: {
		'Read only': { readonly: true },
		'Empty board': { objects: [] },
		Pen: { selectedTool: 'pen' }
	}
} satisfies ContractStory<RecipeSharedCanvas>;
