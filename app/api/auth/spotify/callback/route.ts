import {session,appUrl} from '../../../../../lib/session';
export async function GET(req:Request){const p=new URL(req.url).searchParams;const {data:s}=await session();
 if(!s?.state||p.get('state')!==s.state||Date.now()-(s.oauthAt||0)>600000)return Response.redirect(appUrl()+'/?error=oauth_state');
 delete s.state;const verifier=s.verifier;delete s.verifier;
 if(p.has('error')||!p.get('code'))return Response.redirect(appUrl()+'/?error=oauth_denied');
 try{const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',body:new URLSearchParams({grant_type:'authorization_code',code:p.get('code')!,redirect_uri:appUrl()+'/api/auth/spotify/callback',client_id:process.env.SPOTIFY_CLIENT_ID||'',code_verifier:verifier!}),cache:'no-store'});
 if(!r.ok)throw Error();const t=await r.json();s.access=t.access_token;s.refresh=t.refresh_token;s.expires=Date.now()+t.expires_in*1000;return Response.redirect(appUrl()+'/?connected=spotify');
 }catch{return Response.redirect(appUrl()+'/?error=oauth_exchange');}
}
