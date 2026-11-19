import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { createGame } from './game.js';
import { classPaths, maps, mentors } from './data.js';
import './style.css';

const fmt = new Intl.NumberFormat('pt-BR');
const getEmptySnapshot = () => null;
const emptySubscribe = () => () => {};
const tabs = [['build','Ficha'],['bag','Mochila'],['routes','Distritos']];

function Meter({ value, max, unit, xp }) {
  const progress = Math.max(0, Math.min(100, value / max * 100));
  return <div className={xp ? 'meter xp' : 'meter'}>
    <i style={{ width: progress + '%' }} />
    <span>{value} / {max} {unit}</span>
  </div>;
}

function PatrolControls({ view, game }) {
  return <div className="hud">
    <div className="hudTop">
      <div className="bars">
        <Meter value={view.hp} max={view.maxHp} unit="PV" />
        <Meter value={view.xp} max={view.goalXp} unit="XP" xp />
      </div>
      <button className={view.auto ? 'button on' : 'button'} aria-pressed={view.auto} onClick={game.toggleHunt}>
        {view.auto ? 'Caça ativa' : 'Iniciar caça'}
      </button>
    </div>
    <div className="actions">
      <button className="button skill" disabled={!view.skillReady} onClick={game.useSkill}>{view.skill}</button>
      <button className="button" disabled={!view.guardReady} onClick={game.defend}>Defender</button>
      <button className="button boss" disabled={!view.bossMode && !view.bossReady} onClick={game.trackBoss}>
        {view.bossMode ? 'Encerrar rastreio' : view.cleared[view.zone] ? 'Chefe purificado' : 'Rastrear chefe'}
      </button>
      <small className="rastro">Rastro · {view.trail}/{view.map.goal}</small>
    </div>
  </div>;
}

function Build({ view, game }) {
  return <>
    <h3>Pontos de atributo <span className="green">· {view.points} disponíveis</span></h3>
    <div className="row"><div><strong>Força {view.str}</strong><small>+4 de ataque por ponto</small></div>
      <button className="button plus" aria-label="Aumentar força" disabled={!view.points} onClick={() => game.addPoint('str')}>+</button>
    </div>
    <div className="row"><div><strong>Vitalidade {view.vit}</strong><small>+14 PV por ponto</small></div>
      <button className="button plus" aria-label="Aumentar vitalidade" disabled={!view.points} onClick={() => game.addPoint('vit')}>+</button>
    </div>
    {view.form && <div className="row"><div><strong>Liberação</strong><small>{view.formHint}</small></div>
      <button className="button skill" disabled={!view.releaseReady} onClick={game.release}>{view.nextForm}</button>
    </div>}
  </>;
}

function Bag({ view, game }) {
  return <>
    <h3>Equipados</h3>
    <div className="itemslots">
      {['blade','armor'].map(slot => {
        const item = view.inventory.find(candidate => candidate.id === view.equipped[slot]);
        return <div className="slot" key={slot}><div>
          <strong className={item?.style}>{item ? item.name + (item.upgrade ? ' +' + item.upgrade : '') : slot === 'blade' ? 'Lâmina inicial' : 'Manto inicial'}</strong>
          <small>{item ? '+' + item.value + (slot === 'blade' ? ' ataque' : ' PV') + ' · ' + item.rarity : 'Equipamento inicial'}</small>
        </div>
          {item && <button className="button" aria-label={'Aprimorar ' + item.name}
            disabled={item.upgrade >= 5 || view.reishi < item.cost} onClick={() => game.reinforce(item.id)}>
            {item.upgrade >= 5 ? '+5 Máx.' : '◇ ' + fmt.format(item.cost)}
          </button>}
        </div>;
      })}
    </div>
    <h3>Itens coletados</h3>
    <div className="bagList">
      {view.inventory.length ? view.inventory.map(item => {
        const current = view.equipped[item.slot] === item.id;
        return <div key={item.id} className="row"><div>
          <strong className={item.style}>{item.name}</strong>
          <small>{item.rarity} · +{item.value}{item.slot === 'blade' ? ' ataque' : ' PV'}</small>
        </div>
          <button className="button" disabled={current} aria-label={(current ? 'Em uso: ' : 'Equipar ') + item.name} onClick={() => game.setGear(item.id)}>
            {current ? 'Em uso' : 'Equipar'}
          </button>
        </div>;
      }) : <small>Itens aparecem aqui ao purificar Hollows.</small>}
    </div>
  </>;
}

function Districts({ view, game }) {
  return <><h3>Escolha uma rota</h3>
    {view.inHospital && <small>Saia do hospital para iniciar uma patrulha.</small>}
    {!view.inHospital && !view.classId && <small>Escolha uma classe na cidade para liberar a patrulha.</small>}
    {maps.map(({ name, area, lvl }, index) => <button key={name} className="region" aria-pressed={!view.inPlaza && index === view.zone}
      disabled={view.inHospital || !view.classId || view.unlocked < index} onClick={() => game.openDistrict(index)}>
      <span><strong>{name}</strong><small>{area}</small></span>
      <small>{view.unlocked < index ? 'Bloqueado' : 'Nv. ' + lvl + (view.cleared[index] ? ' · Limpo' : '')}</small>
    </button>)}
  </>;
}

const panels = {build:Build,bag:Bag,routes:Districts};

function CharacterPanel({ view, game }) {
  const [active, setActive] = useState('build');
  function onTabKey(event) {
    const index = tabs.findIndex(([id]) => id === active);
    const next = {ArrowRight:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const id = tabs[next][0];
    setActive(id);
    event.currentTarget.querySelector('#tab-' + id).focus();
  }
  return <aside className="side">
    <section className="panel profile">
      <div className="profileTop"><span className="portrait" style={{color:view.classInfo?.color}} aria-hidden="true">{view.classInfo?.icon ?? '人'}</span>
        <div><h2>Ren Amagiri</h2><small>{view.classInfo?.name ?? 'Humano'} · Nível {view.level}{view.form && ' · '+view.form}</small></div>
      </div>
      <div className="stats"><div className="stat">Ataque <b>{fmt.format(view.attack)}</b></div>
        <div className="stat">PV máx. <b>{fmt.format(view.maxHp)}</b></div>
      </div>
    </section>
    <section className="panel">
      <div className="tabs" role="tablist" aria-label="Painéis do personagem" onKeyDown={onTabKey}>
        {tabs.map(([id,label]) => <button key={id} id={'tab-' + id} role="tab" aria-controls={id} aria-selected={active === id}
          tabIndex={active === id ? 0 : -1} onClick={() => setActive(id)}>{label}</button>)}
      </div>
      {tabs.map(([id]) => {
        const Panel = panels[id];
        return <div key={id} className="tabbody" id={id} role="tabpanel" aria-labelledby={'tab-' + id} hidden={active !== id}>
          {active === id && <Panel view={view} game={game} />}
        </div>;
      })}
    </section>
  </aside>;
}

function MentorDialog({ mentor, currentClass, game }) {
  const dialog = useRef(null);
  useEffect(() => {
    const modal = dialog.current;
    modal.showModal();
    return () => modal.close();
  }, []);
  const option=classPaths[mentor.id];
  return <dialog ref={dialog} className="mentor-dialog" aria-labelledby="mentor-name" onCancel={event=>{
    event.preventDefault();
    game.closeMentor();
  }}>
    <header>
      <small style={{color:option.color}}>{mentor.place}</small>
      <h2 id="mentor-name">{mentor.name}</h2>
    </header>
    <p className="mentor-dialogue">{mentor.dialogue}</p>
    <div className="mentor-class"><strong>{option.name}</strong><p>{option.style}</p></div>
    <p className="mentor-choice-info">{currentClass ? 'Sua classe atual é '+currentClass.name+'.' : 'A escolha de classe é definitiva para este personagem.'}</p>
    <div className="mentor-actions">
      <button autoFocus type="button" className="button" onClick={game.closeMentor}>Fechar</button>
      {!currentClass && <button type="button" className="button on" onClick={()=>game.chooseClass(mentor.id)}>Virar {option.name}</button>}
    </div>
  </dialog>;
}

function MentorDirectory({ view, game }) {
  const walking=mentors.find(mentor=>mentor.id===view.walkingToMentor);
  return <section className="mentor-directory" aria-labelledby="mentors-title">
    <div className="mentor-heading">
      <h3 id="mentors-title">Mentores de Karakura</h3>
      <p role="status">{walking ? 'Indo falar com '+walking.label+'…' : view.classId ? 'Visite os mentores pela praça.' : 'Converse com um mentor para escolher sua classe.'}</p>
    </div>
    <div className="mentor-list">
      {mentors.map(({id,label,place})=>{
        const option=classPaths[id];
        return <button key={id} type="button" className="mentor-card" style={{'--mentor-color':option.color}}
          aria-label={'Visitar '+label+' · '+option.name} onClick={()=>game.visitMentor(id)}>
          <span className="mentor-icon" aria-hidden="true">{option.icon}</span>
          <span><strong>{label} {label!==option.name && <small>· {option.name}</small>}</strong><small>{place}</small></span>
        </button>;
      })}
    </div>
    {view.activeMentor && <MentorDialog mentor={view.activeMentor} currentClass={view.classInfo} game={game} />}
  </section>;
}

function PlazaControls({ view, game }) {
  const online=view.plazaStatus==='online';
  const label=online ? (view.plazaCount===1 ? '1 jogador na praça' : view.plazaCount+' jogadores na praça')
    : view.plazaStatus==='connecting' ? 'Conectando à praça…' : 'Conexão indisponível. Reconectando…';
  return <><MentorDirectory view={view} game={game} /><div className="plaza-controls">
    <div className="plaza-presence">
      <p role="status" className={online ? 'green' : undefined}>{label}</p>
      {online && <small>{view.plazaName} · Você</small>}
    </div>
    <form onSubmit={event => {
      event.preventDefault();
      game.openDistrict(Number(new FormData(event.currentTarget).get('district')));
    }}>
      <select aria-label="Distrito de patrulha" name="district" defaultValue={view.zone} disabled={!view.classId}>
        {maps.slice(0,view.unlocked+1).map(({name},index)=><option key={name} value={index}>{name}</option>)}
      </select>
      <button type="submit" className="button on" disabled={!view.classId}>Patrulhar</button>
    </form>
  </div></>;
}

function App() {
  const world = useRef(null);
  const [game, setGame] = useState(null);
  const view = useSyncExternalStore(game?.subscribe ?? emptySubscribe, game?.getSnapshot ?? getEmptySnapshot);

  useEffect(() => {
    const running = createGame(world.current);
    setGame(running);
    return () => running.dispose();
  }, []);

  return <main className="shell">
    <header className="top"><div className="brand"><span className="crest" aria-hidden="true">斬</span>
      <div><h1>Bleach Idle</h1><p>Vigília de Karakura</p></div></div>
      <div className="money"><small>REISHI</small><b>{fmt.format(view?.reishi ?? 0)}</b></div>
    </header>
    {view?.offlineMessage && <p className="summary" role="status">{view.offlineMessage}</p>}
    <div className="grid"><div className="column">
      <section className="panel" aria-labelledby="place">
        <div className="maphead"><div><h2 id="place">{view?.inHospital ? 'Hospital de Karakura' : view?.inPlaza || !view ? 'Karakura' : view.map.name}</h2>
          {view && <small>{view.inHospital ? 'Recepção e enfermaria' : view.inPlaza ? 'Cidade inicial · Praça Principal' : view.map.area + ' · Níveis ' + view.map.lvl}</small>}</div>
          {view?.inPlaza && <button className="button hospital-door" onClick={game.useHospitalDoor}>
            {view.inHospital ? 'Sair do hospital' : 'Entrar no hospital'}
          </button>}
          {view && !view.inPlaza && <div className="patrol-nav">
            <span className="tag">{view.bossMode ? 'Encontro com chefe' : view.auto ? 'Caça automática' : 'Exploração livre'}</span>
            <button className="button plaza-return" onClick={game.openPlaza}>Voltar à praça</button>
          </div>}
        </div>
        <div className="viewport">
          <canvas ref={world} width="544" height="306" tabIndex={0} aria-label={view?.inHospital ? "Hospital de Karakura. Use WASD para andar ou toque na saída."
            : view?.inPlaza ? "Praça Principal. Use WASD para andar, toque na porta do hospital ou selecione um mentor na lista." : "Mapa de patrulha. Toque ou use WASD para andar."} />
          <span className="risk" role="status" hidden={!view?.warning}>{view?.warning}</span>
          <span className="worldnote">{view?.inPlaza ? 'WASD ou toque · E na porta' : 'WASD ou toque para andar'}</span>
        </div>
        {view && !view.inHospital && (view.inPlaza ? <PlazaControls view={view} game={game} /> : <PatrolControls view={view} game={game} />)}
      </section>
      {view && <section className="panel diary"><h2>Diário da patrulha</h2>
        <ul>{view.messages.map((message,index) => <li key={message + index}>{message}</li>)}</ul>
      </section>}
    </div>{view && <CharacterPanel view={view} game={game} />}</div>
    {view && <footer>Protótipo de fã · {view.storageOK ? 'Progresso salvo neste navegador · Caça offline de até 8 horas' : 'Salvamento indisponível neste navegador'}</footer>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
