export interface GraphJsonInput {
	dependencies: Record<string, string[]>;
	/** Human-readable node names by path, shown instead of the path's last segment. */
	labels?: Record<string, string>;
}
