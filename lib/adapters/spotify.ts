import { session } from '../session';
export async function spotify(path:string){const {data:s}=await session();if(!s?.access)throw Error('Подключите Spotify.');
  if(Date.now()>=(s.expires||0)){
    const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',body:new URLSearchParams({grant_type:'refresh_token',refresh_token:s.refresh||'',client_id:process.env.SPOTIFY_CLIENT_ID||''}),cache:'no-store'});
    if(!r.ok)throw Error('Сессия истекла. Отключите и подключите Spotify снова.');const t=await r.json();s.access=t.access_token;s.refresh=t.refresh_token||s.refresh;s.expires=Date.now()+t.expires_in*1000;
  }
  const r=await fetch('https://api.spotify.com/v1/'+path,{headers:{Authorization:`Bearer ${s.access}`},cache:'no-store'});
  if(!r.ok)throw Error(r.status===429?`Spotify ограничил частоту. Повторите через ${r.headers.get('retry-after')||'несколько'} секунд.`:`Spotify HTTP ${r.status}. Проверьте Premium владельца, allowlist и доступ приложения.`);
  return r.json();
}
