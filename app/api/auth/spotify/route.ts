import { randomBytes,createHash } from 'node:crypto';
import {session,appUrl} from '../../../../lib/session';
export async function GET(){if(!process.env.SPOTIFY_CLIENT_ID)return Response.redirect(appUrl()+'/?error=spotify_configuration');
 const {data:s}=await session(true);s!.state=randomBytes(32).toString('hex');s!.verifier=randomBytes(64).toString('base64url');s!.oauthAt=Date.now();
 const params=new URLSearchParams({client_id:process.env.SPOTIFY_CLIENT_ID,response_type:'code',redirect_uri:appUrl()+'/api/auth/spotify/callback',scope:'user-top-read user-read-recently-played',state:s!.state,code_challenge_method:'S256',code_challenge:createHash('sha256').update(s!.verifier).digest('base64url')});
 return Response.redirect('https://accounts.spotify.com/authorize?'+params);
}
