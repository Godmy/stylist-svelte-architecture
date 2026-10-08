<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import SchemaDependency from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'active', type: 'boolean', defaultValue: true },
		{ name: 'targetOffset', type: 'number', defaultValue: 40, min: -80, max: 120, step: 10 }
	];
</script>

<Story
	component={SchemaDependency}
	title="Schema Dependency"
	description="SVG relation marker between two schema fields."
	{controls}
>
	{#snippet children(values: any)}
		<svg
			class="schema-dependency-story"
			viewBox="0 0 520 180"
			aria-label="Schema dependency preview"
		>
			<rect x="28" y="44" width="160" height="88" rx="8" />
			<rect x="332" y={44 + Number(values.targetOffset ?? 40)} width="160" height="88" rx="8" />
			<SchemaDependency
				dependency={{
					id: 'user.organization--organization.id',
					sourceTable: 'user',
					sourceField: 'organization_id',
					targetTable: 'organization',
					targetField: 'id',
					label: 'User.organization_id -> Organization.id'
				}}
				x1={188}
				y1={88}
				x2={332}
				y2={88 + Number(values.targetOffset ?? 40)}
				active={Boolean(values.active)}
			/>
			<text x="44" y="94">User</text>
			<text x="348" y={94 + Number(values.targetOffset ?? 40)}>Organization</text>
		</svg>
	{/snippet}
</Story>

<style>
	.schema-dependency-story {
		width: min(100%, 620px);
		height: 220px;
		border: 1px solid rgba(22, 31, 44, 0.12);
		border-radius: 0.5rem;
		background: #eef3f8;
	}

	.schema-dependency-story rect {
		fill: #ffffff;
		stroke: rgba(22, 31, 44, 0.16);
	}

	.schema-dependency-story text {
		fill: #263244;
		font-size: 14px;
		font-weight: 700;
	}
</style>
