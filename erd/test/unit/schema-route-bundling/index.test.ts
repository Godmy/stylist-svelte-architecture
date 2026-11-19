import { describe, it, expect } from 'vitest';
import { bundleSchemaDependencyRoutes } from '$stylist/erd/function/transform/bundle-schema-dependency-routes';
import { serializeSchemaRoutePath } from '$stylist/erd/function/serialize/schema-route-path';
import type { SchemaDependencyRoute } from '$stylist/erd/type/object/schema-dependency-route';

describe('local gravity for ERD relations', () => {
	const route = (x: number, offset = 0): SchemaDependencyRoute => ({
		x1:0,y1:offset,x2:300,y2:200+offset,pathData:'',
		points:[{x:0,y:offset},{x,y:offset},{x,y:200+offset},{x:300,y:200+offset}]
	});
	it('pulls overlapping parallel sections into a common trunk, preserving endpoints and input data', () => {
		const input=new Map([['a',route(80)],['b',route(120,40)]]);
		const before=JSON.stringify([...input]);
		const bundled=bundleSchemaDependencyRoutes(input,[]);
		expect(Math.abs(bundled.get('a')!.points[1].x-bundled.get('b')!.points[1].x)).toBeLessThan(0.15);
		for (const [id,result] of bundled) {
			expect(result.points[0]).toEqual(input.get(id)!.points[0]);
			expect(result.points.at(-1)).toEqual(input.get(id)!.points.at(-1));
			expect(result.pathData).toContain(' Q ');
		}
		expect(JSON.stringify([...input])).toBe(before);
		expect(bundleSchemaDependencyRoutes(input,[])).toEqual(bundled);
	});
	it('attracts different horizontal and vertical portions of the same relation independently', () => {
		const a={...route(40),points:[{x:0,y:0},{x:40,y:0},{x:40,y:100},{x:240,y:100},{x:240,y:300},{x:300,y:300}]};
		const b={...route(60,40),points:[{x:0,y:40},{x:60,y:40},{x:60,y:140},{x:260,y:140},{x:260,y:340},{x:300,y:340}]};
		const bundled=bundleSchemaDependencyRoutes(new Map([['a',a],['b',b]]),[]);
		const first=bundled.get('a')!.points,second=bundled.get('b')!.points;
		expect(Math.abs(first[1].x-second[1].x)).toBeLessThan(1);
		expect(Math.abs(first[2].y-second[2].y)).toBeLessThan(1);
		expect(Math.abs(first[3].x-second[3].x)).toBeLessThan(1);
	});
	it('keeps an obstacle between lanes solid instead of letting attraction tunnel through it', () => {
		const input=new Map([['left',route(80)],['right',route(120,40)]]);
		const obstacle={tableId:'wall',x:96,y:80,width:8,height:100};
		const result=bundleSchemaDependencyRoutes(input,[obstacle]);
		expect(result.get('left')!.points[1].x).toBeLessThanOrEqual(88);
		expect(result.get('right')!.points[1].x).toBeGreaterThanOrEqual(112);
		expect(result.size).toBe(2);
	});
	it('does not attract distant lanes or move points with attraction disabled', () => {
		const input=new Map([['a',route(80)],['b',route(400,40)]]);
		const result=bundleSchemaDependencyRoutes(input,[]);
		for(const [id,entry] of result) expect(entry.points).toEqual(input.get(id)!.points);
		const near=new Map([['a',route(80)],['b',route(120,40)]]);
		for(const [id,entry] of bundleSchemaDependencyRoutes(near,[],0)) expect(entry.points).toEqual(near.get(id)!.points);
	});
	it('supports an adjustable global radius and strength plus a stronger local zone', () => {
		const input=new Map([['a',route(80)],['b',route(120,40)]]);
		const gap=(result: Map<string,SchemaDependencyRoute>)=>Math.abs(result.get('a')!.points[1].x-result.get('b')!.points[1].x);
		expect(gap(bundleSchemaDependencyRoutes(input,[],16))).toBe(40);
		expect(gap(bundleSchemaDependencyRoutes(input,[],112,0))).toBe(40);
		const weak=bundleSchemaDependencyRoutes(input,[],112,0.05);
		const local=bundleSchemaDependencyRoutes(input,[],112,0.05,[{id:'near',x:100,y:120,radius:180,strength:6}]);
		expect(gap(local)).toBeLessThan(gap(weak)/2);
		const distant=bundleSchemaDependencyRoutes(input,[],112,0.05,[{id:'far',x:1000,y:1000,radius:80,strength:6}]);
		expect(distant).toEqual(weak);
	});
	it('serializes empty, straight and short routes without changing their endpoints or producing invalid coordinates', () => {
		expect(serializeSchemaRoutePath([])).toBe('');
		expect(serializeSchemaRoutePath([{x:0,y:0},{x:10,y:0}])).toBe('M 0 0 L 10 0');
		const short=serializeSchemaRoutePath([{x:0,y:0},{x:2,y:0},{x:2,y:3},{x:5,y:3}]);
		expect(short).not.toMatch(/NaN|Infinity/);
		expect(short.startsWith('M 0 0')).toBe(true);
		expect(short.endsWith('L 5 3')).toBe(true);
	});
});
