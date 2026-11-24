import type { RecipeHtmlSection } from '$stylist/html/interface/recipe/section';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';

/** Shader study page: the interference field with speed and color controls. */
export interface RecipeShaderField extends ComputeIntersectAll<
	[
		Omit<RecipeHtmlSection, 'children' | 'title'>,
		{
			title?: string;
		}
	]
> {}
