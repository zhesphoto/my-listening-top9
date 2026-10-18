import {spotify} from '../../../lib/adapters/spotify';
import {approximate} from '../../../lib/model';
export const dynamic='force-dynamic';
const periods:Record<string,string>={short_term:'Около 4 недель',medium_term:'Около 6 месяцев',long_term:'Около 1 года'};
export async function GET(req:Request){const p=new URL(req.url).searchParams.get('period')||'medium_term';if(!periods[p])return Response.json({error:'Недоступный период'},{status:400});
 try{const data=await spotify(`me/top/tracks?limit=50&time_range=${p}`);return Response.json(approximate(data.items,periods[p]),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'Ошибка Spotify'},{status:400});}}
