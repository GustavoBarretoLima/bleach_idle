// Rebuild the initial Tiled maps. After editing maps in Tiled, do not rerun unless regenerating intentionally.
import {writeFileSync} from 'node:fs';
const width=70,height=40,size=16;
function create(name,fill){return {compressionlevel:-1,height,infinite:false,layers:[{data:Array(width*height).fill(fill),height,id:1,name:'Ground',opacity:1,type:'tilelayer',visible:true,width,x:0,y:0}],nextlayerid:3,nextobjectid:1,orientation:'orthogonal',renderorder:'right-down',tiledversion:'1.10.2',tileheight:size,tilesets:[{columns:10,firstgid:1,image:'../terrain.svg',imageheight:16,imagewidth:160,margin:0,name:'Karakura',spacing:0,tilecount:10,tileheight:16,tilewidth:16}],tilewidth:size,type:'map',version:'1.10',width,properties:[{name:'location',type:'string',value:name}]};}
function rect(map,x,y,w,h,tile){for(let j=0;j<height;j++)for(let i=0;i<width;i++){const px=i*16+8,py=j*16+8;if(px>=x&&px<x+w&&py>=y&&py<y+h)map.layers[0].data[j*width+i]=tile;}}
function objects(map,items){map.layers.push({draworder:'topdown',id:2,name:'Atmosphere',objects:items.map((item,i)=>({height:0,id:i+1,name:item.name,point:true,rotation:0,type:item.type,visible:true,width:0,x:item.x,y:item.y})),opacity:1,type:'objectgroup',visible:true,x:0,y:0});map.nextobjectid=items.length+1;}
const city=create('city',10);
rect(city,160,40,800,560,1);
for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(city.layers[0].data[y*width+x]===1&&(x*13+y*7)%5===0)city.layers[0].data[y*width+x]=2;
for(const [x,y,w,h] of [[170,187,640,36],[170,412,640,36],[170,552,640,28],[440,50,30,530],[350,170,28,280],[780,50,28,530]]){rect(city,x-6,y-6,w+12,h+12,4);rect(city,x,y,w,h,5);}
rect(city,809,40,84,560,3);rect(city,815,40,72,560,6);rect(city,902,50,18,532,4);
for(const y of [205,430])rect(city,807,y-18,88,36,4);
rect(city,485,455,135,82,4);rect(city,496,466,112,58,1);rect(city,547,460,12,74,3);rect(city,492,490,121,12,3);
objects(city,[{name:'Onose',type:'water',x:851,y:320},...[{x:390,y:233},{x:470,y:240},{x:770,y:390},{x:320,y:448},{x:770,y:550}].map((p,i)=>({...p,name:'Poste '+(i+1),type:'lamp'}))]);
const shop=create('shop',10);rect(shop,328,180,464,280,7);rect(shop,536,309,236,93,8);
objects(shop,[{name:'Lanterna balcão',type:'lantern',x:425,y:240},{name:'Lanterna tatami',type:'lantern',x:652,y:318},{name:'Saída',type:'door',x:552,y:432},{name:'Alçapão',type:'door',x:720,y:280}]);
for(const [name,map] of Object.entries({karakura:city,urahara:shop})){
  const rows=Array.from({length:height},(_,row)=>map.layers[0].data.slice(row*width,(row+1)*width).join(','));
  const output=JSON.stringify(map,null,2).replace(/"data": \[[\s\S]*?\]/,'"data": [\n        '+rows.join(',\n        ')+'\n      ]');
  writeFileSync(new URL('../src/world/maps/'+name+'.json',import.meta.url),output+'\n');
}
