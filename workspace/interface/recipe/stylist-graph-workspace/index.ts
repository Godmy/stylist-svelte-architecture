import type { GraphWorkspaceNode } from '$stylist/workspace/interface/slot/graph-workspace-node';
import type { GraphWorkspaceConnectionInput } from '$stylist/workspace/type/alias/graph-workspace-connection-input';
import type { GraphWorkspaceBounds } from '$stylist/workspace/interface/slot/graph-workspace-bounds';
export interface RecipeStylistGraphWorkspace {
	initialNodes?: readonly GraphWorkspaceNode[];
	initialConnections?: readonly GraphWorkspaceConnectionInput[];
	worldBounds?: GraphWorkspaceBounds;
}
