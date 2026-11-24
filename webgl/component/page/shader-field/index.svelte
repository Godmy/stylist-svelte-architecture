<script lang="ts">
	import HtmlButton from '$stylist/html/component/atom/button/index.svelte';
	import HtmlH2 from '$stylist/html/component/atom/h2/index.svelte';
	import HtmlInputColor from '$stylist/html/component/atom/input-color/index.svelte';
	import HtmlInputRange from '$stylist/html/component/atom/input-range/index.svelte';
	import HtmlLabel from '$stylist/html/component/atom/label/index.svelte';
	import HtmlP from '$stylist/html/component/atom/p/index.svelte';
	import HtmlSmall from '$stylist/html/component/atom/small/index.svelte';
	import HtmlSection from '$stylist/html/component/organism/section/index.svelte';
	import InterferenceFieldScene from '$stylist/webgl/component/molecule/interference-field-scene/index.svelte';

	import type { RecipeShaderField } from '$stylist/webgl/interface/recipe/shader-field';
	import createShaderFieldComponentState from '$stylist/webgl/component/page/shader-field/state.svelte';

	let { element = $bindable(null), title, class: className, ...rest }: RecipeShaderField = $props();

	const state = createShaderFieldComponentState();
</script>

<HtmlSection
	bind:element
	{...rest}
	class={['c-shader-field', className]}
	aria-label={title ?? state.t('title')}
>
	<HtmlSection
		class="c-shader-field__stage"
		data-renderer={state.supported ? 'webgl' : 'fallback'}
		aria-label={state.t('stage')}
	>
		{#if state.supported}
			<InterferenceFieldScene
				speed={state.speed}
				color={state.color}
				onUnsupported={() => (state.supported = false)}
			/>
		{/if}
		<HtmlSmall role="status" class="c-shader-field__status">
			{state.supported ? state.t('renderer') : state.t('unsupported')}
		</HtmlSmall>
	</HtmlSection>
	<HtmlSection class="c-shader-field__panel">
		<HtmlH2 class="c-shader-field__title">{state.t('panel')}</HtmlH2>
		<HtmlLabel class="c-shader-field__field">
			{state.t('speed')}
			<HtmlInputRange min="0" max="3" step="0.1" bind:value={state.speed} />
			{state.speed}
		</HtmlLabel>
		<HtmlLabel class="c-shader-field__field">
			{state.t('color')}
			<HtmlInputColor bind:value={state.color} />
		</HtmlLabel>
		<HtmlButton
			type="button"
			class="c-shader-field__button"
			onclick={() => (state.speed = state.speed === 0 ? 1 : 0)}
		>
			{state.speed === 0 ? state.t('resume') : state.t('pause')}
		</HtmlButton>
		<HtmlP>
			{state.t('resize')}
		</HtmlP>
		<HtmlP>{state.t('native')}</HtmlP>
	</HtmlSection>
</HtmlSection>

<style>
	:global {
		.c-shader-field {
			display: grid;
			grid-template-columns: minmax(0, 1.6fr) minmax(15.625rem, 1fr);
			align-items: start;
			gap: calc(var(--space-4, 1rem) * 1.5);
			color: var(--color-text-primary);
		}
		.c-shader-field__stage {
			position: relative;
			height: 26.875rem;
			overflow: hidden;
			border-radius: var(--radius-4, 1rem);
			background: radial-gradient(
				ellipse,
				var(--color-primary-800, #1e40af),
				var(--color-background-inverse, #0f172a) 65%
			);
		}
		.c-shader-field__status {
			position: absolute;
			bottom: var(--space-4, 1rem);
			left: var(--space-4, 1rem);
			font-size: var(--font-size-3, 0.75rem);
			color: var(--color-text-inverse, #fff);
		}
		.c-shader-field__panel {
			display: flex;
			flex-direction: column;
			gap: calc(var(--space-4, 1rem) * 0.75);
			padding: calc(var(--space-4, 1rem) * 1.5);
			border: var(--border-width-thin, 1px) solid var(--color-border-primary);
			border-radius: var(--radius-3, 0.75rem);
			background: var(--color-background-primary);
		}
		.c-shader-field__title {
			margin: 0;
			font-size: var(--font-size-5, 1.25rem);
		}
		.c-shader-field__field {
			display: flex;
			flex-direction: column;
			gap: calc(var(--space-4, 1rem) / 4);
			font-weight: var(--font-weight-medium, 500);
		}
		.c-shader-field__button {
			padding: var(--density-block, 0.5rem) var(--density-inline, 0.75rem);
			border: var(--border-width-thin, 1px) solid var(--color-primary-600);
			border-radius: var(--radius-1-5, 0.375rem);
			background: var(--color-primary-600);
			color: var(--color-on-primary, #fff);
			font: inherit;
			cursor: pointer;
		}
		.c-shader-field__button:focus-visible {
			outline: var(--focus-width, 2px) solid var(--color-border-accent, var(--color-primary-500));
			outline-offset: var(--focus-offset, 0.125rem);
		}
		@media (max-width: 760px) {
			.c-shader-field {
				grid-template-columns: 1fr;
			}
			.c-shader-field__stage {
				height: 20rem;
			}
		}
	}
</style>
