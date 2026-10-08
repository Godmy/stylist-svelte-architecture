import type { HTMLAttributes } from 'svelte/elements';
import type { SlotThemeBorder } from '$stylist/theme/interface/slot/theme-border';
import type { SlotTypography } from '$stylist/theme/interface/slot/typography';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
import type { RecipeNodeProperties as NodePropertiesProps } from '$stylist/workspace/interface/recipe/node-properties';

export class ObjectManagerNodeProperties {
	static getRestProps(props: NodePropertiesProps) {
		const {
			class: _class,
			id: _id,
			nodeId: _nodeId,
			title: _title,
			properties: _properties,
			size: _size,
			compact: _compact,
			showHeader: _showHeader,
			showClose: _showClose,
			editable: _editable,
			groupByType: _groupByType,
			onPropertyChange: _onPropertyChange,
			onclose: _onclose,
			children: _children,
			oncopy: _oncopy,
			oncut: _oncut,
			onpaste: _onpaste,
			...rest
		} = props;

		return rest as Omit<
			HTMLAttributes<HTMLElement> & SlotThemeBorder & SlotTypography,
			'class' | 'id' | 'oncopy' | 'oncut' | 'onpaste'
		>;
	}

	static getPropertyGroups(items: readonly SlotWorkspaceNode[]) {
		return Object.entries(
			items.reduce<Record<string, SlotWorkspaceNode[]>>((groups, property) => {
				const key = property.type ?? 'default';
				(groups[key] ??= []).push(property);
				return groups;
			}, {})
		);
	}
}
