export const isFactor=cp=>{
    if (typeof cp=='string') cp=cp.codePointAt(0);
    return factorArray.indexOf(cp)>-1;
}

export const isPrime=cp=>{
    if (typeof cp=='string') cp=cp.codePointAt(0);
    return primeArray.indexOf(cp)>-1;
}
export const prebuildStrokeCount=()=>{
    forEachRLE(strokes,(val,pos,repeat)=>{
        for (let cp=pos;cp<=pos+repeat;cp++) {
            factorStrokeCount[cp]= val - 0x40;
        }
    })    
}

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
export const breedCount=ch=>{ //返回孳乳數量，
    //孳乳數快迅收歛，後面一大批部件只有幾個孳乳，沒有必要每個部件都存其孳乳數
        if (typeof ch=='number') ch=String.fromCodePoint(ch);
        const idx=factors.indexOf(ch);
        const at=fibSearch(factors_offset, idx);
        if (at>-1 && at<factors_offset.length) return breedcount[at];
        return idx>-1?breedcount[breedcount.length-1]:0;
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