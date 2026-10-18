import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
type Session={state?:string;verifier?:string;oauthAt?:number;access?:string;refresh?:string;expires?:number;at:number};
const g=globalThis as typeof globalThis & { top9Sessions?:Map<string,Session> };
const sessions=g.top9Sessions ||= new Map<string,Session>();
export async function session(create=false){const jar=await cookies();let id=jar.get('top9')?.value;let s=id?sessions.get(id):undefined;
  for(const [key,value]of sessions)if(Date.now()-value.at>86400000)sessions.delete(key);
  if(s&&Date.now()-s.at>86400000)s=undefined;
  if(!s&&create){id=randomBytes(32).toString('hex');s={at:Date.now()};sessions.set(id,s);jar.set('top9',id,{httpOnly:true,sameSite:'lax',secure:process.env.APP_URL?.startsWith('https:')||false,path:'/',maxAge:86400});}
  return {data:s,remove(){if(id)sessions.delete(id);jar.delete('top9');}};
}
export function appUrl(){return process.env.APP_URL||'http://127.0.0.1:3000';}
export function sameOrigin(req:Request){return req.headers.get('origin')===appUrl();}
