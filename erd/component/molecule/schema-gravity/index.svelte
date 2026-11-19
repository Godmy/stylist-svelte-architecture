<script lang="ts">
	import type { RecipeSchemaGravity } from '$stylist/erd/interface/recipe/schema-gravity';
	import { ERD_SCHEMA_GRAVITY_MESSAGE } from '$stylist/erd/const/record/schema-gravity-message';
	import { useMessage } from '$stylist/localization/function/hook/use-message';
	let props: RecipeSchemaGravity = $props();
	const t = useMessage('schema-gravity',ERD_SCHEMA_GRAVITY_MESSAGE);
</script>

<details class="schema-gravity" ontoggle={(event)=>props.onToggle(event.currentTarget.open)}>
	<summary>{t('title')}{#if props.zones.length} · {props.zones.length}{/if}</summary>
	<div class="schema-gravity__body">
		<label>{t('radius')} <span>{props.radius} {t('px')}</span>
			<input aria-label={t('radius')} type="range" min="0" max="512" step="8" value={props.radius} oninput={(e)=>props.onRadiusChange(Number(e.currentTarget.value))} />
			<input aria-label={`${t('radius')} (${t('px')})`} type="number" min="0" step="8" value={props.radius} oninput={(e)=>props.onRadiusChange(Number(e.currentTarget.value))} />
		</label>
		<label>{t('strength')} <span>{Math.round(props.strength*100)}%</span>
			<input aria-label={t('strength')} type="range" min="0" max="300" step="10" value={props.strength*100} oninput={(e)=>props.onStrengthChange(Number(e.currentTarget.value)/100)} />
		</label>
		<div class="schema-gravity__heading">{t('zones')}</div>
		<button type="button" onclick={props.onAdd}>{t('add')}</button>
		<p>{t('hint')}</p>
		<div class="schema-gravity__zones">
			{#each props.zones as zone,i (zone.id)}
				<button type="button" aria-pressed={props.selectedId===zone.id} onclick={()=>props.onSelect(zone.id)}>{t('zone')} {i+1}</button>
			{/each}
		</div>
		{#each props.zones.filter(zone=>zone.id===props.selectedId) as zone (zone.id)}
			<label>{t('area')} <span>{zone.radius} {t('px')}</span>
				<input aria-label={t('area')} type="range" min="40" max="600" step="10" value={zone.radius} oninput={(e)=>props.onUpdate(zone.id,{radius:Number(e.currentTarget.value)})} />
			</label>
			<label>{t('boost')} <span>+{Math.round(zone.strength*100)}%</span>
				<input aria-label={t('boost')} type="range" min="0" max="800" step="25" value={zone.strength*100} oninput={(e)=>props.onUpdate(zone.id,{strength:Number(e.currentTarget.value)/100})} />
			</label>
			<button type="button" onclick={()=>props.onRemove(zone.id)}>{t('remove')}</button>
		{/each}
		<button class="schema-gravity__reset" type="button" onclick={props.onReset}>{t('reset')}</button>
	</div>
</details>

<style>
	.schema-gravity { position:absolute;right:12px;top:10px;width:270px;max-width:calc(100vw - 32px);pointer-events:auto;color:var(--color-text-primary,#e2e8f0);background:var(--color-bg-primary,#09182e);border:1px solid var(--color-border,#29415e);border-radius:10px;box-shadow:0 8px 28px #0003;font-size:12px; }
	summary {padding:9px 12px;cursor:pointer;font-weight:600;}
	.schema-gravity:not([open]) {width:max-content;}
	.schema-gravity__body {padding:4px 12px 12px;display:grid;gap:10px;max-height:calc(100vh - 180px);overflow:auto;}
	label {display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;}
	label span {font-variant-numeric:tabular-nums;opacity:.75;}
	input[type='range'] {width:100%;accent-color:#d89444;}
	input[type='number'] {width:100%;background:transparent;color:inherit;border:1px solid var(--color-border,#29415e);border-radius:5px;padding:4px 7px;}
	button {border:1px solid var(--color-border,#29415e);background:transparent;color:inherit;border-radius:5px;padding:6px 9px;cursor:pointer;}
	button[aria-pressed='true'] {border-color:#d89444;background:#d8944420;}
	.schema-gravity__heading {font-weight:600;margin-top:4px;}
	.schema-gravity__zones {display:flex;gap:5px;flex-wrap:wrap;}
	.schema-gravity__reset {opacity:.7;}
	p {margin:0;opacity:.65;line-height:1.5;}
</style>
