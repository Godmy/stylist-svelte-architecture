import type { RecipeHtmlSection } from '$stylist/html/interface/recipe/section';
import type { SlotShaderField } from '$stylist/webgl/interface/slot/shader-field';

/** Shader study page: the interference field with speed and color controls. */
export interface RecipeShaderField extends Omit<RecipeHtmlSection, 'children' | 'title'>, SlotShaderField {}
