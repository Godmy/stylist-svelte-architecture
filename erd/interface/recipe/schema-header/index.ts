import type { SlotSchemaHeader } from '$stylist/erd/interface/slot/schema-header';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';

export interface RecipeSchemaHeader extends ComputeIntersectAll<[SlotSchemaHeader]> {}
