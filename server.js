// LinguaTrail sunucusu - bağımlılık yok, sadece Node.js (v16+) gerekir.
// Oyunu servis eder, odaları (QR/kod eşleşmesi) yönetir, canlı olayları iletir ve ortak sıralamayı tutar.
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const PORT=+process.env.PORT||3000,PUB=path.join(__dirname,'public'),DB=path.join(__dirname,'data.json');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json'};
const TOPICS=new Set(['hello','hi','lvl','start','throw','ans','cls','pair','res']),HOST_ONLY=new Set(['hi','lvl','start','cls','pair']);
const clean=s=>String(s||'').replace(/[^\p{L}\p{N} _.-]/gu,'').trim().slice(0,12);
const rc=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8);
const rooms=new Map();let db={players:{}},dirty=false;
try{db=JSON.parse(fs.readFileSync(DB,'utf8'));db.players=db.players||{}}catch(e){}
setInterval(()=>{if(dirty){dirty=false;fs.writeFile(DB,JSON.stringify(db),()=>{})}},4000);
setInterval(()=>{rooms.forEach(r=>r.clients.forEach(c=>{try{c.res&&c.res.write(': ping\n\n')}catch(e){}}))},15000);
function lan(){const sc=ip=>ip.startsWith('192.168.')?3:ip.startsWith('10.')?2:ip.startsWith('172.')?1:0,o=[];
 for(const l of Object.values(os.networkInterfaces()))for(const a of l||[])if(a.family==='IPv4'&&!a.internal)o.push(a.address);
 return o.sort((a,b)=>sc(b)-sc(a)).map(ip=>`http://${ip}:${PORT}`)}
const send=(res,ev,data,id)=>{try{res.write((id!=null?`id: ${id}\n`:'')+`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`)}catch(e){}};
const hostOf=r=>r.clients.keys().next().value;
const vis=(r,m,id)=>!m.to||m.to===id||(m.to==='host'&&hostOf(r)===id);
function bc(r,from,ev,data,to){const seq=++r.seq;if(ev==='msg'){r.log.push({seq,from,ev,data,to});if(r.log.length>800)r.log.shift()}
 const hid=hostOf(r);r.clients.forEach((c,id)=>{if(id===from||!c.res)return;if(to&&(to==='host'?id!==hid:id!==to))return;send(c.res,ev,data,seq)})}
function drop(code,id){const r=rooms.get(code);if(!r||!r.clients.has(id))return;const c=r.clients.get(id);clearTimeout(c.timer);try{c.res&&c.res.end()}catch(e){}
 r.clients.delete(id);bc(r,id,'peer',{k:'left',n:r.clients.size,id},r.cap>2?'host':undefined);if(!r.clients.size)rooms.delete(code)}
const body=req=>new Promise(ok=>{let b='';req.on('data',c=>{b+=c;if(b.length>8000)req.destroy()});req.on('end',()=>{try{ok(JSON.parse(b||'{}'))}catch(e){ok({})}});req.on('error',()=>ok({}))});
const json=(res,code,o)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(o))};
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://x'),q=Object.fromEntries(u.searchParams),p=u.pathname;
 try{
 if(p==='/api/info')return json(res,200,{urls:lan(),port:PORT,rooms:rooms.size});
 if(p==='/api/check'){const r=rooms.get(rc(q.room));return json(res,200,{exists:!!r,count:r?r.clients.size:0,cap:r?r.cap:2})}
 if(p==='/api/stream'){const code=rc(q.room),id=clean(q.id);if(!code||!id){res.writeHead(400);return res.end()}
  let r=rooms.get(code);if(!r){r={clients:new Map(),log:[],seq:0,cap:Math.min(60,Math.max(2,+q.cap||2))};rooms.set(code,r)}
  let c=r.clients.get(id);if(!c&&r.clients.size>=r.cap){res.writeHead(409);return res.end('full')}
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
  req.socket.setNoDelay(true);const re=!!c;
  if(c){clearTimeout(c.timer);try{c.res&&c.res!==res&&c.res.end()}catch(e){}}else{c={};r.clients.set(id,c)}
  c.res=res;res.write('retry: 1500\n\n');send(res,'ready',{n:r.clients.size});
  const last=+req.headers['last-event-id']||0;if(re&&last)r.log.filter(m=>m.seq>last&&m.from!==id&&vis(r,m,id)).forEach(m=>send(res,m.ev,m.data,m.seq));
  if(!re)bc(r,id,'peer',{k:'joined',n:r.clients.size,id},r.cap>2?'host':undefined);
  req.on('close',()=>{if(c.res!==res)return;c.res=null;c.timer=setTimeout(()=>drop(code,id),r.cap>2?(id===hostOf(r)?90000:20000):8000)});return}
 if(p==='/api/emit'&&req.method==='POST'){const b=await body(req),r=rooms.get(rc(b.room)),id=clean(b.id);
  if(!r||!r.clients.has(id))return json(res,404,{ok:false});if(!TOPICS.has(b.t))return json(res,400,{ok:false});
  if(HOST_ONLY.has(b.t)&&r.clients.keys().next().value!==id)return json(res,403,{ok:false});
  const to=b.to==='host'?'host':(b.to?clean(b.to):undefined);bc(r,id,'msg',{t:b.t,d:b.d,from:id},to);return json(res,200,{ok:true})}
 if(p==='/api/leave'&&req.method==='POST'){const b=await body(req);drop(rc(b.room),clean(b.id));return json(res,200,{ok:true})}
 if(p==='/api/score'&&req.method==='POST'){const b=await body(req),n=clean(b.name);if(!n)return json(res,400,{ok:false});
  if(!db.players[n]&&Object.keys(db.players).length>3000)return json(res,429,{ok:false});
  const s=Math.max(0,Math.min(2000,+b.score||0)),pl=db.players[n]||(db.players[n]={wins:0,games:0,pts:0,best:0});
  pl.games++;pl.pts+=s;if(b.win)pl.wins++;if(s>pl.best)pl.best=s;dirty=true;return json(res,200,{ok:true})}
 if(p==='/api/leaderboard')return json(res,200,Object.entries(db.players).map(([name,v])=>({name,wins:v.wins,pts:v.pts})).sort((a,b)=>b.pts-a.pts).slice(0,20));
 if(p.startsWith('/api/'))return json(res,404,{ok:false});
 if(p==='/favicon.ico'){res.writeHead(204);return res.end()}
 if(p==='/health'){res.writeHead(200);return res.end('ok')}
 const rel=path.normalize(p==='/'?'/index.html':p),ext=path.extname(rel),cands=[path.join(PUB,rel)];
 if(ext===''||ext==='.html')cands.push(path.join(PUB,'index.html'),path.join(__dirname,'index.html'));
 const tryNext=i=>{if(i>=cands.length){res.writeHead(404);return res.end('404')}const f=cands[i];if(!f.startsWith(__dirname))return tryNext(i+1);
  fs.readFile(f,(e,d)=>{if(e)return tryNext(i+1);res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(d)})};
 return tryNext(0);
 }catch(e){try{res.writeHead(500);res.end()}catch(_){}}
}).listen(PORT,'0.0.0.0',()=>{console.log('\nLinguaTrail sunucusu çalışıyor\n  Bu bilgisayar : http://localhost:'+PORT);lan().forEach(u=>console.log('  Telefon/ağ    : '+u));console.log('\nTelefonlar aynı Wi-Fi ağında olmalı. Durdurmak için Ctrl+C.\n')});
