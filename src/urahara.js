// Anime-inspired shop and Study Chamber. Shared geometry drives drawing and collision.
import { hospital } from './hospital.js';
export const shop = {
  center:{x:560,y:320}, bounds:{left:328,top:180,right:792,bottom:460},
  entrance:{x:702,y:550}, spawn:{x:552,y:424},
  furniture:[{x:350,y:225,width:170,height:48},{x:350,y:305,width:38,height:88},
    {x:566,y:333,width:76,height:34},{x:650,y:214,width:112,height:25}],
};
export const training = {
  spawn:{x:176,y:176},
  rocks:[{x:330,y:150,width:115,height:65},{x:690,y:100,width:126,height:88},
    {x:470,y:375,width:120,height:90},{x:825,y:360,width:150,height:80},
    {x:185,y:450,width:95,height:65},{x:710,y:515,width:100,height:70}],
};
export function locationFor(state) {
  return !state.inPlaza ? 'district' : state.inHospital ? 'hospital' : state.uraharaRoom || 'city';
}
export function doorsFor(location) {
  if(location==='hospital') return [{...hospital.exit,id:'hospital-exit',label:'Sair do hospital',to:'city',spawn:hospital.entrance}];
  if(location==='shop') return [
    {x:552,y:432,id:'shop-exit',label:'Sair da loja',to:'city',spawn:shop.entrance},
    {x:720,y:280,id:'descend',label:'Descer ao subterrâneo',to:'training',spawn:training.spawn}
  ];
  if(location==='training') return [{x:176,y:144,id:'ascend',label:'Subir para a loja',to:'shop',spawn:{x:720,y:306}}];
  if(location==='city') return [
    {...hospital.entrance,id:'hospital-enter',label:'Entrar no hospital',to:'hospital',spawn:hospital.spawn},
    {...shop.entrance,id:'shop-enter',label:'Entrar na Loja Urahara',to:'shop',spawn:shop.spawn}
  ];
  return [];
}
export function roomWalkable(room,x,y) {
  const inside=room==='shop' ? x>=339 && x<=781 && y>=217 && y<=449 : x>=65 && x<=1055 && y>=95 && y<=603;
  const obstacles=room==='shop' ? shop.furniture : training.rocks;
  return inside && !obstacles.some(b=>x>b.x-7 && x<b.x+b.width+7 && y>b.y-7 && y<b.y+b.height+7);
}
export function paintUrahara(c,room) {
  const r=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  const label=(text,x,y)=>{c.font='bold 9px monospace';c.textAlign='center';let w=c.measureText(text).width;r('#202c32e8',x-w/2-4,y-10,w+8,14);c.fillStyle='#f6e3b5';c.fillText(text,x,y);};
  const ladder=(x,y)=>{r('#30251e',x-17,y-19,34,38);r('#bd9461',x-13,y-17,4,36);r('#bd9461',x+9,y-17,4,36);for(let n=-12;n<18;n+=7)r('#ddba80',x-10,y+n,20,3);};
  if(room==='shop') {
    r('#18272c',0,0,1120,640);r('#493a2d',322,174,476,292);r('#a67b51',328,180,464,280);
    for(let y=215;y<460;y+=12){r(y%24?'#926c48':'#a17a51',335,y,450,11);for(let x=340+(y%24?28:0);x<785;x+=56)r('#715439',x,y,1,11);}
    r('#d4c5a0',334,186,452,27);r('#634b35',334,210,452,7);
    // Shoji screens and wood beams at the back of the house.
    for(const x of [536,588,640,692,744]){r('#6b5339',x,186,47,27);r('#e4dfc0',x+3,188,41,22);for(let a=8;a<42;a+=10)r('#b59d75',x+a,188,1,22);r('#b59d75',x+3,198,41,1);}
    // Raised tatami room, low tea table, cushions and tea set.
    r('#65533b',536,309,236,93);
    for(let y=313;y<390;y+=28) for(let x=540;x<760;x+=57){r('#b3b184',x,y,54,25);for(let n=2;n<25;n+=3)r('#a3a879',x,y+n,54,1);r('#667d60',x,y,3,25);}
    for(const [x,y] of [[587,318],[587,378],[546,346],[652,346]]){r('#686d64',x,y,24,15);r('#8c9880',x+2,y+2,20,11);}
    r('#4f3c2c',568,337,76,34);r('#91623d',566,333,76,29);r('#b88b59',570,336,68,2);
    r('#c7d1b8',594,341,13,10);r('#e9e6cc',600,338,7,6);r('#dce1c9',578,347,5,5);r('#dce1c9',619,347,5,5);
    // Sweet jars, candy boxes and spiritual supplies behind the counter.
    for(const b of [shop.furniture[0],shop.furniture[1],shop.furniture[3]]){r('#4b3527',b.x,b.y,b.width,b.height);r('#9c744b',b.x+3,b.y+3,b.width-6,b.height-6);for(let y=b.y+8;y<b.y+b.height-4;y+=17){for(let x=b.x+6;x<b.x+b.width-8;x+=14){r(['#b77a70','#a7b082','#d0bc80'][(x+y)%3],x,y,9,10);r('#e3d6b0',x+1,y+2,7,3);}r('#4b3527',b.x+2,y+12,b.width-4,3);}}
    r('#674a31',350,263,170,10);r('#c19a63',350,260,170,5);
    // Concealed floor hatch with a real ladder and removable wooden cover.
    r('#6b4f32',695,252,50,48);r('#131d21',699,256,42,40);ladder(720,277);r('#a57f50',749,252,22,44);for(let y=256;y<292;y+=8)r('#6d5238',751,y,18,1);
    label('SUBSOLO',720,246);label('DOCES E ARTIGOS ESPIRITUAIS',432,204);
    r('#d5c5a2',529,425,46,27);for(let x=532;x<575;x+=10)r('#725b42',x,425,2,27);label('KARAKURA',552,455);
    return;
  }
  // Vast artificial desert below the shop, with a sky-painted cavern roof.
  r('#a8c4c6',0,0,1120,640);r('#d0b17a',48,79,1024,537);
  for(let y=92;y<610;y+=6)for(let x=56;x<1066;x+=9){const n=(x*17+y*23)%31;r(n<8?'#b89968':'#dcbc84',x,y,2+n%3,1);}
  for(let x=48;x<1072;x+=36){const h=20+(x*7)%31;r('#715d49',x,64,36,h+24);r('#a08c68',x+3,66,29,h);r('#cfbc8b',x+5,67,25,3);}
  r('#826d50',48,87,15,528);r('#826d50',1057,87,15,528);r('#927b55',48,604,1024,12);
  for(const b of training.rocks){r('#92754e55',b.x+8,b.y+10,b.width,b.height);r('#756044',b.x,b.y,b.width,b.height);r('#a68a5e',b.x+4,b.y+3,b.width-8,b.height-12);r('#c6a66b',b.x+9,b.y+4,b.width-20,5);for(let y=17;y<b.height-8;y+=16)r('#826a49',b.x+6,b.y+y,b.width-12,2);r('#665642',b.x+b.width-14,b.y+12,10,b.height-12);}
  // The Shattered Shaft, sealed as scenery rather than a walkable death pit.
  r('#3c3a35',489,394,80,57);r('#655440',495,400,68,45);r('#202b2b',501,406,56,33);
  for(const [x,y] of [[270,310],[610,235],[940,220]]){r('#806b4c',x,y-23,5,28);r('#806b4c',x-10,y-19,13,4);r('#806b4c',x+2,y-30,13,4);r('#806b4c',x-11,y-28,3,13);r('#806b4c',x+12,y-39,3,13);}
  ladder(176,140);label('SUBIR PARA A LOJA',176,108);label('CÂMARA DE TREINAMENTO',560,119);
  // Senkaimon frame is scenery; travel is not yet unlocked.
  r('#534d42',938,125,9,70);r('#534d42',997,125,9,70);r('#ddd2b0',934,120,76,8);r('#ddd2b0',944,133,56,4);label('SENKAIMON · INATIVO',970,214);
}
