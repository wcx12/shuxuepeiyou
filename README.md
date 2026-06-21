# 数学培优

本仓库用于整理“领军计划”相关数学培优资料，当前主要保存 LaTeX Beamer 讲义源码、编译后的 PDF，以及配套的交互式可视化网页。

仓库已设置为公开仓库。可视化网页通过 GitHub Pages 从本仓库 `main` 分支根目录直接发布，公开入口为：

https://wcx12.github.io/shuxuepeiyou/

## 目录结构

```text
领军计划/
  讲义/
    YYYY-MM-DD-主题/
      主题.tex
      主题.pdf
      主题.pptx        # 可选：由 PDF 转出的课堂放映版
      assets/
      可视化引用.md
    模板/
      lecture-template.tex
      yingxing-beamer.sty
      assets/logo1.jpg
      README.md
    STYLE_GUIDE.md
  可视化网页/
    index.html
    README.md
    YYYY-MM-DD-主题/
      index.html
      styles.css
      app.js
      README.md
```

根目录中的 `index.html` 是仓库公开入口页，`领军计划/可视化网页/index.html` 是可视化网页总入口页。

## 讲义说明

讲义以数学分析相关内容为主，面向培优课程使用。每一份讲义单独放在 `领军计划/讲义/YYYY-MM-DD-主题` 目录下，保留 LaTeX 源码、编译好的 PDF 和必要图片资源。

后续新讲义建议从 `领军计划/讲义/模板/lecture-template.tex` 开始编写，并遵循 `领军计划/讲义/STYLE_GUIDE.md` 中的统一版式规范，保持 Logo、页脚标语、颜色、比例和页面容量控制一致。

讲义目录和主文件命名遵循 `YYYY-MM-DD-主题` 与 `主题.tex` / `主题.pdf` 的形式，不写章节号、文件类型词或过程版本词。例如不使用 `第四章`、`PPT讲义`、`audited`、`完整审计版` 等作为目录名或主文件名的一部分。

仓库默认只保留源码、PDF 和必要资源。若课堂需要 PowerPoint 放映版，可以在对应讲义目录中保留由 PDF 转出的同名 `.pptx`；不提交临时版、过程版或无法追溯来源的 `.ppt/.pptx` 文件。LaTeX 编译产生的 `.aux`、`.log`、`.nav`、`.snm`、`.toc`、`.out`、`.synctex.gz` 等临时文件不提交。

当前已整理的近期讲义包括：

- [凸函数与洛必达法则](领军计划/讲义/2026-06-20-凸函数/凸函数.pdf)：含 LaTeX 源码、PDF、课堂放映版 PPTX，以及配套可视化引用。
- [Taylor 展开](领军计划/讲义/2026-06-21-Taylor展开/Taylor展开.pdf)：含 LaTeX 源码和 PDF。

## 可视化网页

可视化网页集中放在 `领军计划/可视化网页`，公网入口如下：

- 总入口：https://wcx12.github.io/shuxuepeiyou/领军计划/可视化网页/
- 导数题图像可视化：https://wcx12.github.io/shuxuepeiyou/领军计划/可视化网页/2026-05-04-导数题图像可视化/
- 四面体不等式可视化：https://wcx12.github.io/shuxuepeiyou/领军计划/可视化网页/2026-05-04-四面体不等式可视化/
- 乘积微分法则可视化：https://wcx12.github.io/shuxuepeiyou/领军计划/可视化网页/2026-05-22-乘积微分法则可视化/
- 凸函数可视化：https://wcx12.github.io/shuxuepeiyou/领军计划/可视化网页/2026-06-20-凸函数可视化/

后续新增可视化网页时，应同步完成以下事项：

1. 将网页源码放入 `领军计划/可视化网页/YYYY-MM-DD-主题`。
2. 更新 `领军计划/可视化网页/index.html` 和 `领军计划/可视化网页/README.md`。
3. 如果网页对应某份讲义，在对应讲义目录中新增或更新 `可视化引用.md`，写清公网入口、适用章节或例题、课堂使用建议。
4. 如果暂时没有对应讲义，只在可视化 README 中说明适用场景，不强行挂到不相关讲义。

## 参考资料

讲义内容参考了以下资料：

1. 谢惠民、恽自求、易法槐、钱定边：《数学分析习题课讲义（第2版）》上册。
2. 梅加强：《数学分析讲义【文字版】》。

本仓库中的讲义用于课程备课、课堂展示和学生复习整理。编写时应结合课堂讲解、自编例题与必要改写，避免直接照搬原书内容。

## 编译要求

LaTeX 讲义使用 `ctexbeamer`，建议使用 XeLaTeX 编译。在具体讲义目录下执行两次：

```powershell
xelatex -interaction=nonstopmode 讲义文件名.tex
xelatex -interaction=nonstopmode 讲义文件名.tex
```

提交前应确认 PDF 能正常生成，页脚 Logo 与标语显示完整，并检查是否存在明显页面溢出问题。页面过长时优先拆页，不建议单纯压缩字号。
