export function inspectTakeout(rows: unknown[]) {
  let music=0, other=0, unknown=0;const dates:string[]=[];
  const seen=new Set<string>();let duplicates=0;
  for(const raw of rows){const r=raw as any;if(!r||typeof r.time!=='string'||!Number.isFinite(Date.parse(r.time))){unknown++;continue;}
    const key=JSON.stringify([r.time,r.titleUrl,r.title]);if(seen.has(key)){duplicates++;continue;}seen.add(key);dates.push(r.time);
    let host='';try{host=new URL(r.titleUrl).hostname;}catch{}
    if(host==='music.youtube.com')music++;else if(host==='www.youtube.com'||host==='youtube.com')other++;else unknown++;
  }
  dates.sort();return {music,other,unknown,duplicates,from:dates[0],to:dates.at(-1),message:'События music.youtube.com отделены по явному адресу. Обычные youtube.com могут тоже содержать музыку, но это не доказано. Takeout не даёт надёжного album ID или фактически прослушанного времени. Top 9 альбомов из этих записей не построен.'};
}
