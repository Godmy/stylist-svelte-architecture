<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import NodeConnection from './index.svelte';
</script>

<Story
	id="molecules-graph-node-connection"
	title="Molecules / Graph / Connection Line"
	component={NodeConnection}
	category="Molecules/Graph"
>
	{#snippet children()}
		<div style="height: 260px; position: relative; padding: 1rem;">
			<svg
				viewBox="0 0 480 220"
				width="480"
				height="220"
				style="overflow: visible; display: block;"
			>
				<!-- bezier -->
				<NodeConnection
					id="demo-bezier"
					startX={40}
					startY={60}
					endX={220}
					endY={60}
					type="bezier"
					color="var(--color-primary-500)"
					showArrow={true}
				/>

				<!-- straight -->
				<NodeConnection
					id="demo-straight"
					startX={40}
					startY={120}
					endX={220}
					endY={120}
					type="straight"
					color="var(--color-success-500)"
					showArrow={true}
				/>

				<!-- step -->
				<NodeConnection
					id="demo-step"
					startX={40}
					startY={180}
					endX={220}
					endY={180}
					type="step"
					color="var(--color-warning-500)"
					lineStyle="dashed"
					showArrow={false}
				/>

				<!-- active bezier с label -->
				<NodeConnection
					id="demo-active"
					startX={260}
					startY={60}
					endX={440}
					endY={160}
					type="bezier"
					color="var(--color-primary-500)"
					active={true}
					showArrow={true}
					label="active"
				/>
			</svg>
		</div>
	{/snippet}
</Story>
