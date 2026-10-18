import {test} from 'node:test';
import assert from 'node:assert/strict';
import {approximate,importSpotify} from '../lib/model';
import {inspectTakeout} from '../lib/adapters/youtube';
const event=(name:string,ms:number,ts='2026-01-02T00:00:00Z',artist='Artist')=>({ts,ms_played:ms,spotify_track_uri:'spotify:track:one',master_metadata_album_album_name:name,master_metadata_album_artist_name:artist});
test('time, exact duplicates, boundaries, zero, podcasts and editions',()=>{
 const a=event('Record',60000);const result=importSpotify([a,{...a},event('Record',120000,'2026-01-03T00:00:00Z'),event('Record (Deluxe)',200000),event('Record',300000,'2026-02-01T00:00:00Z'),event('Zero',0),{...event('Podcast',200),spotify_track_uri:null},event('Record',50000,undefined,'Other')],'2026-01-01','2026-01-31','ms',true);
 assert.equal(result.albums.length,3);assert.equal(result.albums[0].name,'Record (Deluxe)');assert.equal(result.albums[1].value,180000);assert.equal(result.events,4);assert.equal(result.accuracy,'exact-in-file');
});
test('events count plays, not duration; period is inclusive in UTC',()=>{const r=importSpotify([event('A',1),event('A',2,'2026-01-31T23:59:59Z'),event('B',999999)],'2026-01-01','2026-01-31','events',false);assert.equal(r.albums[0].name,'A');assert.equal(r.albums[0].value,2);assert.equal(r.accuracy,'partial');});
test('approximate positional sum, album IDs prevent similar title merges',()=>{const track=(id:string,album:string)=>({id,album:{id:album,name:'Same',artists:[{name:'Artist'}]}});const r=approximate([track('a','1'),track('b','2'),track('c','1')],'~4 weeks');assert.equal(r.albums[0].id,'1');assert.equal(r.albums[0].value,4);assert.equal(r.albums[1].value,2);assert.equal(r.unit,'score');});
test('invalid dates rejected; no synthetic fillers',()=>{assert.throws(()=>importSpotify([],'bad','bad','ms',false));assert.deepEqual(importSpotify([],'2026-01-01','2026-01-31','ms',false).albums,[]);});
test('Takeout music needs explicit music hostname, never inferred album',()=>{const r=inspectTakeout([{time:'2026-01-01',titleUrl:'https://music.youtube.com/watch?v=a'},{time:'2026-01-02',titleUrl:'https://www.youtube.com/watch?v=b'},{time:'2026-01-03',titleUrl:'https://music.youtube.com.evil.test/watch?v=c'}]);assert.equal(r.music,1);assert.equal(r.other,1);assert.equal(r.unknown,1);});
