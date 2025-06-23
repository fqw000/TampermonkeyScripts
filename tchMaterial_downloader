// ==UserScript==
// @name         国家中小学智慧教育平台资源下载助手(书名+出版社文件名版)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  提取contentId并生成下载按钮，使用"书名_出版社"作为文件名
// @author       Zephyr
// @match        https://basic.smartedu.cn/tchMaterial/detail?contentType=assets_document*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      ykt.cbern.com.cn
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// ==/UserScript==

(function() {
    'use strict';

    // 提取contentId
    function getContentId() {
        const url = new URL(window.location.href);
        return url.searchParams.get('contentId');
    }

    // 提取并清理分类、书名和出版社信息
    function getBookInfo() {
        const titleElement = document.querySelector('h3.index-module_title_bnE9V');
        const publisherElement = document.querySelector('span.index-module_department_ewVZW');

        let category = ''; // 分类
        let title = '资源下载_' + new Date().getTime(); // 默认书名
        let publisher = ''; // 出版社默认为空

        if (titleElement) {
            const fullTitle = titleElement.textContent.trim();
            // 分离分类和书名（格式：分类·书名）
            const separatorIndex = fullTitle.indexOf('·');
            if (separatorIndex > -1) {
                category = fullTitle.substring(0, separatorIndex)
                    .replace(/[\\/:*?"<>|]/g, '') // 移除非法字符
                    .trim();
                title = fullTitle.substring(separatorIndex + 1)
                    .replace(/[\\/:*?"<>|]/g, '') // 移除非法字符
                    .trim()
                    .substring(0, 50); // 限制长度
            } else {
                title = fullTitle
                    .replace(/[\\/:*?"<>|]/g, '') // 移除非法字符
                    .trim()
                    .substring(0, 50); // 限制长度
            }
        }

        if (publisherElement) {
            publisher = publisherElement.textContent
                .replace(/[\\/:*?"<>|]/g, '') // 移除非法字符
                .trim()
                .substring(0, 20); // 限制长度
        }

        return {
            category: category,
            title: title,
            publisher: publisher,
            // 生成文件名：书名_出版社，如果出版社为空则只使用书名
            fileName: publisher ? `${title}_${publisher}` : title
        };
    }

    // 使用Blob方式下载，实现真正自定义文件名
    // 同时需要修改downloadWithCustomName函数以支持进度回调：
    function downloadWithCustomName(url, fileName, progressCallback) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            responseType: 'blob',
            onprogress: function(response) {
                if (response.lengthComputable && progressCallback) {
                    const percent = Math.round((response.loaded / response.total) * 100);
                    progressCallback(percent);
                }
            },
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        const blob = response.response;
                        saveAs(blob, fileName + '.pdf');
                        resolve();
                    } catch (e) {
                        reject(new Error('文件保存失败: ' + e.message));
                    }
                } else {
                    reject(new Error('文件下载失败，HTTP状态码: ' + response.status));
                }
            },
            onerror: function(error) {
                reject(new Error('下载请求失败: ' + error.message));
            },
            ontimeout: function() {
                reject(new Error('请求超时'));
            }
        });
    });
}
    // 创建下载按钮
    function createDownloadButton(parent, name, url, fileName) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.margin = '5px 0';

        const btn = document.createElement('button');
        btn.textContent = name;
        btn.style.flex = '1';
        btn.style.padding = '8px';
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '14px';

        const status = document.createElement('span');
        status.style.marginLeft = '10px';
        status.style.alignSelf = 'center';

      btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = name + '...';
    status.textContent = '准备中';
    status.style.color = '#666';

    try {
        // 先检查资源是否存在
        const headResponse = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'HEAD',
                url: url,
                onload: resolve,
                onerror: reject,
                ontimeout: reject
            });
        });

        if (headResponse.status === 200) {
            // 修改这里：将"下载中"改为显示百分比
            status.textContent = '0%';  // 初始显示0%
            status.style.color = '#FF9800';

            await downloadWithCustomName(url, fileName, (percent) => {
                // 更新进度百分比
                status.textContent = percent + '%';
            });

            status.textContent = '✓ 完成';
            status.style.color = '#4CAF50';
            btn.textContent = name;
        } else {
            throw new Error('资源不可用');
        }
    } catch (error) {
        console.error('下载失败:', error);
        status.textContent = '✗ 失败';
        status.style.color = '#F44336';
        btn.textContent = name + ' (重试)';
    } finally {
        btn.disabled = false;

        // 3秒后清除状态
        setTimeout(() => {
            if (!status.textContent.includes('✓') && !status.textContent.includes('✗')) {
                status.textContent = '';
            }
        }, 3000);
    }
});

        container.appendChild(btn);
        container.appendChild(status);
        parent.appendChild(container);
    }

    // 创建悬浮下载框
    function createDownloadBox(contentId, bookInfo) {
        const box = document.createElement('div');
        box.id = 'resource-download-box';
        box.style.position = 'fixed';
        box.style.bottom = '20px';
        box.style.right = '20px';
        box.style.backgroundColor = 'white';
        box.style.border = '1px solid #ccc';
        box.style.borderRadius = '8px';
        box.style.padding = '15px';
        box.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
        box.style.zIndex = '9999';
        box.style.maxWidth = '300px';
        box.style.minWidth = '250px';
        box.style.fontFamily = 'Arial, sans-serif';

        // 恢复上次的位置
        const savedPosition = GM_getValue('downloadBoxPosition', null);
        if (savedPosition) {
            box.style.left = savedPosition.x + 'px';
            box.style.top = savedPosition.y + 'px';
            box.style.right = 'auto';
            box.style.bottom = 'auto';
        }

        // 创建分类、书名和出版社信息显示
        const infoDiv = document.createElement('div');
        infoDiv.style.marginBottom = '8px';

        // 显示分类（如果有）
        if (bookInfo.category) {
            const categoryText = document.createElement('div');
            categoryText.textContent = '分类: ' + bookInfo.category;
            categoryText.style.fontSize = '14px';
            categoryText.style.color = '#666';
            categoryText.style.marginBottom = '4px';
            categoryText.style.whiteSpace = 'nowrap';
            categoryText.style.overflow = 'hidden';
            categoryText.style.textOverflow = 'ellipsis';
            infoDiv.appendChild(categoryText);
        }

        // 显示书名
        const titleText = document.createElement('div');
        titleText.textContent = '书名: ' + bookInfo.title;
        titleText.style.fontWeight = 'bold';
        titleText.style.fontSize = '16px';
        titleText.style.whiteSpace = 'nowrap';
        titleText.style.overflow = 'hidden';
        titleText.style.textOverflow = 'ellipsis';
        infoDiv.appendChild(titleText);

        // 显示出版社（如果有）
        if (bookInfo.publisher) {
            const publisherText = document.createElement('div');
            publisherText.textContent = '出版社: ' + bookInfo.publisher;
            publisherText.style.fontSize = '14px';
            publisherText.style.color = '#666';
            publisherText.style.marginTop = '4px';
            publisherText.style.whiteSpace = 'nowrap';
            publisherText.style.overflow = 'hidden';
            publisherText.style.textOverflow = 'ellipsis';
            infoDiv.appendChild(publisherText);
        }

        box.appendChild(infoDiv);

        const urls = [
            {name: 'CDN节点1', url: `https://r1-ndr.ykt.cbern.com.cn/edu_product/esp/assets_document/${contentId}.pkg/pdf.pdf`},
            {name: 'CDN节点2', url: `https://r2-ndr.ykt.cbern.com.cn/edu_product/esp/assets_document/${contentId}.pkg/pdf.pdf`},
            {name: 'CDN节点3', url: `https://r3-ndr.ykt.cbern.com.cn/edu_product/esp/assets_document/${contentId}.pkg/pdf.pdf`},
            {name: '主节点', url: `https://c1.ykt.cbern.com.cn/edu_product/esp/assets_document/${contentId}.pkg/pdf.pdf`},
            {name: '备用节点1', url: `https://r1-ndr.ykt.cbern.com.cn/edu_product/esp/assets/${contentId}.pkg/pdf.pdf`},
            {name: '备用节点2', url: `https://r2-ndr.ykt.cbern.com.cn/edu_product/esp/assets/${contentId}.pkg/pdf.pdf`},
            {name: '备用节点3', url: `https://r3-ndr.ykt.cbern.com.cn/edu_product/esp/assets/${contentId}.pkg/pdf.pdf`}
        ];

        urls.forEach(item => {
            createDownloadButton(box, item.name, item.url, bookInfo.fileName);
        });

        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '8px';
        closeBtn.style.right = '8px';
        closeBtn.style.width = '24px';
        closeBtn.style.height = '24px';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.fontSize = '18px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.color = '#999';

        closeBtn.addEventListener('mouseover', () => {
            closeBtn.style.background = '#f0f0f0';
            closeBtn.style.color = '#333';
        });

        closeBtn.addEventListener('mouseout', () => {
            closeBtn.style.background = 'transparent';
            closeBtn.style.color = '#999';
        });

        closeBtn.addEventListener('click', () => {
            box.remove();
        });
        box.appendChild(closeBtn);

        document.body.appendChild(box);

        // 可拖动功能
        let isDragging = false;
        let offsetX, offsetY;

        infoDiv.style.cursor = 'move';

        infoDiv.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - box.getBoundingClientRect().left;
            offsetY = e.clientY - box.getBoundingClientRect().top;
            box.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;

                // 限制在窗口范围内
                const maxX = window.innerWidth - box.offsetWidth;
                const maxY = window.innerHeight - box.offsetHeight;

                box.style.left = Math.min(Math.max(0, x), maxX) + 'px';
                box.style.top = Math.min(Math.max(0, y), maxY) + 'px';
                box.style.right = 'auto';
                box.style.bottom = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                box.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';

                // 保存位置
                GM_setValue('downloadBoxPosition', {
                    x: parseInt(box.style.left),
                    y: parseInt(box.style.top)
                });
            }
        });
    }

    // 主函数
    function main() {
        const contentId = getContentId();
        if (contentId) {
            // 等待页面完全加载，确保元素存在
            const checkElements = setInterval(() => {
                const bookInfo = getBookInfo();
                if (bookInfo.title && !bookInfo.title.includes('资源下载_')) {
                    clearInterval(checkElements);
                    createDownloadBox(contentId, bookInfo);
                }
            }, 500);
        }
    }

    // 页面加载完成后执行
    if (document.readyState === 'complete') {
        main();
    } else {
        window.addEventListener('load', main);
    }
})();
