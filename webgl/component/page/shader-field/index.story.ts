import ShaderField from '$stylist/webgl/component/page/shader-field/index.svelte';
import type { RecipeShaderField } from '$stylist/webgl/interface/recipe/shader-field';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Shader study page with speed and color controls; falls back to a static backdrop without WebGL2. */
export default {
	component: ShaderField,
	title: 'ShaderField',
	description: 'Interference field shader with its control panel.',
	args: { title: 'Световое поле' },
	controls: { title: { type: 'text' } },
	layout: 'padded'
} satisfies ContractStory<RecipeShaderField>;
