// Karakura adaptation for gameplay. Coordinates share the existing city/presence space.
export const landmarks = [
  {id:'school',name:'ESCOLA DE KARAKURA',x:470,y:85,w:190,h:95,roof:'#698591'},
  {id:'clinic',name:'CLÍNICA KUROSAKI',x:205,y:245,w:125,h:85,roof:'#a77d65'},
  {id:'hospital',name:'HOSPITAL DE KARAKURA',x:480,y:290,w:150,h:96,roof:'#9cb7b5'},
  {id:'urahara',name:'LOJA URAHARA',x:645,y:465,w:115,h:75,roof:'#596c58'},
  {id:'warehouse',name:'ARMAZÉM VISORED',x:205,y:465,w:125,h:68,roof:'#69767e'},
  {id:'house1',x:210,y:85,w:80,h:65,roof:'#698294'},
  {id:'house2',x:330,y:85,w:80,h:65,roof:'#997a74'},
  {id:'house3',x:690,y:85,w:76,h:65,roof:'#687d94'},
  {id:'house4',x:690,y:260,w:76,h:62,roof:'#97866b'},
  {id:'house5',x:360,y:470,w:75,h:63,roof:'#6d8396'}
];
export const river = {x:815,w:72,bridges:[205,430],bridgeHeight:36};
export function riverBlocks(x,y,radius) {
  return x+radius>river.x && x-radius<river.x+river.w &&
    !river.bridges.some(center=>y-radius>=center-river.bridgeHeight/2 && y+radius<=center+river.bridgeHeight/2);
}
export function paintKarakura(c) {
  const rect=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  const text=(label,x,y)=>{c.font='bold 8px monospace';c.textAlign='center';const w=c.measureText(label).width;rect('#1a303be8',x-w/2-4,y-9,w+8,13);c.fillStyle='#e4efe5';c.fillText(label,x,y);};
  rect('#849b76',160,40,800,560);
  for(let y=42;y<600;y+=8) for(let x=162;x<960;x+=8) {
    const n=(x*13+y*19)%17;
    rect(n<8?'#93a67e':'#78916d',x,y,2,1);
  }
  // Connected residential streets, sidewalks and crossings.
  const streets=[[170,187,640,36],[170,412,640,36],[170,552,640,28],[440,50,30,530],[350,170,28,280],[780,50,28,530]];
  for(const [x,y,w,h] of streets){rect('#c3c1ac',x-6,y-6,w+12,h+12);rect('#555f65',x,y,w,h);}
  for(const y of [205,430]) for(let x=180;x<810;x+=28) rect('#d5cdb0',x,y,12,2);
  for(const x of [455,794]) for(let y=60;y<575;y+=26) rect('#ddd1ad',x,y,2,10);
  for(const x of [350,440,780]) for(const y of [187,412]) for(let i=0;i<5;i++) rect('#ece7cf',x+i*6,y,3,10);
  // Onose river, embankments, two usable bridges and eastern walking path.
  rect('#b6b59c',809,40,84,560);rect('#356f88',815,40,72,560);
  for(let y=48;y<600;y+=14) for(let x=819;x<882;x+=18) rect('#70b5c2',x+(y%3),y,10,1);
  rect('#cabd9b',902,50,18,532);
  for(const y of river.bridges){rect('#394e59',807,y-22,88,44);rect('#b6b4a4',809,y-18,84,36);for(let x=813;x<890;x+=10) rect('#92968e',x,y-18,1,36);rect('#dee0ca',807,y-22,88,3);rect('#dee0ca',807,y+19,88,3);}
  // School yard and small park / meeting square.
  rect('#c5b997',480,239,270,35);
  for(let x=485;x<750;x+=14) rect('#ece3c5',x,270,2,4);
  rect('#c0bca4',485,455,135,82);rect('#929f7c',492,462,121,68);
  rect('#d7c9a3',547,460,12,74);rect('#d7c9a3',492,490,121,12);
  for(const [x,y] of [[505,475],[590,475],[505,515],[590,515]]){rect('#594f40',x,y,17,4);rect('#9d7b53',x,y-2,17,2);}
  text('PRAÇA DOS ESPÍRITOS',552,547);text('RIO ONOSE',851,121);
  // Japanese roofs, facades, windows, signs and visible entrances.
  for(const b of landmarks){
    const {x,y,w,h}=b;
    rect('#24394065',x+5,y+7,w,h);
    rect('#ded9bd',x,y+18,w,h-18);rect('#b5b69f',x+w-10,y+18,10,h-18);
    rect('#35434d',x-3,y-3,w+6,31);rect(b.roof,x,y,w,25);rect('#ffffff32',x+3,y+3,w-6,2);
    for(let a=x+8;a<x+w-14;a+=20) for(let row=y+36;row<y+h-16;row+=19){rect('#465e6a',a,row,12,11);rect('#a1cbd0',a+1,row+1,10,7);rect('#d6e1d3',a+5,row+1,1,8);}
    for(let a=x+8;a<x+w;a+=12) rect('#243c4830',a,y+6,1,16);
    rect('#344958',x+w/2-8,y+h-17,16,17);rect('#8dbac0',x+w/2-6,y+h-15,11,12);rect('#c5c9b1',x+w/2-11,y+h,22,4);
    if(b.id==='hospital'||b.id==='clinic'){rect('#f3efda',x+8,y+8,16,14);rect('#b45e61',x+14,y+10,4,10);rect('#b45e61',x+11,y+13,10,4);}
    if(b.id==='urahara'){rect('#d6d3b5',x-2,y+27,w+4,12);for(let a=x;a<x+w;a+=16)rect('#536d57',a,y+27,8,12);}
    if(b.name) text(b.name,x+w/2,y-10);
  }
  // Tree crowns, trunks and shadows; decorative trees stay off the streets.
  for(const [x,y] of [[190,165],[310,164],[680,165],[745,165],[190,390],[410,390],[660,389],[747,389],[935,94],[938,160],[937,298],[936,368],[936,510],[190,572],[640,563],[755,563]]){
    rect('#314c4055',x-8,y+4,24,9);rect('#68513c',x-2,y-3,4,14);rect('#315b48',x-12,y-20,24,21);rect('#467653',x-9,y-25,18,23);rect('#6e9360',x-6,y-23,10,5);
  }
  // Lamps and vending machines add readable street scale.
  for(const [x,y] of [[390,233],[470,240],[770,390],[320,448],[770,550]]){rect('#344653',x,y-19,2,21);rect('#eed9a1',x-3,y-21,8,4);}
  rect('#a95e57',668,331,10,18);rect('#b8d5cf',669,333,8,7);rect('#243b46',671,344,4,3);
}
