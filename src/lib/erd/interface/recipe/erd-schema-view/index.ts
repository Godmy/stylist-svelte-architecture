import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotErdSettings } from '$stylist/erd/interface/slot/erd-settings';
import type { SchemaDocument } from '$stylist/erd/type/object/schema-document';

export interface RecipeErdSchemaView
	extends ComputeIntersectAll<
		[
			SlotErdSettings,
			{
				document: SchemaDocument;
				activeTableId?: string;
			}
		]
	> {}
