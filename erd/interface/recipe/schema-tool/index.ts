import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SchemaMode } from '$stylist/erd/type/alias/schema-mode';
import type { SlotErdSettings } from '$stylist/erd/interface/slot/erd-settings';

export interface RecipeSchemaTool extends ComputeIntersectAll<
	[
		SlotErdSettings,
		{
			canImport?: boolean;
			canExport?: boolean;
			mode?: SchemaMode;
		}
	]
> {}
