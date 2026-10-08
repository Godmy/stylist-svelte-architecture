<script lang="ts">
	import BaseIcon from '$stylist/svg/component/atom/icon/index.svelte';
	import type { RecipeNodeProperty as NodePropertyProps } from '$stylist/workspace/interface/recipe/node-property';
	import createNodePropertyState from './state.svelte';

	const Check = 'check';

	let props: NodePropertyProps = $props();
	const state = createNodePropertyState(() => props);
</script>

<div
	class={`${state.propertyState.classes} ${state.className}`}
	data-property-type={state.propertyState.type}
	{...state.restProps}
>
	{#if state.propertyState.hasLabel || props.icon}
		<div class="node-property__header">
			{#if props.icon}
				<span class="node-property__icon">
					{#if typeof props.icon === 'string'}
						<BaseIcon name={props.icon} size={14} />
					{:else}
						{@render props.icon()}
					{/if}
				</span>
			{/if}
			{#if state.propertyState.hasLabel}
				<label class="node-property__label" for={props.id}>
					{state.label}
				</label>
			{/if}
		</div>
	{/if}

	<div class="node-property__content">
		{#if state.propertyState.hasDescription}
			<p class="node-property__description">{state.description}</p>
		{/if}

		<div class="node-property__control-container">
			{#if props.prefix}
				<span class="node-property__prefix">{props.prefix}</span>
			{/if}

			{#if state.isString}
				<input
					id={props.id}
					type="text"
					class="node-property__input node-property__input--string"
					value={String(state.currentValue ?? '')}
					placeholder={props.placeholder}
					disabled={!state.propertyState.editable}
					onfocus={state.handleFocus}
					onblur={state.handleBlur}
					onchange={(event) => state.emitChange((event.target as HTMLInputElement).value)}
				/>
			{:else if state.isNumber}
				<input
					id={props.id}
					type="number"
					class="node-property__input node-property__input--number"
					value={Number(state.currentValue ?? 0)}
					min={props.min}
					max={props.max}
					step={props.step}
					disabled={!state.propertyState.editable}
					onfocus={state.handleFocus}
					onblur={state.handleBlur}
					onchange={(event) => state.emitChange(Number((event.target as HTMLInputElement).value))}
				/>
			{:else if state.isBoolean}
				<button
					type="button"
					class={`node-property__toggle ${state.currentValue ? 'node-property__toggle--active' : ''}`}
					disabled={!state.propertyState.editable}
					onclick={() => state.emitChange(!state.currentValue)}
					onfocus={state.handleFocus}
					onblur={state.handleBlur}
					aria-pressed={Boolean(state.currentValue)}
				>
					<span class="node-property__toggle-track">
						<span class="node-property__toggle-thumb">
							{#if state.currentValue}
								<BaseIcon name={Check} size={12} />
							{/if}
						</span>
					</span>
				</button>
			{:else if state.isEnum}
				<select
					id={props.id}
					class="node-property__select"
					value={String(state.currentValue ?? '')}
					disabled={!state.propertyState.editable}
					onfocus={state.handleFocus}
					onblur={state.handleBlur}
					onchange={(event) => state.emitChange((event.target as HTMLSelectElement).value)}
				>
					{#each props.options ?? [] as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			{:else if state.isColor}
				<div class="node-property__color-picker">
					<input
						id={props.id}
						type="color"
						class="node-property__input node-property__input--color"
						value={String(state.currentValue ?? 'var(--color-text-primary)')}
						disabled={!state.propertyState.editable}
						onfocus={props.onfocus}
						onblur={props.onblur}
						onchange={(event) => state.emitChange((event.target as HTMLInputElement).value)}
					/>
					<span class="node-property__color-value">{String(state.currentValue ?? '')}</span>
				</div>
			{:else if state.isVector}
				<div class="node-property__vector">
					{#each Array(state.vectorDimensions) as _, index}
						<div class="node-property__vector-input">
							<span class="node-property__vector-label">{state.vectorLabels[index]}</span>
							<input
								type="number"
								class="node-property__input node-property__input--number"
								value={Array.isArray(state.currentValue)
									? Number(state.currentValue[index] ?? 0)
									: 0}
								step={props.step ?? 0.1}
								disabled={!state.propertyState.editable}
								onfocus={props.onfocus}
								onblur={props.onblur}
								onchange={(event) =>
									state.handleVectorChange(index, (event.target as HTMLInputElement).value)}
							/>
						</div>
					{/each}
				</div>
			{:else}
				<div class="node-property__placeholder">
					<span class="node-property__placeholder-text">{state.propertyState.type} editor</span>
				</div>
			{/if}

			{#if props.suffix}
				<span class="node-property__suffix">{props.suffix}</span>
			{/if}
		</div>

		{#if state.propertyState.error && props.errorMessage}
			<p class="node-property__error">{props.errorMessage}</p>
		{/if}
	</div>

	{#if props.children}{@render props.children()}{/if}
</div>

<style>
	.node-property {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem;
		background: color-mix(in srgb, var(--color-background-primary) 50%, transparent);
		border-radius: 0.25rem;
		border: 1px solid transparent;
		transition:
			border-color 120ms ease,
			background-color 120ms ease;
	}
	.node-property:hover {
		background: color-mix(in srgb, var(--color-background-primary) 80%, transparent);
	}
	.node-property--error {
		border-color: var(--color-error-500);
	}
	.node-property--readonly {
		opacity: 0.7;
		pointer-events: none;
	}
	.node-property__header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.node-property__label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	.node-property__required {
		color: var(--color-error-500);
	}
	.node-property__icon {
		display: inline-flex;
		color: var(--color-text-secondary);
	}
	.node-property__description {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin: 0;
	}
	.node-property__control-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.node-property__prefix,
	.node-property__suffix {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
	.node-property__input {
		flex: 1 1 auto;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-primary);
		background: var(--color-background-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: 0.25rem;
		outline: none;
	}
	.node-property__input--color {
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: none;
	}
	.node-property__toggle {
		position: relative;
		width: 2.5rem;
		height: 1.25rem;
		padding: 0;
		background: var(--color-border-primary);
		border: none;
		border-radius: 9999px;
		cursor: pointer;
	}
	.node-property__toggle--active {
		background: var(--color-primary-500);
	}
	.node-property__toggle-track {
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(1.25rem - 4px);
		height: calc(1.25rem - 4px);
		background: var(--color-background-secondary);
		border-radius: 9999px;
		transition: transform 120ms ease;
	}
	.node-property__toggle--active .node-property__toggle-track {
		transform: translateX(1.25rem);
	}
	.node-property__toggle-thumb {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-primary);
	}
	.node-property__select {
		flex: 1 1 auto;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-primary);
		background: var(--color-background-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: 0.25rem;
	}
	.node-property__color-picker {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.node-property__color-value {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		font-family: monospace;
	}
	.node-property__vector {
		display: flex;
		gap: 0.25rem;
	}
	.node-property__vector-input {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex: 1 1 0;
		min-width: 0;
	}
	.node-property__vector-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		width: 1rem;
		text-align: center;
	}
	.node-property__placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: color-mix(in srgb, var(--color-background-secondary) 35%, transparent);
		border-radius: 0.25rem;
		border: 1px dashed var(--color-border-secondary);
	}
	.node-property__placeholder-text {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		font-style: italic;
	}
	.node-property__error {
		font-size: 0.75rem;
		color: var(--color-error-500);
		margin: 0;
	}
</style>
