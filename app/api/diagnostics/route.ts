import {spotify} from '../../../lib/adapters/spotify';
export const dynamic='force-dynamic';
export async function GET(){const checks=[];for(const path of ['me','me/top/tracks?limit=1&time_range=short_term','me/player/recently-played?limit=1']){try{const d=await spotify(path);checks.push({endpoint:path,ok:true,items:d.items?.length});}catch(e){checks.push({endpoint:path,ok:false,error:e instanceof Error?e.message:'Ошибка'});}}return Response.json({checkedAt:new Date().toISOString(),checks},{headers:{'Cache-Control':'no-store'}});}
