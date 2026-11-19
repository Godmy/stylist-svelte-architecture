import SchemaGravity from '$stylist/erd/component/molecule/schema-gravity/index.svelte';
import type { RecipeSchemaGravity } from '$stylist/erd/interface/recipe/schema-gravity';
import type { ContractStory } from '$stylist/html/interface/contract/story';

export default {
	component:SchemaGravity,title:'Gravity controls',description:'Global attraction radius and strength with an editable local boost zone.',
	args:{radius:112,strength:1,zones:[{id:'demo',x:200,y:200,radius:180,strength:2}],selectedId:'demo',
		onRadiusChange:()=>{},onStrengthChange:()=>{},onAdd:()=>{},onSelect:()=>{},onUpdate:()=>{},onRemove:()=>{},onToggle:()=>{},onReset:()=>{}}
} satisfies ContractStory<RecipeSchemaGravity>;
