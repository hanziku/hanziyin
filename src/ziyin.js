import {forEachRLE} from './rle.js'
let idsmap=[]; //in ptk
export const splitUTF32=s=>{ //from pitaka/utils
    let i=0;
    const out=[]
    while (i<s.length) {
        const code=s.codePointAt(i);
        out.push(code);
        i++;
        if (code>0xffff) i++;
    }
    return out;
}
const valOf=(ch,RLE)=>{ //以 ch 的codepoint 為RLE位置的 值 （即ch的構件）, RLE 位置可放UTF32
    const cp=(typeof ch=='number')?ch:ch.codePointAt(0);
    let out='';
    forEachRLE(RLE,(idc,pos,repeat)=>{
        if (idc!==0x20 && cp>=pos && cp<=pos+repeat) {
            out=idc;
            return true;
        }            
    }) 
    return out;
}
const matchIDC=(part,narr)=> {
    let partcp=part;
    if (typeof part=='string')  partcp=part.trim().codePointAt(0);
    if (!partcp)return;
    let out=[];
    forEachRLE(idsmap[narr],(idc,pos,repeat)=>{
        if (!idc ||idc==0x3000||idc==0x20) return;
        for (let i=pos;i<=pos+repeat;i++) {
            if (idc==partcp) {
                out.push(i);
            }
        }
    }) 
    return out;
}
const getFactor=(ch,variant)=> {
    let out=[];
    for (let i=0;i<idsmap.length;i++) {
        const r=valOf(ch,idsmap[i]);
        if (!r) break;
        if (r==0x3000 && !variant) break;
        out.push(r);
    }
    return out.filter(item=>!!item);
}
const expandFactor=(f,out)=>{
    if (f=='　') return;
    if (isPrime(f)) {
        out.push(f);
    } else {
        const child=factorsOf(f,true);
        out.push(f)
        if (child.length) {
            out.push(1); //level down
            out.push(...child);
            out.push(-1); //level up
        }
    }
}
const factorsCache={}; //加快常用拆分的解構。
export const factorsOf=(ch,opts={})=>{
    const deep=opts.deep;
    const variant=opts.variant;
    if (!deep && !variant && factorsCache[ch]) return factorsCache[ch];

    const r= getFactor(ch,variant);
    if (!deep && !variant && !factorsCache[ch]) factorsCache[ch]=r;
    if (!deep) {
        return opts.ids?r.map(cp=>String.fromCodePoint(cp)).join(''):r;
    }
    if (r) {
        let out=[];
        r.forEach(f=>expandFactor(f,out));
        return out;
    }
}
//0:bmp, compatibility:1 , compatibility supplement:2
//extension A=3   extension B =10..., pua:30
export const cjkBlock=cp=>{
    if (typeof cp=='string') cp=cp.codePointAt(0);
    if (cp>=0x4E00&&cp<=0x9FEF) return 0; //bmp
    if (cp>=0xf900&&cp<=0xfaff) return 1; //compatible
    if (cp>=0x2f800&&cp<=0x2fa1f) return 2;  //supliment
    if (cp>=0x3400&&cp<=0x4dff) return 3;   //ext a
    if (cp>=0x20000&&cp<=0x2a6df) return 10;//ext b
    if (cp>=0x2a700&&cp<=0x2b73f) return 11;//ext c
    if (cp>=0x2b740&&cp<=0x2b81f) return 12;//ext d
    if (cp>=0x2b820&&cp<=0x2ceaf) return 13;//ext e
    if (cp>=0x2ceb0&&cp<=0x2ebef) return 14;//ext f
    if (cp>=0x30000&&cp<=0x3134A) return 15;//ext g
    if (cp>=0x31350&&cp<=0x323AF) return 16;//ext h
    if (cp>=0xA0000&&cp<=0xD4FFF) return 20;//ext z ebag

    if (cp>=0xE000&&cp<0xF8FF) return 41; //PUA
    if (cp>=0x40000&&cp<0x4FFFF) return 42; //CHISE PUA

    return 0; //bmp
}
export const cjkBlockNames={
    0:'BMP',
    1:'compatibility',  
    2:'compatibility_supliment' ,
    3:'ext-a',
    10:'ext-b',11:'ext-c',12:'ext-d',13:'ext-e',14:'ext-f',15:'ext-g',16:'ext-h',
    30:'ext-z', //ebag
    20:'seal',
    41:'PUA',
    42:'chise',
}
export const cjkBlockOf=cp=>{
    const block=cjkBlock(cp);
    return cjkBlockNames[block]||'bmp';
}
export const breedOf=(parts)=>{
    if (typeof parts=='string') {
        parts=splitUTF32(parts);
    } else if (typeof parts=='number') {
        parts=[parts];
    }
    let out={};
    for (let i=0;i<idsmap.length;i++) {
        for (let j=0;j<parts.length;j++) {
            const o=matchIDC(parts[j],i);
            //為了找重覆的部件，如「木木」，
            //必須構建在構字序列的位置。
            //j+1 是為了和undefined 更好區分
            for (let k=0;k<o.length;k++) {
                const cp=o[k];
                if (!out[cp]) out[cp]=new Array(idsmap.length); 
                if (!out[cp][i]) out[cp][i]=0;
                out[cp][i]= out[cp][i] | (1<<j);  // 
            }
        }
    }
    const out2=[];

    //TODO 處理 不同的拆法，會令次序改變
    for (let cp in out) { //按出現的順序 , 「木口」 和 「口木」結果不同
        let partidx=0;
        for (let j=0;j<out[cp].length;j++) { //11 圈
            const flag=out[cp][j];
            if (!flag)continue;
            if ((flag & (1<<partidx))) {
                partidx++;
            }
        }
        if (partidx==parts.length) out2.push(parseInt(cp));
    }
    out2.sort((a,b)=>cjkBlock(a)-cjkBlock(b));

    return out2;
}

export const findFactor=(stk1='',stk2='',stkcount1=0,stkcount2=0)=>{
    return factorArray.filter((factor,idx)=>{
        const st1=factorStroke1type[idx];
        const st2=factorStroke2type[idx];
        let m=true;
        if (stkcount2<stkcount1) stkcount2=stkcount1;
        if (stk1) stk1=''+stk1;
        if (stk2) stk2=''+stk2;
        if (stk1) m = m&& st1===stk1;
        if (m&&stk2) m = m&& st2==stk2;
        if (m&&stkcount1) m = m && factorStrokeCount[factor]>=stkcount1;
        if (m&&stkcount2) m = m && factorStrokeCount[factor]<=stkcount2;
        return m;
    })
}
//group by extension 
export const groupExtension=(arr,convertstr)=>{
    const extensions=[];
    for (let i=0;i<arr.length;i++) {
        const ext=cjkBlock(arr[i]);
        if (!extensions[ext])extensions[ext]=[];
        extensions[ext].push(convertstr?String.fromCodePoint(arr[i]):arr[i])
    }
    return extensions;
}

export const loadIDSMap=_idsmap=>{
    idsmap=_idsmap;

}