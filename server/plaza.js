import {randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {plazaWalkable} from '../src/data.js';

const lobbyLimit=80;
const expiryMs=10_000;
const directions=new Set(['up','down','left','right']);
const allowedOrigins=new Set([
  'https://gustavobarretolima.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

async function readPayload(request) {
  const chunks=[];
  let size=0;
  for await(const chunk of request) {
    size+=chunk.length;
    if(size>768) return null;
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { return null; }
}

export function createPlazaServer({now=Date.now}={}) {
  const players=new Map();

  return createServer(async (request,response)=>{
    function send(status, data) {
      response.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'});
      response.end(data===undefined ? undefined : JSON.stringify(data));
    }
    if(request.url==='/healthz' && request.method==='GET') return send(200,{ok:true});
    if(request.url!=='/plaza/session' || request.method!=='POST') return send(404);
    const origin=request.headers.origin;
    if(origin && !allowedOrigins.has(origin)) return send(403);
    if(origin) response.setHeader('Access-Control-Allow-Origin',origin);

    try {
      const body=await readPayload(request);
      if(!body || typeof body!=='object') return send(400);
      const time=now();
      for(const [token,player] of players) if(time-player.seen>expiryMs) players.delete(token);
      let {token}=body;
      let player=players.get(token);
      if(body.leave===true) {
        if(player) players.delete(token);
        return send(204);
      }
      if(token!==undefined && !player) return send(410);
      if(!Number.isFinite(body.x)||!Number.isFinite(body.y)||!plazaWalkable(body.x,body.y)) return send(400);

      const joining=!player;
      if(joining) {
        if(players.size>=lobbyLimit) return send(503);
        const used=new Set([...players.values()].map(value=>value.seat));
        let seat=1;
        while(used.has(seat)) seat++;
        token=randomUUID();
        player={id:randomUUID(),seat,name:'Vigia '+String(seat).padStart(2,'0'),seen:time};
        players.set(token,player);
      }
      if(!joining && time-player.seen<100) return send(429);

      player.seen=time;
      player.x=Math.round(body.x);
      player.y=Math.round(body.y);
      player.direction=directions.has(body.direction)?body.direction:'down';
      player.form=Number.isInteger(body.form)&&body.form>=0&&body.form<=2?body.form:0;
      player.moving=body.moving===true;
      player.running=player.moving&&body.running===true;
      const others=[];
      for(const other of players.values()) {
        if (other===player) continue;
        const {id,name,x,y,direction,form,moving,running,seat}=other;
        others.push({id,name,x,y,direction,form,moving,running,seat});
      }
      send(200,{token:joining?token:undefined,self:player.name,others});
    } catch {
      if(!response.destroyed && !response.headersSent) send(400);
    }
  });
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const port=Number(process.env.PORT)||8787;
  createPlazaServer().listen(port,'0.0.0.0',()=>console.log('Praça Principal escutando na porta '+port));
}
