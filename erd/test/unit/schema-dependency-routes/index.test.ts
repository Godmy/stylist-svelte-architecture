import { describe, it, expect } from 'vitest';
import { createSchemaDependencyRoutes } from '$stylist/erd/function/create/schema-dependency-routes';
import type { SchemaDocument } from '$stylist/erd/type/object/schema-document';
import type { SchemaTablePosition } from '$stylist/erd/type/object/schema-table-position';

describe('ERD obstacle routing', () => {
	const table = (id: string) => ({ id, name: id, fields: ['id','parent'].map(name => ({
		id: `${id}.${name}`,name,type:'TEXT',primary:name==='id',required:true,unique:false,notes:[]
	})) });
	const edge = (source: string, target: string, id = `${source}-${target}`) => ({
		id,sourceTable:source,targetTable:target,sourceField:'parent',targetField:'id',label:id
	});
	const card = (tableId: string,x: number,y: number,width=160,height=130) => ({tableId,x,y,width,height});
	const assertClear = (document: SchemaDocument, positions: SchemaTablePosition[], reserved: SchemaTablePosition[] = []) => {
		const routes = createSchemaDependencyRoutes(document,positions,40,30,18,reserved);
		expect(routes.size).toBe(document.dependencies.length);
		for (const dependency of document.dependencies) {
			const route=routes.get(dependency.id)!;
			const source=positions.find(position=>position.tableId===dependency.sourceTable)!;
			const target=positions.find(position=>position.tableId===dependency.targetTable)!;
			expect(route.x1).toBe(source.x+source.width);
			expect(route.x2).toBe(target.x);
			expect(route.points[1].x).toBeGreaterThan(route.points[0].x);
			expect(route.points.at(-2)!.x).toBeLessThan(route.points.at(-1)!.x);
		}
		for (const route of routes.values()) for (let i=1;i<route.points.length;i++) {
			const a=route.points[i-1],b=route.points[i];
			expect(a.x===b.x||a.y===b.y).toBe(true);
			for (const box of [...positions,...reserved]) {
				const inside = a.x===b.x
					? a.x>box.x+0.01 && a.x<box.x+box.width-0.01 && Math.max(a.y,b.y)>box.y+0.01 && Math.min(a.y,b.y)<box.y+box.height-0.01
					: a.y>box.y+0.01 && a.y<box.y+box.height-0.01 && Math.max(a.x,b.x)>box.x+0.01 && Math.min(a.x,b.x)<box.x+box.width-0.01;
				expect(inside,`path crosses ${box.tableId}`).toBe(false);
			}
		}
		return routes;
	};
	it('goes around intervening cards and routes right-to-left and self relations', () => {
		const document={tables:['a','b','blocker'].map(table),dependencies:[edge('a','b'),edge('b','a'),edge('a','a')]};
		assertClear(document,[card('a',60,60),card('blocker',300,40,180,220),card('b',600,70)],
			[card('cluster-label',240,-40,260,60)]);
	});
	it('handles narrow corridors, tall uneven cards and multiple relations without dropping any', () => {
		const document={tables:['a','b','c','d'].map(table),dependencies:[edge('a','b'),edge('b','c'),edge('a','d'),edge('d','c'),edge('c','a')]};
		const positions=[card('a',60,60,160,480),card('b',290,60),card('c',520,60,160,350),card('d',290,300)];
		const first=assertClear(document,positions);
		expect(createSchemaDependencyRoutes(document,positions,40,30)).toEqual(first);
		assertClear(document,positions.map(p=>p.tableId==='b'?{...p,y:620}:p));
	});
	it('omits unresolved references and handles an empty document', () => {
		expect(createSchemaDependencyRoutes({tables:[],dependencies:[]},[],40,30).size).toBe(0);
		expect(createSchemaDependencyRoutes({tables:[table('a')],dependencies:[edge('a','missing')]},[card('a',60,60)],40,30).size).toBe(0);
	});
	it('merges references to the same field into a fixed shared approach at every gravity strength', () => {
		const document={tables:['catalog','portfolio_tasks','portfolio_deployments'].map(table),dependencies:[
			edge('portfolio_tasks','catalog'),edge('portfolio_deployments','catalog')
		]};
		const positions=[card('catalog',60,60,160,400),card('portfolio_tasks',420,80),card('portfolio_deployments',720,500)];
		assertClear(document,positions);
		for (const strength of [0,1,8]) {
			const routes=createSchemaDependencyRoutes(document,positions,40,30,18,[],{
				radius:240,strength,zones:[{id:'boost',x:150,y:350,radius:400,strength:6}]
			});
			expect(routes.size).toBe(2);
			const a=routes.get('portfolio_tasks-catalog')!,b=routes.get('portfolio_deployments-catalog')!;
			expect(a.lockedTailPoints).toBe(3);
			expect(a.points.slice(-3)).toEqual(b.points.slice(-3));
			const [join,corner,end]=a.points.slice(-3);
			expect(join.x).toBe(corner.x);
			expect(Math.abs(join.y-corner.y)).toBeGreaterThanOrEqual(40);
			expect(corner.y).toBe(end.y);
			expect(corner.x).toBeLessThan(end.x);
		}
	});
	it('keeps every relation clear in a larger schema', () => {
		const names=Array.from({length:96},(_,i)=>`table_${i}`);
		const document={tables:names.map(table),dependencies:names.map((name,i)=>edge(name,names[(i*17+7)%names.length]))};
		assertClear(document,names.map((name,i)=>card(name,60+(i%8)*300,60+Math.floor(i/8)*220)));
	});
});
