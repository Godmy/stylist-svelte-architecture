import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import View from '$stylist/erd/component/organism/schema-view/index.svelte';
import type { SchemaDocument } from '$stylist/erd/type/object/schema-document';

const document: SchemaDocument = {tables:['a','b'].map(id=>({id,name:id,fields:[{
	id:`${id}.id`,name:'id',type:'TEXT',required:true,primary:true,unique:true,notes:[]
}]})),dependencies:[{id:'ab',sourceTable:'a',sourceField:'id',targetTable:'b',targetField:'id',label:'a -> b'}]};
beforeEach(()=>{
	localStorage.clear();let next=0;
	vi.stubGlobal('ResizeObserver',class {observe(){} disconnect(){}});
	vi.stubGlobal('PointerEvent',MouseEvent);
	vi.stubGlobal('crypto',{randomUUID:()=>`zone-${++next}`});
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});

async function open(view: ReturnType<typeof render>) {
	const panel=view.container.querySelector<HTMLDetailsElement>('.schema-gravity')!;
	panel.open=true;await fireEvent(panel,new Event('toggle'));
}

test('global controls and local zones persist through remount and reset to defaults',async()=>{
	let view=render(View,{document});await open(view);
	await fireEvent.input(view.getByRole('spinbutton'),{target:{value:'240'}});
	await fireEvent.input(view.getByRole('slider',{name:'Attraction strength'}),{target:{value:'175'}});
	await fireEvent.click(view.getByRole('button',{name:'Add boost here'}));
	await fireEvent.input(view.getByRole('slider',{name:'Zone radius'}),{target:{value:'260'}});
	await fireEvent.input(view.getByRole('slider',{name:'Extra attraction'}),{target:{value:'450'}});
	expect(view.container.querySelectorAll('[data-gravity-zone]').length).toBe(1);
	view.unmount();
	view=render(View,{document});await open(view);
	expect((view.getByRole('spinbutton') as HTMLInputElement).value).toBe('240');
	expect((view.getByRole('slider',{name:'Attraction strength'}) as HTMLInputElement).value).toBe('175');
	expect((view.getByRole('slider',{name:'Extra attraction'}) as HTMLInputElement).value).toBe('450');
	expect(view.container.querySelectorAll('[data-gravity-zone]').length).toBe(1);
	await fireEvent.click(view.getByRole('button',{name:'Reset gravity'}));
	expect((view.getByRole('spinbutton') as HTMLInputElement).value).toBe('112');
	expect(view.container.querySelectorAll('[data-gravity-zone]').length).toBe(0);
});

test('multiple local zones can be selected, edited independently and deleted',async()=>{
	const view=render(View,{document});await open(view);
	await fireEvent.click(view.getByRole('button',{name:'Add boost here'}));
	await fireEvent.click(view.getByRole('button',{name:'Add boost here'}));
	await fireEvent.input(view.getByRole('slider',{name:'Zone radius'}),{target:{value:'350'}});
	await fireEvent.click(view.getByRole('button',{name:'Zone 1',exact:true}));
	expect((view.getByRole('slider',{name:'Zone radius'}) as HTMLInputElement).value).toBe('180');
	await fireEvent.click(view.getByRole('button',{name:'Delete zone'}));
	expect((view.getByRole('slider',{name:'Zone radius'}) as HTMLInputElement).value).toBe('350');
	expect(view.container.querySelectorAll('[data-gravity-zone]').length).toBe(1);
	await fireEvent.click(view.getByRole('button',{name:'Delete zone'}));
	expect(view.container.querySelectorAll('[data-gravity-zone]').length).toBe(0);
});

test('moving over the gravity controls does not highlight a cluster underneath the panel',async()=>{
	const view=render(View,{document,layout:'clusters',tableGroups:{a:'alpha',b:'beta'}});
	const viewport=view.container.querySelector('.schema-view')!;
	await open(view);
	await fireEvent.pointerMove(viewport,{clientX:100,clientY:100,buttons:0});
	// Cluster hover is provided separately; the controls must never activate it.
	await fireEvent.pointerMove(view.getByRole('spinbutton'),{clientX:100,clientY:100,buttons:0});
	expect(view.container.querySelector('.schema-view__cluster-panel--hovered')).toBeNull();
});
