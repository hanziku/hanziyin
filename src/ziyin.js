import {unpack_stroke_type} from './stroke-type.js';
import {forEachRLE} from './rle.js'
     import {primes,idsarr,factors,strokes,breedcount,factors_offset,
        prime_stroketype,factor_stroketype} from './hz_data.js'

import {fibSearch,fibIntersect} from './fibonacci.js';

       //獨體字、構字序、部件、筆划數  , 孳乳數      孳乳數的部件位置 
export const isFactor=cp=>{
    if (typeof cp=='string') cp=cp.codePointAt(0);
    return factorArray.indexOf(cp)>-1;
}

export const isPrime=cp=>{
    if (typeof cp=='string') cp=cp.codePointAt(0);
    return primeArray.indexOf(cp)>-1;
}
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
//取得 多個 code points 的值，比重覆調用 valOf 有較率，因只須遍歷 RLE一次
const valsOf=(cparr,RLE)=>{
    let i=0,found=false;
    let now=cparr[i][0];
    forEachRLE(RLE,(idc,pos,repeat)=>{
        while (pos>now&&i<cparr.length-1) {
            i++;
            now=cparr[i][0];
        }
        if (idc!==0x20 && now>=pos && now<=pos+repeat) {
            cparr[i][1].push(idc);
            found=true;
            if (i==cparr.length-1) return found;
        }
    }) 
    return found;
}

const valOf=(ch,RLE)=>{ //以 ch 的codepoint 為RLE位置的 值 （即ch的構件）
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
    forEachRLE(idsarr[narr],(idc,pos,repeat)=>{
        if (!idc ||idc==0x3000||idc==0x20) return;
        for (let i=pos;i<=pos+repeat;i++) {
            if (idc==partcp) {
                out.push(i);
            }
        }
    }) 
    return out;
}
const getFactor=ch=> {
    const out=[];
    if (Array.isArray(ch)) {
        //array to hold sorted ch and result
        const res=ch.map((c,idx)=>[typeof c=='string'?c.codePointAt(0):c,[],idx]) 
        res.sort((a,b)=>a[0]-b[0]);  //valsOf assuming in codepoint order
        
        for (let i=0;i<idsarr.length;i++) {
            const r=valsOf(res,idsarr[i]);
            if (!r) break;
        }
        res.sort((a,b)=>a[2]-b[2]); //sort back to input order
        return res.filter(item=>!!item[1]).map(item=>[item[0],item[1]]);
    } else {
        for (let i=0;i<idsarr.length;i++) {
            const r=valOf(ch,idsarr[i]);
            if (!r) break;
            out.push(r);
        }
        return out.filter(item=>!!item);
    }
    
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
export const factorsOf=(ch,recursive=false)=>{
    const r= getFactor(ch);
    if (!recursive) return r;
    if (r) {
        if (Array.isArray(ch)) {
            for (let i=0;i<ch.length;i++) {
                const out=[];
                r[i][1].forEach(f=>expandFactor(f,out));
                r[i][1]=out;
            }
            return r;
        } else {
            let out=[];
            r.forEach(f=>expandFactor(f,out));
            return out;
        }
    }
}
//0:bmp, compatibility:1 , compatibility supplement:2
//extension A=3   extension B =10..., pua:30
export const cjkBlock=cp=>{
    if (typeof cp=='string') cp=cp.codePointAt(0);
    if (cp>=0xf900&&cp<=0xfaff) return 1;
    if (cp>=0x2f800&&cp<=0x2fa1f) return 2;

    if (cp>=0x3400&&cp<=0x4dff) return 3;
    if (cp>=0x20000&&cp<=0x2a6df) return 10;//ext b
    if (cp>=0x2a700&&cp<=0x2b73f) return 11;//ext c
    if (cp>=0x2b740&&cp<=0x2b81f) return 12;//ext d
    if (cp>=0x2b820&&cp<=0x2ceaf) return 13;//ext e
    if (cp>=0x2ceb0&&cp<=0x2ebef) return 14;//ext f

    if (cp>=0xE000&&cp<0xF8FF) return 99; //PUA

    return 0;
}
export const cjkBlockName=cp=>{
    const block=cjkBlock(cp);
    return {
        1:'compatibility',  
        2:'compatibility_supliment' ,
        3:'ext-a',
        10:'ext-b',
        11:'ext-c',
        12:'ext-d',
        13:'ext-e',
        14:'ext-f'
    }[block]||'bmp';
}
export const breedOf=(parts,order)=>{
    if (typeof parts=='string') {
        parts=splitUTF32(parts);
    } else if (typeof parts=='number') {
        parts=[parts];
    }
    let out={};
    for (let i=0;i<idsarr.length;i++) {
        for (let j=0;j<parts.length;j++) {
            const o=matchIDC(parts[j],i);
            //為了找重覆的部件，如「木木」，
            //必須構建在構字序列的位置。
            //j+1 是為了和undefined 更好區分
            for (let k=0;k<o.length;k++) {
                const cp=o[k];
                if (!out[cp]) out[cp]=new Array(idsarr.length); 
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
    if (order=='breedcount') {
        out2.sort((a,b)=>breedCount(b)-breedCount(a));
    }
    return out2;
}

export const breedCount=ch=>{ //返回孳乳數量
    if (typeof ch=='number') ch=String.fromCodePoint(ch);
    const idx=factors.indexOf(ch);
    const at=fibSearch(factors_offset, idx);
    if (at>-1 && at<factors_offset.length) return breedcount[at];
    return idx>-1?breedcount[breedcount.length-1]:0;
}
export const primeArray=splitUTF32(primes);
export const factorArray=splitUTF32(factors);
export const factorStrokeCount=[];

//prebuild factorStrokeCount array
forEachRLE(strokes,(val,pos,repeat)=>{
    for (let cp=pos;cp<=pos+repeat;cp++) {
        factorStrokeCount[cp]= val - 0x40;
    }
})

const [stroke1type,stroke2type]=unpack_stroke_type(prime_stroketype);
const [factorStroke1type,factorStroke2type]=unpack_stroke_type(factor_stroketype);

export const strokeCountOf=cp=>{
    if (typeof cp=='string') cp=cp.codePointAt(0);
    if (isFactor(cp)) return factorStrokeCount[cp];
    return valOf(cp,strokes) - 0x40;
}

//0 無分類, 1橫 2撇 3豎 4點捺 5順彎 6逆挑
export const strokeTypeOf=cp=>{ //頭兩個筆劃類型
    if (typeof cp=='string') cp=cp.codePointAt(0);
    let at=factorArray.indexOf(cp);
    // console.log(String.fromCodePoint(cp),at,factorStroke1type[at],factorStroke2type[at])
    if (at>-1) return ""+factorStroke1type[at]+(factorStroke2type[at]||'');
    
    while (cp&&!isPrime(cp)) {
        const f=factorsOf(cp);
        if (f.length) {
            cp=f[0];
        } else break;
    }
    at=primeArray.indexOf(cp);
    if (at>-1) return ""+stroke1type[at]+(stroke2type[at]||'');
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
