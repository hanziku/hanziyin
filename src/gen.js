import { packRLE,codePointLength,forEachUTF32} from "pitaka/utils";
import { readFileSync,writeFileSync } from "fs";
//from https://github.com/cjkvi/cjkvi-ids
const rawIDS=readFileSync('../3rdparty/ids.txt','utf8').split(/\r?\n/);
const rawStrokes=readFileSync('../3rdparty/ucs-strokes.txt','utf8').split(/\r?\n/); //from Unihan

const comp_hz={};
const primes=[];
const region_code={};
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
    const m=line.match(/U\+[\dA-F]{4,5}\t(.)\t(.+)/u);
    if (!m) throw line

    const [m0,hz,raw]=m;
    if (hz==raw) {
        primes.push(hz);//    ('末級部件',hz)
        return;
    }
    let ids=raw.replace(/[\u2ff0-\u2fff]/g,'');;
    
    if (ids.indexOf('\t')>0) {
        ids=ids_byregion(ids);
        multicount++;
    } else {
        ids=ids.replace(/\[(.+?)\]/g,'');//只有一種拆法，但也標記區碼
    }
    let partcount=0;
    forEachUTF32(ids,ch=>{
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
const dump_comp_hz=write=>{
    const out=[];
    for (let ch in comp_hz) {
        // comp_hz[ch].sort((a,b)=>a-b);
        // out.push(ch +'\t'+pack_delta(comp_hz[ch]))
        out.push(ch +'\t'+comp_hz[ch])
    }
    out.sort((a,b)=>b.length-a.length)    
    if (write) writeFileSync('comp.txt',out.join('\n'),'utf8');
}
// console.log(region_code)
// dump_comp_hz(true)
const strokes={};
const dump_strokes=()=>{
    let out=[],prev=1;
    rawStrokes.forEach(line=>{
        const m=line.match(/U\+[\dA-F]{4,5}\t(.)\t(.+)/u);
        if (!m) return;
        let stroke;
        if (m[2].indexOf(',')>-1) {//check if same stroke as prev char
            const possible_strokes=m[2].split(',').map(item=>parseInt(item));
            const at=possible_strokes.indexOf(prev);
            if (at==-1) stroke=possible_strokes[0];
            else stroke=prev;
        } else {
            stroke=parseInt(m[2]);
        }
        const cp=m[1].codePointAt(0);
        out[cp]=String.fromCharCode(0x40+stroke);
        if (!strokes[stroke]) strokes[stroke]=0;
        strokes[stroke]++;
        prev=stroke;
    })
    for (let i=0;i<out.length;i++) {
        if (!out[i]) out[i]='@' //0x40
    }
    const s=out.join('');
    return packRLE(s);
}

const dump_data=write=>{
    const out=[];
    for (let i=0;i<idsarr.length;i++) {
        const partarr= idsarr[i];
        for (let j=0;j<partarr.length;j++) {
            //補空白，這樣位置才可以對回 hz 
            if (typeof partarr[j]=='undefined') partarr[j]=' ';
        }
        out.push( packRLE(idsarr[i].join('')));
    }

    //部件統計
    let factorarr=[];
    for (let part in comp_hz) {
        const derived=codePointLength(comp_hz[part]);
        if (part!=='　') factorarr.push([part,derived])
    }    
    factorarr.sort((a,b)=>b[1]-a[1]);
    // console.log(factorarr)

    //依部件所在的位置(ucs2)，得到孳乳的數量，即快速知道某個部件可以組多少個字。
    let factors='',prev=0;
    const derivecount=[],offsets=[];
    for (let i=0;i<factorarr.length;i++) {
        if (prev!==factorarr[i][1]) {
            offsets.push(factors.length);
            derivecount.push(factorarr[i][1]);
        }
        prev=factorarr[i][1];
        factors+=factorarr[i][0];
    }

    // console.log(derivecount,offsets)
    const strokes=dump_strokes();
    if (write) writeFileSync('hz_data.js',
    'export const primes="'+primes.join('')+'"\n'+
    'export const factors="'+factors+'"\n'+ //全形空白只是分隔符
    'export const strokes="'+strokes.replace(/\\/g,'\\\\')+'"\n'+
    'export const derivecount='+JSON.stringify(derivecount)+'\n'+
    'export const factors_offset='+JSON.stringify(offsets)+'\n'+
    'export const idsarr=`'+out.join('\n')+'`.split(/\\r?\\n/);','utf8');
}
dump_data(true)


// console.log(strokes) , 大於 52 的很少 52:1, 53:1,60:1,64:1
console.log(`${count} ${multicount}`);
console.log(` 最長IDS${maxpart} ${maxpart_hz.codePointAt(0).toString(16)}`);
