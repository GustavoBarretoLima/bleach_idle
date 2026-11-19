export const worldSize = {width:1120,height:640};
export const plaza = {
  bounds:{left:316,top:201,right:804,bottom:443},
  fountain:{left:526,top:285,right:594,bottom:339}
};

export const classPaths = {
  shinigami: {name:'Shinigami', icon:'斬', color:'#a2e2a9', skill:'Corte espiritual', style:'Espada e evolução para Shikai e Bankai.', range:27, power:2.2},
  quincy: {name:'Quincy', icon:'弓', color:'#9bd9ff', skill:'Flecha espiritual', style:'Disparos de Reishi com maior alcance.', range:76, power:1.9},
  sado: {name:'Sado', icon:'拳', color:'#ffbc8b', skill:'Impacto do Gigante', style:'Combate corpo a corpo, mais PV e golpe pesado.', range:27, power:2.6, bonusHp:18},
  inoue: {name:'Inoue', icon:'盾', color:'#ffd295', skill:'Escudo Restaurador', style:'Técnica espiritual que causa dano e recupera PV.', range:38, power:1.7, recovery:.18}
};

export const mentors = [
  {id:'shinigami', name:'Kisuke Urahara', label:'Urahara', place:'Loja Urahara', x:610, y:450, approachY:463,
    dialogue:'Se consegue sentir a pressão espiritual da cidade, já tem por onde começar. Passe na minha loja e vamos despertar sua lâmina.'},
  {id:'quincy', name:'Ryūken Ishida', label:'Ryūken', place:'Recepção', hospital:true, x:504, y:263, approachY:287,
    dialogue:'Uma flecha Quincy começa pela concentração. Posso ensinar você a reunir o Reishi ao seu redor e dar forma a ele.'},
  {id:'sado', name:'Yasutora “Chad” Sado', label:'Sado', place:'Sala de espera', hospital:true, x:475, y:359, approachY:383,
    dialogue:'Força vale mais quando você tem alguém para proteger. Se quiser treinar comigo, começamos por aí.'},
  {id:'inoue', name:'Orihime Inoue', label:'Inoue', place:'Enfermaria', hospital:true, x:677, y:336, approachY:355,
    dialogue:'Se você se machucou, posso cuidar dos seus ferimentos. Também posso ensinar você a usar o meu escudo.'}
];

export function plazaWalkable(x,y) {
  const {bounds,fountain}=plaza;
  return x>=bounds.left && x<=bounds.right && y>=bounds.top && y<=bounds.bottom &&
    !(y<241 && (Math.abs(x-386)<57 || Math.abs(x-734)<57)) &&
    !(x>fountain.left-4 && x<fountain.right+4 && y>fountain.top-4 && y<fountain.bottom+4);
}

export function cameraFor(hero, width, height) {
  return {
    x:Math.round(Math.max(0,Math.min(worldSize.width-width,hero.x-width/2))),
    y:Math.round(Math.max(0,Math.min(worldSize.height-height,hero.y-height/2)))
  };
}

export const maps = [
  {name:'Karakura', area:'Rua do Santuário', lvl:'1–4', foe:'Hollow Errante', boss:'Máscara de Cinzas', hp:37, dmg:5, exp:8, cash:8, goal:6, bossHp:198, bossDmg:27, ground:'#3c5143', road:'#4b5155', roof:'#4e5268', roadX:[310,821],
    walls:[[18,18,116,61],[165,14,133,65],[373,19,152,65],[16,220,130,67],[179,231,91,56],[395,231,129,56],
      [580,27,178,62],[885,32,190,79],[602,237,142,103],[884,234,164,102],
      [62,334,166,57],[403,339,130,57],[45,511,190,85],[421,530,126,65],[585,511,151,81],[874,515,183,83]],
    spawns:[[76,117],[186,141],[284,115],[447,131],[92,187],[357,203],[487,188],[654,154],[975,169],[819,288],[297,386],[175,450],[607,450],[944,446]], rally:[240,173], altar:[994,457]},
  {name:'Distrito do Vapor', area:'Oficinas abandonadas', lvl:'4–9', foe:'Hollow do Vapor', boss:'Carcereiro da Névoa', hp:78, dmg:10, exp:15, cash:15, goal:8, bossHp:380, bossDmg:47, ground:'#43504b',road:'#505858',roof:'#59604b', roadX:[347,775],
    walls:[[23,29,130,65],[200,20,184,63],[425,27,98,82],[14,221,117,66],[209,211,134,74],[407,211,117,78],
      [572,19,143,79],[858,25,205,78],[573,229,142,114],[841,234,233,80],
      [36,327,120,66],[453,327,68,75],[34,531,197,62],[421,512,129,82],[576,529,121,81],[847,516,224,88]],
    spawns:[[68,129],[177,131],[315,121],[462,143],[108,176],[383,169],[471,188],[623,159],[944,162],[775,298],[326,367],[201,450],[624,472],[954,428]], rally:[257,154], altar:[1013,455]},
  {name:'Fenda da Lua', area:'Travessia espiritual', lvl:'9+', foe:'Hollow Espectral', boss:'Vigia da Fenda', hp:151, dmg:17, exp:26, cash:27, goal:10, bossHp:680, bossDmg:72, ground:'#192b37',road:'#1b2f3b',roof:'#425066', arena:true,
    walls:[[31,21,108,65],[221,16,110,63],[410,22,108,65],[19,223,144,54],[220,220,94,63],[411,218,105,69],
      [623,53,112,57],[929,73,101,45],[660,247,83,68],[917,236,119,91],
      [83,394,93,47],[333,433,91,75],[139,535,86,63],[598,536,94,54],[910,526,130,70]],
    spawns:[[77,121],[178,132],[278,118],[453,132],[93,172],[351,201],[483,186],[633,147],[861,175],[790,307],[221,399],[241,479],[565,475],[936,399]], rally:[258,165], altar:[997,451]}
];
export const loot = {
  steel:{name:'Lâmina do Vigia',slot:'blade',stat:5,rarity:'Comum',style:''},
  coat:{name:'Manto de Patrulha',slot:'armor',stat:23,rarity:'Comum',style:''},
  moon:{name:'Lâmina da Lua Fria',slot:'blade',stat:13,rarity:'Raro',style:'rare'},
  silk:{name:'Manto do Véu',slot:'armor',stat:46,rarity:'Raro',style:'rare'},
  dusk:{name:'Lâmina do Eclipse',slot:'blade',stat:24,rarity:'Épico',style:'epic'},
  veil:{name:'Traje da Fenda',slot:'armor',stat:79,rarity:'Épico',style:'epic'}
};
export const drops = [['steel','coat'],['moon','silk'],['dusk','veil']];
export const forms = ['Selada','Shikai','Bankai'];
export const powers = ['Corte espiritual','Lua Partida','Eclipse da Vigília'];
export const key = 'bleach-idle-vigilia-v1';
export const initial = () => ({version:3, classId:null, inPlaza:true, level:1,xp:0,reishi:18,str:0,vit:0,points:0,legacyBlade:0,legacyArmor:0,form:0,zone:0,unlocked:0,kills:[0,0,0],cleared:[false,false,false],auto:true,bag:[],gear:{blade:null,armor:null},upgrades:{},savedAt:Date.now()});
