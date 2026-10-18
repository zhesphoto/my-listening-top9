import type {Result} from './model';
export const themes={ink:{bg:'#131b25',fg:'#f4eee5',accent:'#c6ed92'},cream:{bg:'#f4eee5',fg:'#202a31',accent:'#697940'},plum:{bg:'#352339',fg:'#fff0e4',accent:'#edb9aa'}};
export async function downloadCard(result:Result,theme:keyof typeof themes,stories:boolean){
 const c=document.createElement('canvas');c.width=1080;c.height=stories?1920:1080;const ctx=c.getContext('2d')!;const t=themes[theme];
 ctx.fillStyle=t.bg;ctx.fillRect(0,0,c.width,c.height);const y=stories?390:50;
 ctx.fillStyle=t.accent;ctx.font='bold 22px Arial';ctx.fillText('MY LISTENING',60,y);ctx.fillStyle=t.fg;ctx.font='bold 66px Arial';ctx.fillText(`TOP ${result.albums.length}`,60,y+72);
 ctx.font='22px Arial';ctx.fillText(result.service+' · '+result.period,60,y+118,960);
 const size=stories?304:240,gap=24,top=y+160,left=(1080-3*size-2*gap)/2;
 for(let i=0;i<result.albums.length;i++){const a=result.albums[i],x=left+(i%3)*(size+gap),cy=top+Math.floor(i/3)*(size+gap),h=size;
   ctx.fillStyle='#ffffff12';ctx.fillRect(x,cy,size,h);
   let drawn=false;if(a.image){try{const img=new Image();img.src='/api/cover?url='+encodeURIComponent(a.image);await img.decode();ctx.drawImage(img,x,cy,h,h);drawn=true;}catch{}}
   if(!drawn){ctx.fillStyle=t.accent;ctx.font='48px Arial';ctx.fillText(String(i+1).padStart(2,'0'),x+20,cy+65);}
   ctx.fillStyle=t.bg;ctx.globalAlpha=.85;ctx.fillRect(x,cy+h-61,size,61);ctx.globalAlpha=1;ctx.fillStyle=t.fg;ctx.font='bold 17px Arial';ctx.fillText(a.name,x+10,cy+h-35,size-20);ctx.font='14px Arial';ctx.fillText(a.artist,x+10,cy+h-13,size-20);
 }
 ctx.fillStyle=t.accent;ctx.font='18px Arial';ctx.fillText(result.accuracy==='approximate'?'ПРИБЛИЗИТЕЛЬНО · ИНДЕКС ПРЕДПОЧТЕНИЯ':result.accuracy==='partial'?'ЧАСТИЧНАЯ ИСТОРИЯ':'ТОЧНО В ЗАГРУЖЕННЫХ ФАЙЛАХ',60,top+3*(size+gap)+20);
 ctx.fillStyle=t.fg;ctx.font='16px Arial';ctx.fillText(result.source,60,top+3*(size+gap)+52,960);
 const blob=await new Promise<Blob|null>(r=>c.toBlob(r,'image/png'));if(!blob)throw Error('Не удалось создать PNG');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`my-listening-top9-${stories?'stories':'square'}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
