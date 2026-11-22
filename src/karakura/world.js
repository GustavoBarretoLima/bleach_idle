import {paintMapGround} from '../world/map-data.js';
import {paintCityDetails,paintFacade,paintTreeBases} from '../world/scenery.js';
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
export function paintKarakura(c, {separateGround=false}={}) {
  if (!separateGround) paintMapGround(c,'city');
  paintCityDetails(c);
  for(const building of landmarks) paintFacade(c,building);
  paintTreeBases(c,!separateGround);
}
