import {deriveFrom,deriveCount,factorsOf,isFactor,isPrime,strokeOf
,primeArray,factorArray,strokeTypeOf} from './ziyin.js'
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

// const rr=deriveFrom('立').filter(isFactor).sort((a,b)=>deriveCount(b)-deriveCount(a));
// console.log(rr.map(i=>i.toString(16)+String.fromCharCode(i)+'('+deriveCount(i)+') ').join(''))
// pass+=factorArray().filter(isPrime).length<primeArray().length;test++

//獨體字
pass+=strokeTypeOf('口')=='35';test++
pass+=strokeTypeOf('一')=='10';test++;
pass+=strokeTypeOf('豕')=='12';test++;

pass+=strokeTypeOf('林')=='13';test++;
pass+=strokeTypeOf('說')=='41';test++;
pass+=strokeTypeOf('如')=='62';test++;

// console.log(rr)
console.log(`${pass}/${test}`); 

/*
[
  '禾', '林', '林', '來', '果', '枼', '喿', '柔', '桑', '呆',
  '采', '某', '樂', '栗', '术', '休', '困', '朵', '集', '㏋',
  '朶', '棥', '臬', '棥', '殺', '查', '桀', '枚', '枲', '松',
  '相', '柰', '析', '宋', '条', '桼', '梨', '渠', '罙', '榮',
  '閑', '亲', '條', '杏', '棠', '杲', '森', '床', '柴', '㏼',
  '',  '梁', '札', '杜', '枝', '査', '梟', '雜', '㐩', '村',
  '杳', '格', '鬱', '架', '棐', '鬱', '楽', '楙', '楙', '枯',
  '㎼', '㭊', '杉', '李', '楊', '㚓', '㦿', '㮚', '枽', '槖',
  '㐉', '柱', '根', '桂', '椎', 'ባ',  '䂞', '桒', '棃', '槀',
  '欒', '沐', '牀', '㐥', '㑦', '�',  '�',  '彬', '㮊', '朴',
  ... 248 more items
]
17/17
*/