export const cityTrees = [[190,165],[310,164],[680,165],[745,165],[190,390],[410,390],[660,389],[747,389],[935,94],[938,160],[937,298],[936,368],[936,510],[190,572],[640,563],[755,563]];
const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function oval(c,color,x,y,rx,ry){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
export function paintCanopy(c,x,y){
  oval(c,'#294f3f',x,y-18,19,15);oval(c,'#35634a',x-8,y-26,15,13);oval(c,'#477b50',x+7,y-31,15,14);
  oval(c,'#60915b',x-3,y-37,13,11);oval(c,'#76a366',x-7,y-39,8,5);
  for(let i=0;i<12;i++)rect(c,i%2?'#7caa69':'#4c7c4f',x-13+(i*11)%27,y-38+(i*7)%23,3,2);
}
export function paintTreeBases(c,withCrowns=true){
  for(const [x,y] of cityTrees){oval(c,'#243f3340',x+7,y+3,22,8);rect(c,'#66503c',x-3,y-20,6,23);rect(c,'#94704e',x-2,y-17,2,18);if(withCrowns)paintCanopy(c,x,y);}
}
export function paintFacade(c,b){
  const {x,y,w,h}=b;
  const shop=b.id==='urahara', school=b.id==='school', medical=['hospital','clinic'].includes(b.id);
  const base=shop?'#d4c49b':medical?'#dde0cd':'#d4c6ab';
  rect(c,'#15292c40',x+7,y+10,w+6,h+2);
  rect(c,'#39454a',x,y+18,w,h-18);rect(c,base,x+2,y+20,w-4,h-24);
  rect(c,'#b3ad96',x+w-11,y+20,9,h-24);rect(c,'#8a8c7f',x,y+h-6,w,6);
  for(let row=y+36;row<y+h-19;row+=21)for(let a=x+9;a<x+w-15;a+=23){
    rect(c,'#4d6269',a-1,row-1,16,14);rect(c,'#86b6bc',a,row,14,10);rect(c,'#bed7cd',a+1,row+1,12,2);
    rect(c,'#527f8b',a+1,row+6,12,4);rect(c,'#dfdfc8',a+6,row,2,11);rect(c,'#a7a896',a-2,row+12,18,2);
  }
  // Distinct eaves, roof ridges, seams and cast shadow instead of flat rectangles.
  rect(c,'#1f333c',x-5,y-3,w+10,32);rect(c,b.roof,x-2,y-2,w+4,27);
  for(let row=1;row<24;row+=5){rect(c,'#172e3e35',x-2,y+row,w+4,1);for(let a=x+(row%2)*3;a<x+w;a+=9)rect(c,'#dce8df26',a,y+row+1,1,3);}
  rect(c,'#d5dfca65',x+2,y-2,w-4,2);rect(c,'#354650',x-5,y+24,w+10,5);rect(c,'#172d3630',x,y+29,w,6);
  rect(c,'#2d4148',x+w/2-9,y+h-22,18,22);rect(c,shop?'#70573c':'#71989c',x+w/2-7,y+h-20,14,19);
  rect(c,'#e6d8af',x+w/2+3,y+h-11,2,2);rect(c,'#c4c2a8',x+w/2-12,y+h,24,4);
  if(shop){
    rect(c,'#b8b590',x-2,y+30,w+4,15);
    for(let a=x;a<x+w;a+=16){rect(c,'#3d6555',a,y+30,9,14);rect(c,'#6d8c66',a+1,y+31,7,2);}
    for(const a of [x+7,x+w-13]){rect(c,'#4b493b',a,y+44,2,17);oval(c,'#dcb880',a+1,y+51,4,6);rect(c,'#9b7952',a-2,y+50,6,1);}
    rect(c,'#8c6b43',x+w-17,y+h-17,14,17);rect(c,'#c39b62',x+w-16,y+h-15,12,2);
  }
  if(medical){rect(c,'#f2edda',x+8,y+6,17,14);rect(c,'#bb6865',x+15,y+8,3,10);rect(c,'#bb6865',x+11,y+11,11,3);}
  if(school){rect(c,'#ddd9bf',x+w/2-8,y+3,16,16);oval(c,'#607a81',x+w/2,y+11,6,6);rect(c,'#f3ecd1',x+w/2,y+7,1,5);rect(c,'#f3ecd1',x+w/2,y+11,4,1);}
  if(b.name){c.font='bold 8px monospace';c.textAlign='center';const tw=c.measureText(b.name).width;rect(c,'#1d343bea',x+w/2-tw/2-5,y-16,tw+10,13);c.fillStyle='#e9e3c8';c.fillText(b.name,x+w/2,y-6);}
}
export function paintCityDetails(c){
  // Curbs, road markings and bridge rails retain the existing collision footprint.
  for(const y of [205,430])for(let x=180;x<800;x+=28)rect(c,'#d3c9a1',x,y,12,2);
  for(const x of [455,794])for(let y=60;y<575;y+=26)rect(c,'#d3c9a1',x,y,2,10);
  for(const x of [350,440,780])for(const y of [187,412])for(let i=0;i<5;i++)rect(c,'#eee6cc',x+i*6,y,3,10);
  for(const x of [810,889]){rect(c,'#697e75',x,40,3,560);for(let y=42;y<600;y+=12)rect(c,'#a2af8c',x,y,3,1);}
  for(const y of [205,430]){rect(c,'#52666a',807,y-22,88,4);rect(c,'#cbd1b7',807,y-22,88,2);rect(c,'#63716c',807,y+18,88,4);rect(c,'#d4d5b9',807,y+18,88,2);for(let x=809;x<895;x+=12){rect(c,'#3d5255',x,y-23,3,6);rect(c,'#3d5255',x,y+17,3,6);}}
  rect(c,'#b8ad8b',480,239,270,35);for(let x=484;x<750;x+=14)rect(c,'#e1d8bc',x,270,2,4);
  for(const [x,y] of [[505,475],[590,475],[505,515],[590,515]]){rect(c,'#28473c33',x+2,y+3,20,5);rect(c,'#584a37',x,y,18,5);rect(c,'#b08a57',x,y-3,18,3);rect(c,'#d3aa6e',x+1,y-3,16,1);}
  for(const [x,y] of [[390,233],[470,240],[770,390],[320,448],[770,550]]){rect(c,'#334650',x,y-19,2,21);rect(c,'#53615e',x-2,y,6,2);rect(c,'#e9d5a0',x-3,y-21,8,4);rect(c,'#405058',x-4,y-23,10,2);}
  for(const [x,y] of [[336,345],[767,344],[644,551]]){rect(c,'#805f43',x,y,15,6);for(let a=0;a<5;a++)oval(c,a%2?'#ca987c':'#7b9a67',x+2+a*3,y-1-a%2,3,3);}
  rect(c,'#8b4f4c',668,331,11,19);rect(c,'#bfcbb9',669,333,9,10);rect(c,'#557b80',670,334,7,6);rect(c,'#253a43',671,345,4,3);
}
export function paintShopDetails(c){
  const r=(color,x,y,w,h)=>rect(c,color,x,y,w,h);
  // Beams and wall recesses give the existing shop furniture more depth.
  for(const x of [330,524,780]){r('#44392c',x,181,5,279);r('#8b704b',x+1,183,1,274);}
  r('#332d25',328,211,464,4);r('#d9bf8c55',336,215,442,3);
  for(const [x,y,w,h] of [[350,225,170,48],[350,305,38,88],[566,333,76,34],[650,214,112,25]]){
    r('#231e1a35',x+3,y+h,w+2,5);r('#dfb97965',x+3,y+2,w-6,1);
  }
  for(const [x,y] of [[425,238],[652,317]]){r('#514335',x-1,y-11,2,8);oval(c,'#d7b37b',x,y,7,8);r('#f7dca1',x-3,y-5,2,10);r('#8f6744',x-5,y+3,10,1);}
  // Hanging scroll, spiritual paper seals, jars and a framed shop crest.
  r('#73543a',396,186,91,23);r('#d8c79d',400,187,83,19);c.font='bold 13px serif';c.fillStyle='#40533e';c.textAlign='center';c.fillText('浦 原 商 店',442,202);
  for(let i=0;i<5;i++){r('#e5d9b3',657+i*18,219,11,13);r('#7f5951',660+i*18,222,5,1);r('#7f5951',662+i*18,224,1,5);}
  r('#384c3d',746,381,20,9);oval(c,'#58805a',756,372,12,10);oval(c,'#7d9a62',752,366,8,6);
}
