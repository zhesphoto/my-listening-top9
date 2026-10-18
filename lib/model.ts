export type Album = { id: string; name: string; artist: string; image?: string; url?: string; kind?: string; value: number };
export type Result = { service: string; source: string; accuracy: 'approximate' | 'exact-in-file' | 'partial'; period: string; method: string; unit: 'score' | 'events' | 'ms'; albums: Album[]; warnings: string[]; events?: number };
export type Stream = { ts: string; ms_played: number; spotify_track_uri: string | null; master_metadata_album_album_name: string | null; master_metadata_album_artist_name: string | null; master_metadata_track_name?: string | null; [key: string]: unknown };
export function approximate(tracks: any[], period: string): Result {
  const albums = new Map<string, Album>(); const seen = new Set<string>();
  tracks.forEach((track, rank) => {
    if (!track?.id || seen.has(track.id) || !track.album?.id) return;
    seen.add(track.id); const a = track.album;
    const old = albums.get(a.id);
    const value = tracks.length - rank;
    albums.set(a.id, { id:a.id, name:a.name, artist:a.artists?.map((x:any)=>x.name).join(', ') || 'Неизвестен', image:a.images?.[0]?.url, url:a.external_urls?.spotify, kind:a.album_type, value:(old?.value||0)+value });
  });
  return {service:'Spotify',source:`Spotify Web API · top ${tracks.length} tracks`,accuracy:'approximate',period,method:'Берём до 50 лучших треков. Трек на позиции r получает N − r + 1 баллов; складываем баллы по Spotify album ID. Это индекс предпочтения, а не число прослушиваний.',unit:'score',albums:sort([...albums.values()]),warnings:['Окна Spotify приблизительные, точные даты API не сообщает.','Публичный запуск требует разрешения Spotify: Developer Policy II.13 ограничивает производные метрики.']};
}
function sort(albums: Album[]) { return albums.sort((a,b)=>b.value-a.value || a.id.localeCompare(b.id)).slice(0,9); }
export function importSpotify(rows: unknown[], from: string, to: string, unit:'ms'|'events', complete:boolean): Result {
  const start=Date.parse(from+'T00:00:00Z'), end=Date.parse(to+'T00:00:00Z')+86400000;
  if (!Number.isFinite(start)||!Number.isFinite(end)||start>=end) throw Error('Проверьте даты периода.');
  const albums=new Map<string,Album>(), seen=new Set<string>(); let duplicates=0, excluded=0, events=0;
  const times:number[]=[];
  for (const raw of rows) {
    const e=raw as Stream;
    if (!e || typeof e.ts!=='string' || typeof e.ms_played!=='number' || !Number.isFinite(e.ms_played) || e.ms_played<0) {excluded++;continue;}
    const t=Date.parse(e.ts); if(!Number.isFinite(t)){excluded++;continue;} times.push(t);
    if(t<start||t>=end)continue;
    if(!e.spotify_track_uri?.startsWith('spotify:track:')||!e.master_metadata_album_album_name||!e.master_metadata_album_artist_name||e.ms_played===0){excluded++;continue;}
    // Canonical full record: identical rows across overlapping exports collapse, distinct devices survive.
    const fingerprint=JSON.stringify(Object.keys(e).sort().map(k=>[k,e[k]]));
    if(seen.has(fingerprint)){duplicates++;continue;}seen.add(fingerprint);events++;
    const name=e.master_metadata_album_album_name, artist=e.master_metadata_album_artist_name;
    // Export has no album ID. Exact literal pair only; do not strip edition suffixes.
    const id=JSON.stringify([artist,name]);const old=albums.get(id);
    albums.set(id,{id,name,artist,value:(old?.value||0)+(unit==='ms'?e.ms_played:1)});
  }
  const min=times.length?new Date(times.reduce((a,b)=>Math.min(a,b),Infinity)).toISOString():null;
  const max=times.length?new Date(times.reduce((a,b)=>Math.max(a,b),0)).toISOString():null;
  return {service:'Spotify',source:'Extended Streaming History · локальные JSON',accuracy:complete?'exact-in-file':'partial',period:`${from} — ${to} · UTC`,method:unit==='ms'?'Сумма фактического ms_played. События с нулевым временем исключены.':'Количество событий с ms_played > 0; это события, не подтверждённые полные прослушивания.',unit,albums:sort([...albums.values()]),events,warnings:[`Диапазон записей файлов: ${min||'нет'} — ${max||'нет'}. Границы записей не доказывают полноту.`,`Дубликатов: ${duplicates}; исключено некорректных, нулевых и немузыкальных записей: ${excluded}.`,'Экспорт не содержит album ID: группировка по точной паре «исполнитель альбома + название». Одноимённые переиздания неразличимы; точность гарантируется только для этих групп в загруженных файлах.',complete?'Вы подтвердили загрузку всех файлов периода; полнота истории независимо не проверена.':'Полнота не подтверждена: это рейтинг только загруженной части истории.','Обложек в экспорте нет. Плейсхолдеры не являются обложками альбомов.']};
}
