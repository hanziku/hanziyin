import {deriveFrom,deriveCount,factorsOf,isFactor,isPrime,strokeOf} from './element.js'
let pass=0,test=0;
console.clear();

//獨體字
pass+= isPrime('角');test++;
pass+= !isPrime('京');test++; //京不是獨體字
pass+= isPrime(0x4E00);test++; //可傳UCS4 值

//構字部件
pass+= isFactor('金');test++;
pass+= !isFactor('街');test++; //街不是部件

//筆劃
pass+=strokeOf(' ')==0;test++;  //不是字
pass+=strokeOf('明')==8;test++;
pass+=strokeOf('𪚥')==64;test++; //筆劃最多的

//孳乳
const r=deriveFrom('昭');
pass+=r[0]=='照'.codePointAt(0);test++

//取得構形部件
pass+= factorsOf('萌')[1]=='明';test++  
pass+= factorsOf('萌')[0]==factorsOf('莊')[0];test++ //艹頭

//往下拆分
pass+=factorsOf('盟',true).indexOf('月')>0;test++

//孳乳頻次
pass+=deriveCount('口')==3564;test++;
pass+=deriveCount('木')==3174;test++;
pass+=deriveCount('女')==1766;test++;
pass+=deriveCount('圃')==1;test++;

console.log('')
console.log(`${pass}/${test}`); 