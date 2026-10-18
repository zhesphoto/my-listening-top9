import {session} from '../../../lib/session';
export const dynamic='force-dynamic';
export async function GET(){const {data}=await session();return Response.json({spotify:{configured:!!process.env.SPOTIFY_CLIENT_ID,connected:!!data?.access}},{headers:{'Cache-Control':'no-store'}});}
