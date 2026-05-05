# 数学培优

本仓库用于整理“领军计划”相关数学培优资料，当前主要保存 LaTeX Beamer 讲义源码、编译后的 PDF，以及后续可能建设的可视化网页内容。

## 目录结构

```text
领军计划/
  讲义/
    YYYY-MM-DD-主题/
      主题.tex
      主题.pdf
      assets/
    模板/
      lecture-template.tex
      yingxing-beamer.sty
      assets/logo1.jpg
    STYLE_GUIDE.md
  可视化网页/
```

## 讲义说明

讲义以数学分析相关内容为主，面向培优课程使用。每一份讲义单独放在 `领军计划/讲义/YYYY-MM-DD-主题` 目录下，保留 LaTeX 源码、编译好的 PDF 和必要图片资源。

后续新讲义建议从 `领军计划/讲义/模板/lecture-template.tex` 开始编写，并遵循 `领军计划/讲义/STYLE_GUIDE.md` 中的统一版式规范，保持 Logo、页脚标语、颜色和页面容量控制一致。

## 可视化网页

可视化网页集中放在 `领军计划/可视化网页`，公网入口如下：

- 总入口：https://wcx12.github.io/shuxuepeiyou-visualizations/
- 导数题图像可视化：https://wcx12.github.io/shuxuepeiyou-visualizations/2026-05-04-导数题图像可视化/
- 四面体不等式可视化：https://wcx12.github.io/shuxuepeiyou-visualizations/2026-05-04-四面体不等式可视化/

## 参考资料

讲义内容参考了以下资料：

1. 谢惠民、恽自求、易法槐、钱定边：《数学分析习题课讲义（第2版）》上册。
2. 梅加强：《数学分析讲义【文字版】》。

本仓库中的讲义用于课程备课、课堂展示和学生复习整理。编写时应结合课堂讲解、自编例题与必要改写，避免直接照搬原书内容。

## 编译要求

LaTeX 讲义使用 `ctexbeamer`，建议使用 XeLaTeX 编译：

```powershell
xelatex -interaction=nonstopmode 讲义文件名.tex
xelatex -interaction=nonstopmode 讲义文件名.tex
```

提交前应确认 PDF 能正常生成，页脚 Logo 与标语显示完整，并检查是否存在明显页面溢出问题。
