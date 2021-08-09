# Hanziyin 汉字引

汉字的笔划笔形與构形搜索

## 演示

[https://github.com/yapcheahshen/hanziyin/](https://github.com/yapcheahshen/hanziyin/)


## 基本观念

注意，[cjkiv](https://github.com/cjkvi) 是日本学术机构，对汉字的认识不一定完全符合中国标准或文字学，但它是目前为止，免费公开最齐全的汉字构形消息数据库。


### 构件(factor)与孳乳(breed)
可以組成其他字的字，称作`构件`。如：`日`可以組成`昌`，`晶`。`日`是构件，而`昌` `晶`是`日`的`孳乳`。

字集扩大後，令很多本来不是构件的字，有了孳乳。例如：`深`在CJK基本两万字集中并不是构件，但因为Extension B 收了 `𠽉` (`口深` U+20F49) ，所以`深`就成了构件。

当前共有9841个构件。除去常见的之外，大部份构件的孳乳並并不多。

### 构形
一个字由那些构件组成，類似Unicode 表意序列(IDS)但不含構字符(IDC)，例：明=`日月`

不同的地区因笔划差异，有不同的构形方式，在github.com/cjkv/cjkvi-ids/ids.txt 中：

    U+5029	倩	⿰亻青[GTV]	⿰亻靑[JK]

 \[GTV\]表示国标(G)和台湾地区(T)的Big5码以及越南编码(V)，采用的`青`字下方都是`月`，而\[JK\]表示日本(J)与韩国(K_采用的是`靑`，下方是`円`。


### 独体 (prime)
指不能再拆分的字，非孳乳的字。

如`人` `心` `手` `日` `月`。很多独体是部首，但有例外，如`丈`是独体，但不是部首。反之，部首也不一定是独体。

目前有457个独体。有些独体並不是汉字，如 ①②③~⑲，表示笔划1,2,3~19，缺少Unicode编码的构件。另外，假名`いよりコサスユ`也被用作构件。

### 笔形
笔形分为六类，

1. `横`  一  
2. `撇`  丿
3. `竖`  川 的第二、三划。第一划是`撇`
4. `点` `捺` 木的最后一划，`氵`三个笔划都是点
5. `顺弯` `口`的第二划，往顺时钟拐。
6. `逆挑` `女` `母` `糸` `飞` 的第一划，`东`的第二划。
7. 表示无法分类，如一些曲线符号。

与五笔法（横竖撇点折）稍有不同的是：撇排在竖前面，原因是竖笔很少出在撇之前。把`横`逆时钟转九十度三次，就得到 `撇` `竖` 和`捺`。将折笔分为顺和逆，可以提供更精准的检索，5 和 6 的数字写法和笔形类似，也很好记。

顺带一提，汉字中这六种笔形都只出现一次的字只有两个，`安`:435621 `划`:164235

笔形编码加上笔划数，可以快速地过滤出目标构件，再从构件的孳乳得到目标字。

## API
### 需求
    
  EMCAScript 2015

  如果需要重建数据，需要从 github.com/cjkvi/cjkvi-ids/ 下载相关文档。

### 字码
```javascript
   const ch="字"  //文本
   //取得字码，可正确处理大于 U+FFFF的字
   const cp=ch.codePointAt(0); //U+5657 
```

### `isPrime` 判断是否为独体
* @prop {string|number} `字或字码`
* 返回 boolean

### `isFactor` 判断是否为构件
* @prop {string|number} `字或字码`
* 返回 boolean

### `strokeCountOf` 计算笔划数
* @prop {string|number} `字或字码`
* 返回 number

### `breedOf` 列出所有孳乳
* @prop {string|number} `字或字码`
* 返回 字码数组

```javascript
let r=breedOf("昭");
String.fromCodePoint(r[0])=='照'

r=breedOf("木口");   //木先出现，之后是口
String.fromCodePoint(r[0])=='杏'

r=breedOf("口木");  //口先出现，之后是木
String.fromCodePoint(r[0])=='呆'

r=breedOf("又又");  //又出现两次
String.fromCodePoint(r[0])=='双'

```

### `breedCount`取得孳乳个数
比 breedOf() 快很多，但一次只能查一個字
* @prop {string|number} `字或字码`
* 返回 number
```javascript
breedCount('中') == 175 //共有175字含有 「中」
```
### `factorsOf` 取得构形
* @prop {string|number|array} `字、字码或字码数组`
* @prop {boolean=false} 拆到独体字为止
* 返回 字码数组

```javascript
factorsOf("盟"); //返回 明,皿
factorsOf("盟",true); //返回   明,1,日,月,-1,皿
factorsOf("倩")// 返回 亻,青,  ,靑 
               // 全角空白隔开其他构形方式

```

由于每次查构形都要解压缩内部的数据结构，
如果要取得多字的构形，避免每个字调用一次factorsOf ，应传入数组。

```javascript
//不要这样
['青','年'].map(ch=>factorsOf(ch));

//应这样
factorsOf(['青','年']) 
// 返回 [ [青,[ 青的孳乳 ]  ], [年,[年的孳乳]] ]
```

### `primeArray`  独体字数组
含有所有独体字字码的数组

### `factorArray` 构件数组
含有所有独体字字码的数组，以一级孳乳数排序。
首十个构件是：
`口艹木氵扌土金亻女月`，即`口`的构形能力最强。

### `findFactor`  找出符合条件的部件
* @prop {string,number} 第一笔形 //數字0表示不限
* @prop {number} 第二笔形 //數字0表示不限
* @prop {number} 多於此筆劃 
* @prop {number} 少於此筆劃 
* 返回 字码数组

```javascript
findFactor(0,0,10); //十劃的構件，不限筆形
"莫真員".... 

findFactor(2);//  以撇起筆的構形，不限筆劃
"金亻月竹"... 

findFactor(2,0,12);//撇起筆，第二筆形不限，10劃
"番黍喬焦"...   

findFactor(1,3,4);// 橫,豎，共4劃的構件
"木巿帀五"  ... 

findFactor(3,5,7,9);//豎,順彎，界於7~9劃。
"是果易昜咼昆品"...
```

## 进阶主题
`hanziyin.js` 是 可用于浏览器及nodejs 的模块
使用 rollup 建置。

### 浏览器
因为`hanziyin.js`较大 (500KB) 而且更动的机会很小，不建议包入应用进程的bundle包，在html 中用 script 方式加载较好。
```html
//先加载汉字引的包
<script src="hanziyin.js"></script> 
//你的包
<script src="build/bundle.js"></script> 
```
在你的包直接用全域变量 `hanziyin` 调用 API
，或 es2015 引用模块

    import {findFactor} from "hanziyin"

### 重建数据档
    //生成hz_data.js，要有 cjkvi/cjkv-ids/ids.txt
    $cd src
    $node gen.js

    //重建 hanziyin.js
    $npm run build
