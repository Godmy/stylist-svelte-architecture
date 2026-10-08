import type { PresenterSceneLink } from '$stylist/presentation/type/object/presenter-scene-link';
import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';

export function resolvePresenterSceneLinks(nodes: readonly SceneNode[]): PresenterSceneLink[] {
	const links: PresenterSceneLink[] = [];

	for (const node of nodes) {
		for (const child of node.children ?? []) {
			const target = nodes.find((candidate) => candidate.id === child.id);

			if (!target) continue;

			links.push({
				id: `${node.id}->${target.id}`,
				from: node,
				to: target
			});
		}
	}

	return links;
}
