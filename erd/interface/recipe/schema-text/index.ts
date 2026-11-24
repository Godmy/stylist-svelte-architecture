import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';

export interface RecipeSchemaText extends ComputeIntersectAll<
	[
		{
			value?: string;
			placeholder?: string;
		}
	]
> {}
