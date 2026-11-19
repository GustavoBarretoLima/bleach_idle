export const maps = [
  {name:'Karakura', area:'Rua do Santuário', lvl:'1–4', foe:'Hollow Errante', boss:'Máscara de Cinzas', hp:37, dmg:5, exp:8, cash:8, goal:6, bossHp:198, bossDmg:27, ground:'#3c5143', road:'#4b5155', roof:'#4e5268',
    walls:[[18,18,116,61],[165,14,133,65],[373,19,152,65],[16,220,130,67],[179,231,91,56],[395,231,129,56]],
    spawns:[[76,117],[186,141],[284,115],[447,131],[92,187],[357,203],[487,188]], rally:[240,173], altar:[472,173]},
  {name:'Distrito do Vapor', area:'Oficinas abandonadas', lvl:'4–9', foe:'Hollow do Vapor', boss:'Carcereiro da Névoa', hp:78, dmg:10, exp:15, cash:15, goal:8, bossHp:380, bossDmg:47, ground:'#43504b',road:'#505858',roof:'#59604b',
    walls:[[23,29,130,65],[200,20,184,63],[425,27,98,82],[14,221,117,66],[209,211,134,74],[407,211,117,78]],
    spawns:[[68,129],[177,131],[315,121],[462,143],[108,176],[383,169],[471,188]], rally:[257,154], altar:[398,148]},
  {name:'Fenda da Lua', area:'Travessia espiritual', lvl:'9+', foe:'Hollow Espectral', boss:'Vigia da Fenda', hp:151, dmg:17, exp:26, cash:27, goal:10, bossHp:680, bossDmg:72, ground:'#4f4a59',road:'#535062',roof:'#655273',
    walls:[[31,21,108,65],[221,16,110,63],[410,22,108,65],[19,223,144,54],[220,220,94,63],[411,218,105,69]],
    spawns:[[77,121],[178,132],[278,118],[453,132],[93,172],[351,201],[483,186]], rally:[258,165], altar:[477,167]}
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
export const initial = () => ({version:2, level:1,xp:0,reishi:18,str:0,vit:0,points:0,legacyBlade:0,legacyArmor:0,form:0,zone:0,unlocked:0,kills:[0,0,0],cleared:[false,false,false],auto:true,bag:[],gear:{blade:null,armor:null},upgrades:{},savedAt:Date.now()});
