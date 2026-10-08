<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import NodeProperty from './index.svelte';

	type Props = {
		type:
			| 'string'
			| 'number'
			| 'boolean'
			| 'enum'
			| 'color'
			| 'vector2'
			| 'vector3'
			| 'object'
			| 'function';
		size: 'xs' | 'sm' | 'md' | 'lg';
		editable: boolean;
		error: boolean;
	};

	const controls: SlotStory[] = [
		{
			name: 'type',
			type: 'select',
			defaultValue: 'string',
			options: [
				'string',
				'number',
				'boolean',
				'enum',
				'color',
				'vector2',
				'vector3',
				'object',
				'function'
			]
		},
		{ name: 'size', type: 'select', defaultValue: 'md', options: ['xs', 'sm', 'md', 'lg'] },
		{ name: 'editable', type: 'boolean', defaultValue: true },
		{ name: 'error', type: 'boolean', defaultValue: false }
	];
</script>

<Story
	{controls}
	component={NodeProperty}
	title="Node Property"
	category="Atoms/Interaction/Controls"
	description="Редактор свойства ноды для разных типов значений."
	tags={['node', 'property', 'control']}
>
	{#snippet children(values: any)}
		{@const typed = values as Props}
		<div
			style="background: #1e1e1e; padding: var(--spacing-5); border-radius: var(--border-radius-lg); max-width: 520px;"
		>
			<NodeProperty
				id="node-property-story"
				name="property"
				label="Property"
				type={typed.type}
				size={typed.size}
				editable={typed.editable}
				error={typed.error}
				errorMessage={typed.error ? 'This field is required' : undefined}
				value={typed.type === 'number'
					? 42
					: typed.type === 'boolean'
						? true
						: typed.type === 'enum'
							? 'Auto'
							: typed.type === 'color'
								? '#3b82f6'
								: typed.type === 'vector2'
									? [100, 200]
									: typed.type === 'vector3'
										? [1, 1, 1]
										: typed.type === 'object'
											? {}
											: typed.type === 'function'
												? null
												: 'My Node'}
				options={typed.type === 'enum' ? ['Auto', 'Manual', 'Disabled'] : undefined}
				min={typed.type === 'number' ? 0 : undefined}
				max={typed.type === 'number' ? 100 : undefined}
				step={typed.type === 'number' ? 1 : undefined}
				icon="settings"
			/>
		</div>
	{/snippet}

	{#snippet variants()}
		<div
			style="display: flex; flex-direction: column; gap: var(--spacing-3); background: #1e1e1e; padding: var(--spacing-5); border-radius: var(--border-radius-lg); max-width: 520px;"
		>
			<NodeProperty id="property-string" name="str" label="String" type="string" value="Hello" />
			<NodeProperty
				id="property-number"
				name="num"
				label="Number"
				type="number"
				value={42}
				min={0}
				max={100}
				step={1}
			/>
			<NodeProperty id="property-boolean" name="bool" label="Boolean" type="boolean" value={true} />
			<NodeProperty
				id="property-enum"
				name="enum"
				label="Enum"
				type="enum"
				value="Option 1"
				options={['Option 1', 'Option 2', 'Option 3']}
			/>
			<NodeProperty id="property-color" name="color" label="Color" type="color" value="#3b82f6" />
			<NodeProperty
				id="property-vector2"
				name="vec2"
				label="Vector2"
				type="vector2"
				value={[10, 20]}
			/>
			<NodeProperty
				id="property-vector3"
				name="vec3"
				label="Vector3"
				type="vector3"
				value={[1, 1, 1]}
			/>
			<NodeProperty id="property-object" name="obj" label="Object" type="object" value={{}} />
			<NodeProperty
				id="property-function"
				name="fn"
				label="Function"
				type="function"
				value={null}
			/>
		</div>
	{/snippet}
</Story>
