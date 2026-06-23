# ACG List - 二次元图片瀑布流

一个简洁的二次元图片瀑布流展示网站，支持懒加载、无限滚动、图片灯箱等功能。

## 功能特性

- 瀑布流布局，响应式设计
- 图片懒加载 + 无限滚动
- 灯箱预览，支持左右切换、键盘快捷键
- 复制图片链接、下载原图
- 返回顶部按钮
- 加载动画、加载失败占位图

## 本地运行

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx live-server
```

然后访问 http://localhost:8000

## 部署到 Vercel

1. Fork 或上传此仓库到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project" 导入仓库
4. 无需配置，直接 Deploy

## 项目结构

```
.
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 主脚本
├── images.json         # 图片数据源
├── favicon.ico         # 网站图标
└── README.md           # 说明文档
```

## 自定义图片

编辑 `images.json` 文件，格式如下：

```json
{
  "images": [
    "https://example.com/image1.webp",
    "https://example.com/image2.webp"
  ]
}
```

## 技术栈

- HTML5 / CSS3 / JavaScript (ES6+)
- IntersectionObserver API (懒加载)
- Flexbox (瀑布流布局)

## License

MIT
