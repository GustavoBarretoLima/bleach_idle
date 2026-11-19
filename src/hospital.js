export const hospital = {
  center:{x:560,y:320},
  bounds:{left:328,top:200,right:792,bottom:442},
  entrance:{x:552,y:405},
  exit:{x:560,y:427},
  spawn:{x:560,y:400},
  desk:{x:355,y:265,width:122,height:26},
  benches:[
    {x:357,y:337,width:85,height:18},
    {x:357,y:368,width:85,height:18}
  ],
  partition:[
    {x:616,y:231,width:10,height:83},
    {x:616,y:368,width:10,height:60}
  ],
  beds:[
    {x:704,y:248,width:62,height:30},
    {x:704,y:303,width:62,height:30},
    {x:704,y:358,width:62,height:30}
  ]
};

const furniture = [hospital.desk,...hospital.benches,...hospital.partition,...hospital.beds];

export function hospitalWalkable(x,y) {
  const {left,top,right,bottom}=hospital.bounds;
  return x>=left+11 && x<=right-11 && y>=top+37 && y<=bottom-11 &&
    !furniture.some(rect=>x>rect.x-5 && x<rect.x+rect.width+5 && y>rect.y-4 && y<rect.y+rect.height+4);
}
