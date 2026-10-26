<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SlotCanvasToolbarDrawingOptions } from '$stylist/canvas/interface/slot/canvas-toolbar-drawing-options';
	import type { CanvasToolbarDrawingTool } from '$stylist/canvas/type/alias/canvas-toolbar-drawing-tool';
	import type { RecipeCanvasToolbar } from '$stylist/canvas/interface/recipe/canvas-toolbar';
	import createCanvasToolbarState from '$stylist/canvas/component/molecule/canvas-toolbar/state.svelte';

	let dispatch = createEventDispatcher<{
		'tool-change': { tool: CanvasToolbarDrawingTool; options: SlotCanvasToolbarDrawingOptions };
		'clear-canvas': undefined;
		undo: undefined;
		redo: undefined;
		save: undefined;
	}>();

	import { CANVAS_CANVAS_TOOLBAR_MESSAGE } from '$stylist/canvas/const/record/canvas-toolbar-message';
	import { useMessage } from '$stylist/localization/function/hook/use-message';

	let props: RecipeCanvasToolbar = $props();
	const t = useMessage('canvas-toolbar', CANVAS_CANVAS_TOOLBAR_MESSAGE);
	const state = createCanvasToolbarState(
		() => props,
		(type, detail) => dispatch(type as never, detail as never)
	);

	export const clearCanvas = () => state.clearCanvas();
	export const undo = () => state.undo();
	export const redo = () => state.redo();
	export const save = () => state.save();
</script>

<div class="canvas-toolbar">
	<div class="tool-selector">
		<button
			class="tool-btn {state.currentTool === 'pen' ? 'active' : ''}"
			onclick={() => state.selectTool('pen')}
			type="button"
		>
			{t('pen')}
		</button>
		<button
			class="tool-btn {state.currentTool === 'eraser' ? 'active' : ''}"
			onclick={() => state.selectTool('eraser')}
			type="button"
		>
			{t('eraser')}
		</button>
	</div>

	<div class="tool-specific-options">
		<div class="option-group">
			<label for="line-width" class="option-label">{t('lineWidth')}</label>
			<input
				id="line-width"
				type="range"
				min="1"
				max="20"
				bind:value={state.currentOptions.lineWidth}
				oninput={() => state.handleOptionsUpdate(state.currentOptions)}
				class="option-input"
			/>
			<span class="option-value">{state.currentOptions.lineWidth}px</span>
		</div>

		<div class="option-group">
			<label for="color-picker" class="option-label">{t('color')}</label>
			<input
				id="color-picker"
				type="color"
				bind:value={state.currentOptions.strokeColor}
				oninput={() => state.handleOptionsUpdate(state.currentOptions)}
				class="option-input"
			/>
		</div>
	</div>

	<div class="action-buttons">
		<button class="action-btn" onclick={() => state.clearCanvas()} type="button"
			>{t('clear')}</button
		>
		<button class="action-btn" onclick={() => state.save()} type="button">{t('save')}</button>
		<button class="action-btn" onclick={() => state.undo()} type="button" disabled
			>{t('undo')}</button
		>
		<button class="action-btn" onclick={() => state.redo()} type="button" disabled
			>{t('redo')}</button
		>
	</div>
</div>

<style>
	.canvas-toolbar {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--color-background-secondary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-custom36);
		width: 250px;
	}

	.tool-selector {
		display: flex;
		gap: var(--space-2);
		justify-content: space-between;
	}

	.tool-btn {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-secondary);
		border-radius: var(--radius-1-5);
		background-color: var(--color-background-primary);
		cursor: pointer;
		transition: all var(--duration-200);
		font-size: var(--font-size-3);
	}

	.tool-btn:hover {
		background-color: var(--color-background-tertiary);
	}

	.tool-btn.active {
		background-color: var(--color-primary-600);
		color: var(--color-text-inverse);
		border-color: var(--color-primary-600);
	}

	.action-buttons {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2);
	}

	.action-btn {
		padding: var(--space-2);
		border: 1px solid var(--color-border-secondary);
		border-radius: var(--radius-1-5);
		background-color: var(--color-background-primary);
		cursor: pointer;
		transition: all var(--duration-200);
		font-size: var(--font-size-3);
	}

	.action-btn:hover {
		background-color: var(--color-background-tertiary);
	}

	.tool-specific-options {
		margin-top: var(--space-3);
	}

	.option-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-3);
	}

	.option-label {
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.option-input {
		width: 100%;
		margin-top: var(--space-1);
	}

	.option-value {
		font-size: var(--font-size-3);
		color: var(--color-text-secondary);
		text-align: center;
	}
</style>
