# 1know2see

一只见二的个人站。Think deeper, see further。

纸色底、近黑字、大号无衬线。中英切换都在。页面会请求 [api.1know2see.com](https://api.1know2see.com)，失败时用内置的同一份已知数据，不挡住首屏。

## 本地开发

需要 Node.js 22。

```bash
npm install
npm run dev
```

打开 http://localhost:5173 。

```bash
npm test
npm run build
npm run preview
```

构建产物在 `dist/`。本地看 404：http://127.0.0.1:4173/404.html 。部署到 Cloudflare Pages 之后，未知路径会自动使用 `404.html`。

## Cloudflare Pages

在 Cloudflare 控制台新建 Pages 项目，连接这个 GitHub 仓库。先把本 PR 合并到 `main`，生产分支选 `main`。

| 设置 | 值 |
| --- | --- |
| 框架预设 | Vite |
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |
| 根目录 | `/` |
| Node.js 版本 | 22 |
| 环境变量 | 不需要 |

仓库根目录有 `.node-version`，内容是 `22`。如果 Pages 没有自动读到，在环境变量里加 `NODE_VERSION=22`。

没有密钥，没有 `.env`。接口地址写在 `src/api.ts` 里：`https://api.1know2see.com`。

### 自定义域

1. Pages 项目 → Custom domains → 添加 `1know2see.com`。
2. 按向导添加它给出的 DNS 记录。在 Cloudflare 上，根域一般是 CNAME 展平。
3. 再添加 `www.1know2see.com`，并让 www 跳转到 apex。
4. **不要改**现有的邮件记录：MX、SPF（TXT）、DKIM、DMARC。

现在 apex 没有网站用的 A / AAAA / CNAME，所以补上 Pages 的记录不会和另一套网站记录打架。邮件记录保持原样。

## 接口

首屏不依赖网络。浏览器并行请求：

- `GET /config` — 名称和 tagline
- `GET /projects` — 作品
- `GET /health` — 只有成功时，页脚才出现「接口在线」

今天这个 Worker 不回 CORS 头，浏览器里的请求会失败。页面会安静地用下面这份回退，不弹错误：

- 配置：`1know2see` / `Think deeper, see further` / `dark`
- 作品：`1know2see API`，My first Cloudflare Workers and D1 project，active，2026-10-25

页面是纸色与墨色。`theme` 会被读到，但不会因此改皮肤。

作品列表以接口返回为准。和上面这份已知数据一致时，不重绘 DOM。以后接口里多了一件，页面会跟着渲染，不会编造链接或中文译名。只有名称正好是 `1know2see API` 的那一件会链到 `https://api.1know2see.com`。

### 想让浏览器直接读到线上数据

给 Worker 加上 CORS，至少放行：

- `https://1know2see.com`
- `https://www.1know2see.com`
- Pages 预览域（`*.pages.dev`），如果预览也要打到线上接口

```
Access-Control-Allow-Origin: https://1know2see.com
Vary: Origin
```

配好之前，页面用回退数据，内容和目前接口里的一致。

## 字体

SIL Open Font License，随仓库自托管，不请求 Google Fonts。来源是 fontsource 打包的 OFL 字体，不是商业字体：

- Schibsted Grotesk — 拉丁文展示与正文
- IBM Plex Mono — 索引、导航、括号短标签
- Noto Sans SC — 中文，400 与 900

许可证在 `public/fonts/licenses/`。

## 目录

- `index.html` / `404.html` — 页面
- `src/` — 样式、动效、语言、接口
- `public/` — 字体、图标、社交图、`_headers`

动效用 GSAP，只在视线那一节做逐行出现。`prefers-reduced-motion: reduce` 时不做位移。
