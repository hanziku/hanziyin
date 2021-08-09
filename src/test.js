import {breedOf,breedCount,factorsOf,isFactor,isPrime,strokeCountOf
,primeArray,factorArray,findFactor,strokeTypeOf} from './ziyin.js'
let pass=0,test=0;
// console.clear();

//獨體字
pass+= isPrime('角');test++;
pass+= !isPrime('京');test++; //京不是獨體字
pass+= isPrime(0x4E00);test++; //可傳UCS4 值

//構字部件
pass+= isFactor('金');test++;
pass+= !isFactor('街');test++; //街不是部件

//筆劃
pass+=strokeCountOf(' ')==0;test++;  //不是字
pass+=strokeCountOf('明')==8;test++;
pass+=strokeCountOf('𪚥')==64;test++; //筆劃最多的

//孳乳
// const r=breedOf('昭');
// pass+=r[0]=='照'.codePointAt(0);test++
//取得構形部件
pass+= factorsOf('萌')[1]=='明'.codePointAt(0);test++  
pass+= factorsOf('萌')[0]==factorsOf('莊')[0];test++ //艹頭

//往下拆分
pass+=factorsOf('盟',true).indexOf('月'.codePointAt(0))>0;test++

//孳乳頻次
// console.log('圃',breedCount('圃'))
pass+=breedCount('口')==3564;test++;
pass+=breedCount('木')==3174;test++;
pass+=breedCount('女')==1766;test++;
pass+=breedCount('圃')==1;test++;

// const rr=breedOf('立').filter(isFactor).sort((a,b)=>breedCount(b)-breedCount(a));
// console.log(rr.map(i=>i.toString(16)+String.fromCharCode(i)+'('+breedCount(i)+') ').join(''))
// pass+=factorArray().filter(isPrime).length<primeArray().length;test++

// //獨體字
pass+=strokeTypeOf('口')=='35';test++
pass+=strokeTypeOf('一')=='10';test++;
pass+=strokeTypeOf('豕')=='12';test++;
pass+=strokeTypeOf('林')=='13';test++;
pass+=strokeTypeOf('說')=='41';test++;
pass+=strokeTypeOf('如')=='62';test++;
pass+=strokeTypeOf('龍')=='41';test++;

//同時找多個序列, 避免重覆跑 forEachRLE 
const r_factorOf_arr=factorsOf(['苗','杉']);
pass+=r_factorOf_arr[0][1][1]=='田'.codePointAt(0); test++ //苗 第二構件
pass+=r_factorOf_arr[1][1][0]=='木'.codePointAt(0); test++ //杉 第一構件

// console.time('findfactor')
// const rr=findFactor(2,0,12);
// console.timeEnd('findfactor')
// //console.log('㇓',strokeCountOf('㇓'));
// console.log(rr.map(item=>String.fromCodePoint(item)))
// console.log(rr.length)

pass+=breedOf('隗')[0]==0x3815 ;test++
pass+=breedCount('駕')==breedCount('駕');test++;
pass+=breedOf('畾').length==breedCount('畾');test++;
pass+=breedOf('口木')[0]=='㕲'.codePointAt(0);test++
pass+=breedOf('木口')[0]=='杏'.codePointAt(0);test++

console.log(breedOf('木',{order:'breedcount'}).slice(0,20).map(item=>String.fromCharCode(item)))

console.log(`${pass}/${test}`); 
