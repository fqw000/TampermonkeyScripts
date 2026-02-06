// ==UserScript==
// @name         Tonkiang频道源提取器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  一键提取tonkiang.us上的频道名称和链接
// @author       Kiefer
// @match        https://tonkiang.us/*
// @grant        GM_setClipboard
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    // 创建提取按钮
    function createButton(text, top, color, onClick) {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        btn.style.cssText = `
            position: fixed;
            top: ${top}px;
            right: 20px;
            background: ${color};
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 3px 8px rgba(0,0,0,0.2);
            transition: all 0.3s;
        `;

        btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
        btn.onmouseout = () => btn.style.transform = 'translateY(0)';
        btn.onclick = onClick;

        document.body.appendChild(btn);
        return btn;
    }

    // 提取频道数据
    function extractChannels() {
        const channels = new Set();

        document.querySelectorAll('.resultplus').forEach((div, index) => {
            // 提取频道名
            const nameElement = div.querySelector('.channel a .tip');
            const channelName = nameElement ? nameElement.textContent.trim() : `频道${index+1}`;

            // 提取链接 - 直接取第二个tba
            const tbaElements = div.querySelectorAll('tba');
            if (tbaElements.length >= 2) {
                const channelLink = tbaElements[1].textContent.trim();
                if (channelName && channelLink) {
                    channels.add(`${channelName},${channelLink}`);
                }
            }
        });

        const result = Array.from(channels).join('\n');
        copyToClipboard(result, `已复制 ${channels.size} 个频道到剪贴板`);
    }

    // 提取带端口的域名
    function extractDomainsWithPorts() {
        const domains = new Set();

        document.querySelectorAll('.resultplus').forEach(div => {
            const tbaElements = div.querySelectorAll('tba');
            if (tbaElements.length >= 2) {
                const link = tbaElements[1].textContent.trim();
                // 使用正则提取带端口的域名
                const domainMatch = link.match(/https?:\/\/([^/]+)/);
                if (domainMatch && domainMatch[1]) {
                    domains.add(domainMatch[1]);
                }
            }
        });

        const result = Array.from(domains).sort().join('\n');
        copyToClipboard(result, `已复制 ${domains.size} 个域名到剪贴板`);
    }

    // 复制到剪贴板
    function copyToClipboard(text, successMsg) {
        if (typeof GM_setClipboard !== 'undefined') {
            GM_setClipboard(text, 'text');
        } else {
            // 备用方法
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        // 显示通知
        if (typeof GM_notification !== 'undefined') {
            GM_notification({
                text: successMsg,
                title: '频道提取器',
                timeout: 2000
            });
        } else {
            alert(successMsg);
        }

        // 在控制台输出结果
        console.log(successMsg);
        console.log('提取结果:');
        console.log(text);
    }

    // 创建按钮
    createButton('📺 提取频道', 20, '#4CAF50', extractChannels);
    createButton('🌐 提取域名', 70, '#2196F3', extractDomainsWithPorts);

    console.log('Tonkiang频道提取器已加载');
})();
