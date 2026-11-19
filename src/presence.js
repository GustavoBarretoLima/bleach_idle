const productionUrl='https://bleach-idle-praca.onrender.com';
const configuredUrl=import.meta.env.VITE_PLAZA_URL;
const base=(configuredUrl || (import.meta.env.DEV ? 'http://localhost:8787' : productionUrl)).replace(/\/$/,'');
const endpoint=base+'/plaza/session';

export function createPresence() {
  let token, timer, controller, running=false, lastPlayers=[];
  let status='connecting', selfName, readPlayer;
  const delay = (ms, fn) => { timer=setTimeout(fn,ms); };

  function leave(sessionToken) {
    if(!sessionToken) return;
    fetch(endpoint,{method:'POST',body:JSON.stringify({token:sessionToken,leave:true}),keepalive:true}).catch(()=>{});
  }

  async function sync() {
    const request=new AbortController();
    controller=request;
    const timeout=setTimeout(()=>request.abort(),8000);
    try {
      const response=await fetch(endpoint,{
        method:'POST',body:JSON.stringify({token,...readPlayer()}),signal:request.signal
      });
      if (response.status===410) token=undefined;
      if (!response.ok) throw new Error('Plaza request failed');
      const result=await response.json();
      if(controller!==request || !running) {
        if (result.token) leave(result.token);
        return;
      }
      token=result.token??token;
      selfName=result.self;
      lastPlayers=result.others;
      status='online';
      delay(180,sync);
    } catch {
      if(controller===request && running) {
        status='offline';
        lastPlayers=[];
        delay(1400,sync);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    start(getPlayer) {
      if(running) return;
      running=true;
      readPlayer=getPlayer;
      status='connecting';
      void sync();
    },
    stop() {
      running=false;
      clearTimeout(timer);
      controller?.abort();
      controller=null;
      leave(token);
      token=undefined;
      selfName=undefined;
      lastPlayers=[];
    },
    get players() { return lastPlayers; },
    get name() { return selfName; },
    get status() { return status; }
  };
}
