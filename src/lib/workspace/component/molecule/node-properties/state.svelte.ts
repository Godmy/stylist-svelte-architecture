import type { RecipeNodeProperties as NodePropertiesProps } from '$stylist/workspace/interface/recipe/node-properties';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import { ObjectManagerNodeProperties } from '$stylist/workspace/class/manager/node-properties';

export function createNodePropertiesState(getProps: () => NodePropertiesProps) {
	const props = $derived(getProps());
	const size = $derived((props.size ?? 'md') as TokenSize);
	const compact = $derived(props.compact ?? false);
	const showHeader = $derived(props.showHeader ?? true);
	const showClose = $derived(props.showClose ?? true);
	const editable = $derived(props.editable ?? true);
	const groupByType = $derived(props.groupByType ?? false);
	const hasProperties = $derived((props.properties?.length ?? 0) > 0);
	const restProps = $derived(ObjectManagerNodeProperties.getRestProps(props));
	const propertyGroups = $derived(
		ObjectManagerNodeProperties.getPropertyGroups(props.properties ?? [])
	);

	const classes = $derived(
		`node-properties node-properties--size-${size}${compact ? ' node-properties--compact' : ''}${showHeader ? ' node-properties--with-header' : ''}`
	);

	function handlePropertyChange(propertyId: string, value: unknown) {
		props.onPropertyChange?.(propertyId, value);
	}

	function handleCloseClick(event: MouseEvent) {
		props.onclose?.(event as never);
	}

	return {
		get size() {
			return size;
		},
		get compact() {
			return compact;
		},
		get showHeader() {
			return showHeader;
		},
		get showClose() {
			return showClose;
		},
		get editable() {
			return editable;
		},
		get groupByType() {
			return groupByType;
		},
		get hasProperties() {
			return hasProperties;
		},
		get restProps() {
			return restProps;
		},
		get propertyGroups() {
			return propertyGroups;
		},
		get classes() {
			return classes;
		},
		handlePropertyChange,
		handleCloseClick
	};
}

export default createNodePropertiesState;
