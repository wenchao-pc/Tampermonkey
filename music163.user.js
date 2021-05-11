// ==UserScript==
// @name         网易歌单
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      https://music.163.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var download = function(){
        var iframe = window.frames[0];
        var l = "";
        iframe.document.querySelectorAll(".m-table tbody tr").forEach(tr=>{
            var s = tr.querySelector("td:nth-child(2) b").getAttribute("title");
            var n = tr.querySelector("td:nth-child(4) div.text").getAttribute("title");
            l+=s+":"+n+"\n";
        });
        var blob = new Blob([l]);
        var blobUrl = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = blobUrl;
        a.download = document.title;
        a.click();
    }
    var a = document.createElement('button');
    a.innerHTML = "下载";
    a.style = `position: absolute;
    z-index: 999;
    background: white;
    padding: 10px 20px;
    top: 20px;
    right: 20px;
    color: red;
    font-size: 18px;
    font-weight: bold;`;
    a.addEventListener('click',download);
    document.body.append(a);
})();
