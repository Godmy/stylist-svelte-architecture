<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import { TOKEN_CONTROLLER_TYPE } from '$stylist/domain/const/map/controller-type';
	import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';
	import SceneInspector from './index.svelte';

	const sampleNode: SceneNode = {
		id: 'auth-service',
		title: 'Auth Service',
		label: 'Auth',
		description: 'Handles authentication, token issuance and session management.',
		iconText: 'A',
		position: { x: 320, y: 240 },
		depth: 480,
		accent: '#2563eb',
		children: [
			{
				id: 'jwt-handler',
				title: 'JWT Handler',
				position: { x: 420, y: 300 },
				depth: 300,
				accent: '#7c3aed'
			},
			{
				id: 'session-store',
				title: 'Session Store',
				position: { x: 280, y: 380 },
				depth: 200,
				accent: '#0f766e'
			}
		]
	};

	const controls = [
		{ name: 'hasLabel', type: TOKEN_CONTROLLER_TYPE.BOOLEAN, defaultValue: true },
		{ name: 'hasDescription', type: TOKEN_CONTROLLER_TYPE.BOOLEAN, defaultValue: true },
		{ name: 'hasChildren', type: TOKEN_CONTROLLER_TYPE.BOOLEAN, defaultValue: true },
		{
			name: 'depth',
			type: TOKEN_CONTROLLER_TYPE.RANGE,
			min: 0,
			max: 1000,
			step: 20,
			defaultValue: 480
		},
		{ name: 'showClose', type: TOKEN_CONTROLLER_TYPE.BOOLEAN, defaultValue: true }
	];
</script>

<Story
	{controls}
	title="SceneInspector"
	category="Molecules/Presentation"
	description="Inspector panel for a selected scene node. Shows label, description, depth, accent colour and children count."
	tags={['inspector', 'scene', 'node', 'panel']}
>
	{#snippet children(values: any)}
		<div
			style="padding: 2rem; display: flex; justify-content: center; background: var(--color-background-secondary, #f9fafb); min-height: 16rem; align-items: flex-start;"
		>
			<SceneInspector
				node={{
					...sampleNode,
					depth: values.depth as number,
					label: values.hasLabel ? sampleNode.label : undefined,
					description: values.hasDescription ? sampleNode.description : undefined,
					children: values.hasChildren ? sampleNode.children : undefined
				}}
				onclose={values.showClose ? () => console.log('inspector closed') : undefined}
			/>
		</div>
	{/snippet}
</Story>
