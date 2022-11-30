/* 生成 off 格式 */

import {nodefs,writeChanged,readTextContent, readTextLines,fromObj
    , codePointLength,forEachUTF32, splitUTF32Char, bsearch } from 'ptk/nodebundle.cjs'; //ptk/pali
    await nodefs; //export fs to global
import { packRLE} from "./src/packstr.js"; //Run Length Encoded string 压缩有重复出现的字符串
import errata from './src/errata.js' //修補 ids.txt 的错误
const idsfilenames=['IDS-UCS-Basic.txt','IDS-UCS-Compat-Supplement.txt','IDS-UCS-Compat.txt',
'IDS-UCS-Ext-A.txt','IDS-UCS-Ext-B-1.txt','IDS-UCS-Ext-B-2.txt','IDS-UCS-Ext-B-3.txt','IDS-UCS-Ext-B-4.txt',
'IDS-UCS-Ext-B-5.txt','IDS-UCS-Ext-B-6.txt','IDS-UCS-Ext-C.txt','IDS-UCS-Ext-D.txt','IDS-UCS-Ext-E.txt',
'IDS-UCS-Ext-F.txt','IDS-UCS-Ext-G.txt','IDS-UCS-Ext-H.txt'];
//from https://gitlab.chise.org/CHISE/ids

const charset=splitUTF32Char(readTextContent('ebagglyphs.txt'))||[];
let rawIDS=[];
idsfilenames.forEach(fn=>{
    const lines=readTextLines('chise/'+fn);
    lines.shift();
    rawIDS=rawIDS.concat(lines);
})
// const rawIDS=readFileSync('./chise/ids.txt','utf8').split(/\r?\n/);

const comp_hz={};
const primes=[];
const region_code={};
let entitycount=0;
const entities={};//&CDP and so on
const outdir='off/';
const idsarr=new Array(11); //IDS 最多11 個部件 //U+21518	𡔘

for (let i=0;i<idsarr.length;i++) idsarr[i]=[];

//{G:2661,T:2714,K:1903,V:458,J:1500,X:356,H:33,A:11,O:19,U:163,M:1,S:2}         
//const comp_variants={}; //異體認同部件
const ids_byregion=idsstr=>{
//計算區域
    const arrids=idsstr.replace(/\[(.+?)\]/g,(m,m1)=>{
        for (let i=0;i<m1.length;i++) {
            if (!region_code[m1[i]]) region_code[m1[i]]=0;
            region_code[m1[i]]++
        }
        return '';
    })
//U+4C62	䱢	⿰魚争[G]	⿰魚爭[T]  //國標優先
//  output: 魚争　爭  
    let out='';     
    arrids.split(/\t/).forEach(subids=>{
        forEachUTF32(subids,ch=>{ //去掉重複的部件
            if (out.indexOf(ch)==-1) out+=ch;
        })
        //避免 U+5912	夒  過長。全形空白後含有異體部件
        if (out.indexOf('　')==-1) out+='　';
    });
    return out;
}

let count=0,multicount=0, maxpart=0 , maxpart_hz='';
rawIDS.forEach(line=>{
    if (!line||line[0]=="#")return;
    line=line.replace('"',''); //fixing U+2AAC9	𪫉	⿰⿳日亠早彡[T]	⿰彦彡[O]"
    const m=line.match(/U[-\+]([A-F\d]{4,8})\t([^\t]+)\t(.+)/u);
    
    if (!m) throw line
    
    let [m0,uni,hz0,raw]=m;
    //some time hz0 is not a char 
    let hz=String.fromCodePoint(parseInt(uni,16));
    const at=bsearch(charset,hz);
    if (charset[at]!==hz) {
        return;
    }
    
    if (hz==raw || !raw) {
        primes.push(hz);//    ('末級部件',hz)
        return;
    }
    if (errata[hz]) {
        console.log('fix ids',hz,raw,errata[hz])
        raw=errata[hz];
    }
    
    let ids=raw.replace(/[\u2ff0-\u2fff]/g,'').replace(/@apparent.+/,''); //drop apparent
    
    ids=ids.replace(/&([^;]+);/g,(m,m1)=>{
        if (!entities[m1]) entities[m1]=[++entitycount,0];
        entities[m1][1]++;
        return String.fromCodePoint(0x40000+entitycount); //temporary entity encoding
    })

    if (ids.indexOf('\t')>0) {
        ids=ids_byregion(ids,hz);
        multicount++;
    } else {
        ids=ids.replace(/\[(.+?)\]/g,'');//只有一種拆法，但也標記區碼
    }
    if (!ids.trim()) {
        console.log('empty line',raw)
        return;
    }

    let partcount=0;
    forEachUTF32(ids,ch=>{
        if (partcount>=idsarr.length) {
            console.log(ids,ch)
        }
        idsarr[partcount][ hz.codePointAt(0) ] = ch;
        partcount++
        if (!comp_hz[ch]) comp_hz[ch]='';
        comp_hz[ch]+=hz;
    })
    if (partcount>maxpart){
        maxpart_hz=hz;
        maxpart=partcount
    } 
    count++;
})

const dump_data=write=>{
    const out=[];
    out.push('^:<type=tsv name=idsmap preload=true>\tids=string')
    for (let i=0;i<idsarr.length;i++) {
        const partarr= idsarr[i];
        for (let j=0;j<partarr.length;j++) {
            //補空白，這樣位置才可以對回 hz 
            if (typeof partarr[j]=='undefined') partarr[j]=' ';
        }
        out.push(i+'\t'+packRLE(idsarr[i].join('')));
    }
    writeChanged(outdir+'idsmap.tsv',out.join('\n'),true)
}
dump_data(true)


// console.log(strokes) , 大於 52 的很少 52:1, 53:1,60:1,64:1
console.log(`${count} ${multicount}`);
console.log(` 最長IDS${maxpart} ${maxpart_hz.codePointAt(0).toString(16)}`);
