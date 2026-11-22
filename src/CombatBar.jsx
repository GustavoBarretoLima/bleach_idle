import {useState} from 'react';
import {keyLabel} from './controls.js';

export function CombatBar({view,game}){
  const [capturing,setCapturing]=useState(null),[error,setError]=useState('');
  const focusMap=()=>document.querySelector('.viewport canvas[tabindex="0"]')?.focus({preventScroll:true});
  function action(callback){callback();focusMap();}
  return <section className="combat-bar" aria-label="Combate e magias">
    <div className="combat-basics">
      <button type="button" className="button" disabled={!view.attackReady} onClick={()=>action(game.basicAttack)}><kbd>J</kbd> Atacar</button>
      <button type="button" className={'button '+(view.parryFlash?'parry':view.defending?'on':'')} disabled={!view.guardReady} onClick={()=>action(game.defend)}>
        <kbd>K</kbd> {view.parryFlash?'Parry!':view.defending?'Defendendo':view.guardRemaining>0?`Defender · ${view.guardRemaining}s`:'Defender'}
      </button>
      <small>Defenda no instante do impacto para causar parry.</small>
    </div>
    <div className="spell-slots" role="group" aria-label="10 slots de magia">
      {view.hotbar.map((slot,index)=><button key={index} type="button" className={'spell-slot '+(!slot.spell?'empty':'')}
        aria-label={`Slot ${index+1}: ${slot.spell?.name??'Vazio'} · tecla ${keyLabel(slot.key)}`}
        title={slot.spell?`${slot.spell.name} · ${keyLabel(slot.key)}`:`Slot ${index+1} vazio`}
        disabled={!slot.spell||!view.skillReady} onClick={()=>action(()=>game.useSlot(index))}>
        <kbd>{keyLabel(slot.key)}</kbd><span className="spell-icon" aria-hidden="true">{slot.spell?.icon??'+'}</span>
        <span className="spell-name">{slot.spell?.name??'Vazio'}</span>
        {slot.spell&&view.spellRemaining>0&&<span className="spell-cooldown">{view.spellRemaining}s</span>}
      </button>)}
    </div>
    <details className="hotbar-settings" onToggle={event=>{if(!event.currentTarget.open)setCapturing(null);}}>
      <summary>Configurar magias e teclas</summary>
      <p>Escolha as magias aprendidas e a tecla de cada slot. J ataca, K defende e WASD movimenta.</p>
      <div className="binding-grid">
        {view.hotbar.map((slot,index)=><div className="binding-row" key={index}>
          <label htmlFor={'spell-'+index}>Slot {index+1}</label>
          <select id={'spell-'+index} value={slot.spellId??''} onChange={event=>game.configureSlot(index,event.target.value||null)}>
            <option value="">Vazio</option>
            {slot.spellId&&!slot.spell&&<option value={slot.spellId}>Magia indisponível</option>}
            {view.spells.map(spell=><option key={spell.id} value={spell.id}>{spell.name}</option>)}
          </select>
          <button type="button" className={'binding-key '+(capturing===index?'listening':'')} aria-label={`Alterar tecla do slot ${index+1}`}
            onBlur={()=>{if(capturing===index)setCapturing(null);}}
            onClick={()=>{setError('');setCapturing(index);}}
            onKeyDown={event=>{
              if(capturing!==index)return;
              if(event.key==='Tab'){setCapturing(null);return;}
              event.preventDefault();event.stopPropagation();
              if(event.key==='Escape'){setCapturing(null);return;}
              if(event.repeat)return;
              if(event.ctrlKey||event.metaKey||event.altKey){setError('Escolha uma tecla sem Ctrl, Alt ou Meta.');return;}
              const message=game.bindSlot(index,event.key.toLowerCase());
              setError(message??'');if(!message)setCapturing(null);
            }}>{capturing===index?'Pressione…':keyLabel(slot.key)}</button>
        </div>)}
      </div>
      <p className="binding-message" role="status">{error||(capturing!==null?'Pressione a nova tecla. Esc cancela.':'As configurações são salvas neste navegador. Magias compartilham o tempo de recarga.')}</p>
    </details>
  </section>;
}
