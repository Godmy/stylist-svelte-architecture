<script lang="ts">
	import { ZWICKY_DOMAIN_COLOR } from '$stylist/graph/const/record/zwicky-domain-color';
	import GraphDot from '$stylist/graph/component/atom/graph-dot/index.svelte';

	type Props = {
		activeDomains?: Set<string>;
		onDomainClick?: (domain: string) => void;
	};

	let { activeDomains, onDomainClick }: Props = $props();

	const entries = Object.entries(ZWICKY_DOMAIN_COLOR);
</script>

<aside class="graph-legend">
	<p class="graph-legend__title">Domains</p>
	<ul class="graph-legend__list">
		{#each entries as [domain, color] (domain)}
			<li>
				<button
					class="graph-legend__item"
					class:graph-legend__item--active={activeDomains?.has(domain)}
					onclick={() => onDomainClick?.(domain)}
				>
					<GraphDot {color} label={domain} />
				</button>
			</li>
		{/each}
	</ul>
</aside>

<style>
	.graph-legend {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 300px;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: rgb(255 255 255 / 15%) transparent;
	}

	.graph-legend__title {
		margin: 0;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgb(126 148 172);
	}

	.graph-legend__list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.18rem;
	}

	.graph-legend__item {
		all: unset;
		cursor: pointer;
		padding: 0.22rem 0.4rem;
		border-radius: 0.3rem;
		transition: background 0.1s;
	}

	.graph-legend__item:hover {
		background: rgb(255 255 255 / 7%);
	}

	.graph-legend__item--active {
		background: rgb(255 255 255 / 12%);
	}
</style>
