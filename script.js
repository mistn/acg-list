// ============================================================
// 二次元图片瀑布流 - 主脚本
// ============================================================

// ==================== 配置项 ====================
const CONFIG = {
    dataUrl: 'images.json',  // 图片数据源
    batchSize: 24,           // 每批加载图片数量
    lazyLoadMargin: '1000px', // 懒加载提前量
    infiniteScrollMargin: '1500px' // 无限滚动提前量
};

// ==================== DOM 元素 ====================
const DOM = {
    container: document.getElementById('image-container'),
    loading: document.getElementById('loading'),
    lightbox: document.getElementById('lightbox'),
    lightboxImage: document.getElementById('lightbox-image'),
    lightboxOverlay: document.querySelector('.lightbox-overlay'),
    copyLinkBtn: document.getElementById('copy-link-btn'),
    downloadBtn: document.getElementById('download-btn'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    backToTopBtn: document.getElementById('back-to-top')
};

// ==================== 状态变量 ====================
let state = {
    allImageUrls: [],      // 所有图片 URL
    currentIndex: 0,       // 当前加载到的索引
    currentImageUrl: '',   // 当前 Lightbox 显示的图片 URL
    currentImageIndex: -1, // 当前 Lightbox 显示的图片索引
    colNum: 0,             // 当前列数
    columns: [],           // 列元素数组
    imageElements: []      // 所有图片 DOM 元素
};

// ==================== 瀑布流布局 ====================

/**
 * 获取当前屏幕宽度对应的列数
 */
function getColNum() {
    if (window.innerWidth > 1200) return 4;
    if (window.innerWidth > 800) return 3;
    if (window.innerWidth > 500) return 2;
    return 1;
}

/**
 * 初始化瀑布流列
 */
function initColumns() {
    DOM.container.innerHTML = '';
    state.columns = [];
    for (let i = 0; i < state.colNum; i++) {
        const col = document.createElement('div');
        col.classList.add('column');
        DOM.container.appendChild(col);
        state.columns.push(col);
    }
}

/**
 * 窗口尺寸改变时重新分配图片
 */
window.addEventListener('resize', () => {
    const newColNum = getColNum();
    if (newColNum !== state.colNum) {
        state.colNum = newColNum;
        initColumns();
        state.imageElements.forEach((el, index) => {
            state.columns[index % state.colNum].appendChild(el);
        });
    }
});

// ==================== 图片加载 ====================

/**
 * 从本地 JSON 文件获取图片数据
 */
async function fetchImages() {
    try {
        const response = await fetch(CONFIG.dataUrl);
        const data = await response.json();

        state.allImageUrls = data.images;
        state.allImageUrls.sort(() => Math.random() - 0.5);

        state.colNum = getColNum();
        initColumns();
        loadMoreImages();
        hideLoading();
        setupInfiniteScroll();
    } catch (error) {
        console.error('获取图片数据失败:', error);
    }
}

/**
 * 加载更多图片到 DOM
 */
function loadMoreImages() {
    if (state.currentIndex >= state.allImageUrls.length) {
        state.currentIndex = 0;
        state.allImageUrls.sort(() => Math.random() - 0.5);
    }

    const endIndex = Math.min(state.currentIndex + CONFIG.batchSize, state.allImageUrls.length);

    for (let i = state.currentIndex; i < endIndex; i++) {
        const url = state.allImageUrls[i];
        const imgDiv = createImageElement(url, i);
        state.imageElements.push(imgDiv);
        state.columns[i % state.colNum].appendChild(imgDiv);
    }

    state.currentIndex = endIndex;
}

/**
 * 创建图片 DOM 元素
 */
function createImageElement(url, index) {
    const imgDiv = document.createElement('div');
    imgDiv.classList.add('image-item');

    const glow = document.createElement('div');
    glow.classList.add('image-glow');

    const img = document.createElement('img');
    img.setAttribute('data-src', url);
    img.setAttribute('loading', 'lazy');
    img.alt = 'Image';

    imgDiv.appendChild(glow);
    imgDiv.appendChild(img);

    // 绑定功能
    lazyLoadImage(img);
    attachLightboxListener(img);
    attachImageGlowEffect(imgDiv, glow);

    return imgDiv;
}

/**
 * 隐藏加载动画
 */
function hideLoading() {
    if (DOM.loading) {
        DOM.loading.classList.add('hidden');
        setTimeout(() => DOM.loading.remove(), 500);
    }
}

// ==================== 懒加载 ====================

/**
 * 图片懒加载
 */
function lazyLoadImage(img) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetImg = entry.target;
                targetImg.src = targetImg.getAttribute('data-src');

                targetImg.onload = () => {
                    targetImg.style.opacity = 1;
                };

                targetImg.onerror = () => {
                    targetImg.classList.add('error');
                    targetImg.style.opacity = 1;
                };

                observer.unobserve(targetImg);
            }
        });
    }, {
        rootMargin: CONFIG.lazyLoadMargin,
        threshold: 0.1
    });

    observer.observe(img);
}

// ==================== 无限滚动 ====================

/**
 * 设置无限滚动
 */
function setupInfiniteScroll() {
    const sentinel = document.createElement('div');
    sentinel.id = 'sentinel';
    document.body.appendChild(sentinel);

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadMoreImages();
        }
    }, {
        rootMargin: CONFIG.infiniteScrollMargin
    });

    observer.observe(sentinel);
}

// ==================== Lightbox 灯箱 ====================

/**
 * 为图片绑定 Lightbox 点击事件
 */
function attachLightboxListener(img) {
    img.addEventListener('click', function () {
        const imageUrl = this.getAttribute('data-src') || this.src;
        const index = state.allImageUrls.indexOf(imageUrl);
        openLightbox(imageUrl, index);
    });
    img.style.cursor = 'pointer';
}

/**
 * 打开 Lightbox
 */
function openLightbox(imageUrl, index) {
    state.currentImageUrl = imageUrl;
    state.currentImageIndex = index;
    DOM.lightboxImage.src = imageUrl;
    DOM.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateNavButtons();
}

/**
 * 关闭 Lightbox
 */
function closeLightbox() {
    DOM.lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

/**
 * 切换到上一张图片
 */
function showPrevImage() {
    if (state.currentImageIndex > 0) {
        state.currentImageIndex--;
        state.currentImageUrl = state.allImageUrls[state.currentImageIndex];
        DOM.lightboxImage.src = state.currentImageUrl;
        updateNavButtons();
    }
}

/**
 * 切换到下一张图片
 */
function showNextImage() {
    if (state.currentImageIndex < state.allImageUrls.length - 1) {
        state.currentImageIndex++;
        state.currentImageUrl = state.allImageUrls[state.currentImageIndex];
        DOM.lightboxImage.src = state.currentImageUrl;
        updateNavButtons();
    }
}

/**
 * 更新导航按钮显示状态
 */
function updateNavButtons() {
    DOM.prevBtn.style.display = state.currentImageIndex > 0 ? 'block' : 'none';
    DOM.nextBtn.style.display = state.currentImageIndex < state.allImageUrls.length - 1 ? 'block' : 'none';
}

// Lightbox 事件监听
DOM.lightboxOverlay.addEventListener('click', closeLightbox);
DOM.prevBtn.addEventListener('click', showPrevImage);
DOM.nextBtn.addEventListener('click', showNextImage);
DOM.copyLinkBtn.addEventListener('click', () => copyImageUrl(state.currentImageUrl, DOM.copyLinkBtn));
DOM.downloadBtn.addEventListener('click', () => downloadImage(state.currentImageUrl));

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (!DOM.lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrevImage();
    if (e.key === 'ArrowRight') showNextImage();
});

// ==================== 移动端触摸滑动 ====================

let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 50; // 滑动阈值

DOM.lightboxImage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

DOM.lightboxImage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;
    if (diff > 0) {
        showNextImage(); // 左滑下一张
    } else {
        showPrevImage(); // 右滑上一张
    }
}

// ==================== 移动端点击屏幕显示/隐藏功能按钮 ====================

DOM.lightboxImage.addEventListener('click', () => {
    if (window.innerWidth > 768) return; // 只在移动端生效
    const controls = document.querySelector('.lightbox-controls');
    controls.classList.toggle('hidden');
});

// ==================== 鼠标光效 ====================

/**
 * 为图片卡片绑定鼠标跟随光效
 */
function attachImageGlowEffect(card, glow) {
    if (!card || !glow) return;

    card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        glow.style.left = `${event.clientX - rect.left}px`;
        glow.style.top = `${event.clientY - rect.top}px`;
    });

    card.addEventListener('mouseleave', () => {
        glow.style.left = '50%';
        glow.style.top = '50%';
    });
}

// ==================== 剪贴板操作 ====================

/**
 * 复制图片链接
 */
function copyImageUrl(imageUrl, button) {
    if (!imageUrl) return;

    copyTextToClipboard(imageUrl).then(() => {
        if (button) showButtonFeedback(button, '✓ 已复制！');
    }).catch(() => {
        alert('复制失败，请重试');
    });
}

/**
 * 复制文本到剪贴板
 */
function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'readonly');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const copied = document.execCommand('copy');
            document.body.removeChild(textarea);
            copied ? resolve() : reject();
        } catch (error) {
            document.body.removeChild(textarea);
            reject(error);
        }
    });
}

/**
 * 按钮反馈动画
 */
function showButtonFeedback(button, feedbackText) {
    const originalText = button.getAttribute('data-original-text') || button.textContent;
    button.setAttribute('data-original-text', originalText);
    button.textContent = feedbackText;
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 2000);
}

// ==================== 下载功能 ====================

/**
 * 下载图片
 */
function downloadImage(imageUrl) {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${Date.now()}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== 返回顶部 ====================

/**
 * 返回顶部按钮
 */
DOM.backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    DOM.backToTopBtn.classList.toggle('visible', window.scrollY > 500);
});

// ==================== 初始化 ====================
fetchImages();
