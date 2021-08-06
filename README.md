# 漢字的拆分及搜尋

## API

    isPrime     是否為獨體字
    isFactor    是否為構件
    strokeOf    筆劃數
    deriveFrom  列出所有孳乳，可遞迴
    deriveCount 孳乳數
    factorsOf   取得構字部件

    詳見test.js

## 產生
    hz_data.js  
    須要 github.com/cjkv/cjkv-ids 的 ids.txt 及 ucs-strokes.txt
    以及 npm i pitaka
