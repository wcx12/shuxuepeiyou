# 导数题图像可视化

用于展示导数题中原函数、导函数、零点、驻点与参数变化关系的静态网页。

公网访问：

https://wcx12.github.io/shuxuepeiyou/领军计划/可视化网页/2026-05-04-导数题图像可视化/

## 本地预览

在当前目录运行：

```powershell
python -m http.server 8125
```

然后访问：

```text
http://127.0.0.1:8125
```

## 主要文件

- `index.html`：页面结构。
- `styles.css`：页面样式。
- `app.js`：交互逻辑、绘图、零点与驻点检测。
- `problems.js`：题目数据与每题对应的函数定义。

页面依赖 `KaTeX` 和 `Plotly` 的 CDN，公网访问时需要联网加载。
