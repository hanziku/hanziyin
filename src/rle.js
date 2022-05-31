//遍歷壓縮字串的每個元素，元素是一個 UTF32 字元
//回呼 字元, 所在位置以及重覆次數。
export const forEachRLE=(str,cb)=>{ //copy from pitaka/utils/rlestr.js
    if (!str)return str;
    let i=1,ch=String.fromCodePoint(str.codePointAt(0)),repeat=0,pos=0,done=false;
    
    while (i<str.length) {
        let code=str.codePointAt(i);
        if (code==0x30) { //invalid zero at the begining , maybe as a separator
            i++;continue;
        } 
        while (i<str.length&&code>=0x30&&code<=0x39) {
            i++;
            repeat=repeat*10+(code-0x30);
            code=str.codePointAt(i)
        }
        if (cb(ch.codePointAt(0),pos,repeat)) {
            done=true;
            break; //ch 在 pos 出現，又重覆了 repeat 次
        }
        if (repeat) pos+=repeat;
        ch=String.fromCodePoint(str.codePointAt(i));
        
        repeat=0;
        i++;
        if (code>0xffff) i++;
        pos++; 
    }
    if (!done) cb(ch.codePointAt(0),pos,repeat)
}


//效率地儲存含大量的空白的長字串
//巾巾巾巾巾巾㚖巾  ==> 巾5㚖巾
//except any character but number
export const packRLE=str=>{  //連續出現的字，以數字替代  
    let i=1,s='',prev=str[0],repeat=0;
    //不必考慮 surrogate ，連續出現的機率不大
    while (i<str.length) {
        const cp=str.codePointAt(i)
        const ch=String.fromCodePoint(cp);
        if (cp>=0x30 && cp<=0x39) throw "cannot have number in RLE string"
        if (ch===prev) {
            repeat++;
        } else {
            s+=prev;
            if (repeat) s+=repeat;
            repeat=0;
        }
        prev=ch;
        if (cp>0xffff) i++;
        i++;
    }
    s+=prev;
    return s;
}
export const unpackRLE=str=>{
    if (!str)return str;
    let s='',i=0,prev=str[0],repeat=0;
    
    while (i<str.length) {
        let code=str.charCodeAt(i);
        if (code==0x30) { //invalid zero at the begining , maybe as a separator
            i++;continue;
        } 
        while (i<str.length&&code>=0x30&&code<=0x39) {
            i++;
            repeat=repeat*10+(code-0x30);
            code=str.charCodeAt(i)
        }
        if (repeat) {
            s+= prev.repeat(repeat);
            repeat=0;
        }
        prev=str.charAt(i);
        s+=str.charAt(i);
        i++;
    }
    return s;
}
