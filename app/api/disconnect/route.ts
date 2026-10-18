import {session,sameOrigin} from '../../../lib/session';
export async function POST(req:Request){if(!sameOrigin(req))return new Response(null,{status:403});const s=await session();s.remove();return Response.json({deleted:true});}
