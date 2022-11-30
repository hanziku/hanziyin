export const fromObj=(obj,cb)=>{
    const arr=[];
    for (let key in obj) {
        if (!cb) {
            arr.push(key+'\t'+obj[key] );
        } else {
            if (typeof cb=='function') {
                arr.push( cb(key,obj[key]) );
            } else {
                arr.push( [key,obj[key]] );
            }
        }
    }
    if (cb && typeof cb!=='function') {
        arr.sort((a,b)=>b[1]-a[1]);
    }
    return arr;
}