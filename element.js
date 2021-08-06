import {forEachRLE} from './rle.js'
     
import {primes,idsarr,factors,strokes,derivecount,factors_offset} from './hz_data.js'
       //獨體字、構字序、部件、筆划數  , 孳乳數      孳乳數的部件位置 
export const isFactor=ch=>{
    if (typeof ch=='number') ch=String.fromCodePoint(ch);
    return factors.indexOf(ch)>-1;
}

export const isPrime=ch=>{
    if (typeof ch=='number') ch=String.fromCodePoint(ch);
    return primes.indexOf(ch)>-1;

}

export const strokeOf=ch=>{
    return valOf(ch,strokes).codePointAt(0) - 0x40;
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
const matchIDC=(part,npart)=> {
    if (!part.trim())return;
    let out=[];
    forEachRLE(idsarr[npart],(idc,pos,repeat)=>{
        if (idc===part) for (let i=pos;i<=pos+repeat;i++) {
            out.push(pos);
        }
    }) 
    return out;
}
const getComp=(ch, npart)=> {
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
    const r= getComp(ch);
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