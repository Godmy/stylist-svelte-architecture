<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import NodeIcon from './index.svelte';
</script>

<Story title="NodeIcon">
	<div style="display: flex; gap: 20px; padding: 40px; background: #f5f5f5;">
		<NodeIcon icon="NS" size={32} accent="#3498db" />
		<NodeIcon icon="SG" size={40} accent="#e74c3c" />
		<NodeIcon icon="IN" size={48} accent="#2ecc71" />
		<NodeIcon icon="DL" size={56} accent="#f39c12" />
	</div>

	<div style="padding: 20px; font-family: monospace; font-size: 12px;">
		<p>Node Icon — цветной бейдж-монограмма для категорий узлов графа</p>
		<p>Размеры: 32, 40, 48, 56px</p>
	</div>
</Story>
