import {unpack_stroke_type} from './stroke-type.js';
import {forEachRLE} from './rle.js'
     import {primes,idsarr,factors,strokes,derivecount,factors_offset,
        prime_stroketype} from './hz_data.js'



       //獨體字、構字序、部件、筆划數  , 孳乳數      孳乳數的部件位置 
export const isFactor=cp=>{
    if (typeof cp=='string') cp=cp.codePointAt(0);
    return factorArray.indexOf(cp)>-1;
}

export const isPrime=cp=>{
    if (typeof cp=='string') cp=cp.codePointAt(0);
    return primeArray.indexOf(cp)>-1;
}
const splitUTF32=s=>{ //from pitaka/utils
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


const valOf=(ch,RLE)=>{
    const cp=(typeof ch=='number')?ch:ch.codePointAt(0);
    let out='';
    forEachRLE(RLE,(idc,pos,repeat)=>{
        if (idc!==' ' && cp>=pos && cp<=pos+repeat) {
            out=idc;
            return true;
        }            
    }) 
    return out;
}
export const strokeOf=ch=>{
    return valOf(ch,strokes).codePointAt(0) - 0x40;
}

const matchIDC=(part,npart)=> {
    if (!part.trim())return;
    let out=[];
    forEachRLE(idsarr[npart],(idc,pos,repeat)=>{
        if (idc===part) for (let i=pos;i<=pos+repeat;i++) {
            out.push(i);
        }
    }) 
    return out;
}
const getFactor=(ch, npart)=> {
    const out=[];
    if (typeof npart=='number') {
    } else {
        for (let i=0;i<idsarr.length;i++) {
            out.push(valOf(ch,idsarr[i]));
        }
    }
    return out.filter(item=>!!item);
}

export const factorsOf=(ch,recursive=false)=>{
    const r= getFactor(ch);
    if (r&&recursive) {
        let out=[];
        r.forEach(f=>{
            if (f=='　') return;
            if (isPrime(f)) {
                out.push(f);
            } else {
                const child=factorsOf(f,true);
                if (child.length) out=out.concat( [ f,'(', ...child, ')']);
                else out.push(f)
            }
        })
        return out;
    } else return r;
}
export const deriveFrom=part=>{
    let out=[];
    for (let i=0;i<idsarr.length;i++) {
        const r=matchIDC(part,i);
        if (!r.length)break;
        out=out.concat(r);
    }
    return out;
}

export const deriveCount=ch=>{ //返回孳乳數量
    if (typeof ch=='number') ch=String.fromCodePoint(ch);
    const at=factors.indexOf(ch);
    for (let i=0;i<factors_offset.length;i++) {
        if (factors_offset[i]>=at) {
            return derivecount[i];
        }
    }
    return at>-1?derivecount[derivecount.length-1]:0;
}
export const primeArray=splitUTF32(primes);
export const factorArray=splitUTF32(factors);
const [stroke1type,stroke2type]=unpack_stroke_type(prime_stroketype);

//0 無分類, 1橫 2撇 3豎 4點捺 5順彎 6逆挑
export const strokeTypeOf=ch=>{ //頭兩個筆劃類型
    while (ch&&!isPrime(ch)) {
        const f=factorsOf(ch);
        if (f.length) {
            ch=f[0];
        } else break;
    }
    const at=primeArray.indexOf(ch.codePointAt(0));
    return ""+stroke1type[at]+(stroke2type[at]||'');
}