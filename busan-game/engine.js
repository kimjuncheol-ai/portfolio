(function(root){
'use strict';
const W=1200,H=600, FLOOR=512;
const foods={milmyeon:{name:'밀면',icon:'🍜',color:'#72ecdb'},gukbap:{name:'돼지국밥',icon:'🍲',color:'#ffb47e'},hotteok:{name:'씨앗호떡',icon:'🥮',color:'#ffde70'}};
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function makeLevel(n){
 const gaps=n===0?[[850,960],[1800,1930],[2850,2980]]:[[710,835],[1530,1670],[2400,2540],[3090,3220]];
 const length=n===0?3700:3950;const platforms=[];let start=0;
 for(const [a,b] of gaps){platforms.push({x:start,y:FLOOR,w:a-start,h:88,ground:true});start=b;}platforms.push({x:start,y:FLOOR,w:length-start,h:88,ground:true});
 const ledges=n===0?[[380,410,150],[650,335,135],[1090,405,170],[1430,330,150],[2040,410,165],[2360,345,150],[2650,410,120],[3160,405,180]]:[[330,410,150],[565,330,130],[980,405,180],[1310,325,145],[1780,410,150],[2090,325,150],[2640,405,150],[2910,340,140],[3400,400,175]];
 for(const [x,y,w]of ledges)platforms.push({x,y,w,h:26,ground:false});
 const items=[];let id=0;
 for(const p of platforms.filter(p=>!p.ground))for(let k=0;k<3;k++)items.push({id:id++,type:'coin',x:p.x+24+k*38,y:p.y-49,w:20,h:24,taken:false});
 for(const p of platforms.filter(p=>p.ground))for(let x=p.x+150;x<p.x+p.w-90;x+=230)items.push({id:id++,type:'coin',x,y:FLOOR-55,w:20,h:24,taken:false});
 const meals=n===0?[[245,'milmyeon'],[1180,'gukbap'],[1990,'hotteok'],[2490,'milmyeon'],[3080,'gukbap']]:[[250,'gukbap'],[1010,'milmyeon'],[1730,'hotteok'],[2590,'gukbap'],[3320,'hotteok']];
 for(const [x,type]of meals)items.push({id:id++,type,x,y:FLOOR-49,w:34,h:34,taken:false});
 const enemies=(n===0?[650,1330,1600,2230,2750,3350]:[540,1130,1380,1950,2240,2810,3490,3660]).map((x,i)=>({x,y:FLOOR-30,w:38,h:30,origin:x,dir:i%2?1:-1,dead:false}));
 return{n,length,platforms,items,enemies,checkpoint:n===0?2010:1750,goal:length-145};
}
class Game{
 constructor(onEvent=()=>{}){this.onEvent=onEvent;this.reset();this.state='ready';}
 reset(){this.stage=0;this.score=0;this.time=0;this.totalFoods=0;this.deaths=0;this.load(0);this.state='playing';}
 load(n){this.stage=n;this.level=makeLevel(n);this.player={x:70,y:400,w:30,h:46,vx:0,vy:0,hp:3,grounded:false,facing:1,speed:0,power:0,hurt:0,coyote:0,jumpBuffer:0};this.camera=0;this.checkpoint=false;this.jumpHeld=false;this.state='playing';}
 event(type,data={}){this.onEvent(type,data);}
 eat(item){if(item.taken)return;item.taken=true;const p=this.player;if(item.type==='coin'){this.score+=10;this.event('coin');return;}this.score+=100;this.totalFoods++;if(item.type==='milmyeon')p.speed=8;if(item.type==='gukbap')p.power=8;if(item.type==='hotteok')p.hp=Math.min(3,p.hp+1);this.event('food',{type:item.type});}
 damage(fall=false){const p=this.player;if(!fall&&(p.hurt>0||p.power>0))return;p.hp--;p.hurt=1.6;this.event('hurt');if(p.hp<=0){this.state='over';this.event('over');return;}if(fall){p.x=this.checkpoint?this.level.checkpoint+15:70;p.y=400;p.vy=0;p.vx=0;p.grounded=false;this.deaths++;}else{p.vy=-260;p.vx=-p.facing*230;}}
 retry(){this.load(this.stage);}
 next(){if(this.stage===0)this.load(1);}
 update(dt,input={}){
 if(this.state!=='playing')return;dt=Math.min(dt,1/30);this.time+=dt;const p=this.player,l=this.level;
 for(const key of ['speed','power','hurt'])p[key]=Math.max(0,p[key]-dt);
 p.coyote=p.grounded?.11:Math.max(0,p.coyote-dt);p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
 if(input.jump&&!this.jumpHeld)p.jumpBuffer=.13;
 if(!input.jump&&this.jumpHeld&&p.vy<-210)p.vy=-210;
 this.jumpHeld=!!input.jump;
 const axis=(input.right?1:0)-(input.left?1:0),maxSpeed=p.speed>0?405:270;
 if(axis)p.facing=axis;p.vx+=(axis*maxSpeed-p.vx)*Math.min(1,dt*(axis?13:18));
 if(p.jumpBuffer>0&&p.coyote>0){p.vy=-625;p.grounded=false;p.coyote=0;p.jumpBuffer=0;this.event('jump');}
 const oldBottom=p.y+p.h;p.x=Math.max(0,Math.min(l.length-p.w,p.x+p.vx*dt));p.vy=Math.min(950,p.vy+1700*dt);p.y+=p.vy*dt;p.grounded=false;
 for(const platform of l.platforms){if(p.x+p.w>platform.x&&p.x<platform.x+platform.w&&oldBottom<=platform.y+1&&p.y+p.h>=platform.y&&p.vy>=0){p.y=platform.y-p.h;p.vy=0;p.grounded=true;}}
 if(p.y>H+90){this.damage(true);if(this.state!=='playing')return;}
 for(const item of l.items)if(!item.taken&&overlap(p,item))this.eat(item);
 for(const e of l.enemies){if(e.dead)continue;e.x+=e.dir*(this.stage?65:48)*dt;if(Math.abs(e.x-e.origin)>48)e.dir*=-1;if(overlap(p,e)){if(p.power>0||(p.vy>60&&oldBottom<e.y+15)){e.dead=true;this.score+=50;if(p.power<=0)p.vy=-395;this.event('stomp');}else this.damage();}}
 if(!this.checkpoint&&p.x>=l.checkpoint){this.checkpoint=true;this.event('checkpoint');}
 this.camera=Math.max(0,Math.min(l.length-W,p.x-W*.32));
 if(p.x>=l.goal){this.state=this.stage===0?'transition':'won';this.score+=500;this.event(this.state);}
 }
 snapshot(){return{state:this.state,stage:this.stage+1,score:this.score,health:this.player.hp,foods:this.totalFoods,progress:Math.round(this.player.x/this.level.goal*100)};}
}
const api={Game,makeLevel,overlap,foods,W,H,FLOOR};if(typeof module!=='undefined')module.exports=api;root.BusanEngine=api;
})(typeof window!=='undefined'?window:globalThis);
