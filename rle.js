export const forEachRLE=(str,cb)=>{ //copy from pitaka/utils/rlestr.js
    if (!str)return str;
    let i=1,ch=str[0],repeat=0,pos=0;
    
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
        if (cb(ch,pos,repeat)) break; //ch 在 pos 出現，又重覆了 repeat 次

        if (repeat) pos+=repeat;
        ch=str.charAt(i);
        
        repeat=0;
        i++;
        if (code>0xffff) i++;
        pos++; 
    }
    cb(ch,pos,repeat)
}