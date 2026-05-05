# 领军计划 LaTeX Beamer 讲义风格规范

## 目录与命名

每一份讲义单独放入 `领军计划/讲义/YYYY-MM-DD-主题`，例如 `2026-05-05-高阶导数习题课`。

讲义源码建议命名为 `主题.tex`，编译后的 PDF 与源码同名。图片、Logo、题图等资源统一放在本讲义目录下的 `assets/` 中。

主题名应使用正式课程标题，不写章节号、版本过程词或文件类型词。例如不要使用 `第四章`、`PPT讲义`、`beamer`、`audited`、`完整审计版` 等作为目录名或主文件名的一部分。

仓库只保留源码、PDF 和必要资源。不上传 `.ppt`、`.pptx`、`.aux`、`.log`、`.nav`、`.snm`、`.toc`、`.out`、`.synctex.gz` 等临时文件。

## 统一样式

新讲义优先从 `领军计划/讲义/模板/lecture-template.tex` 复制开始写。

Beamer 样式统一由 `领军计划/讲义/模板/yingxing-beamer.sty` 管理，新讲义保留下面的引用：

```tex
\makeatletter
\def\input@path{{../模板/}}
\makeatother
\usepackage{yingxing-beamer}
```

默认页脚左侧为 `assets/logo1.jpg`，中间为固定标语：

```tex
英行培优，成绩无忧；英行相伴，刮目相看
```

若某份讲义需要临时替换 Logo 或标语，可在 `\usepackage{yingxing-beamer}` 之后重定义：

```tex
\renewcommand{\yingxinglogo}{assets/logo1.jpg}
\renewcommand{\yingxingslogan}{英行培优，成绩无忧；英行相伴，刮目相看}
```

## 版面原则

幻灯片比例固定为 `16:9`，字号使用 `11pt`，文档类使用 `ctexbeamer`。主题使用 `Madrid`，主色保持深蓝标题栏和浅蓝信息块。

每页尽量只讲一个结论、一个证明步骤或一道例题的一个关键阶段。若一页内容过长，优先拆成 `（上）`、`（中）`、`（下）` 或 `（续）`，不要靠压缩字号硬塞。

正文列表建议控制在 3 到 5 条。公式较长时优先换行、拆分推导或改成两页展示。只有在少量超出时才使用 `\small` 或 `\footnotesize`。

## 编译与检查

在具体讲义目录下执行两次 XeLaTeX：

```powershell
xelatex -interaction=nonstopmode 讲义文件名.tex
xelatex -interaction=nonstopmode 讲义文件名.tex
```

提交前重点检查三件事：PDF 能正常生成，页脚 Logo 与标语完整显示，日志中没有明显的 `Overfull \vbox` 或大幅 `Overfull \hbox`。

如果出现页面过长，优先拆页；如果出现横向溢出，优先缩短行内文字、拆公式、使用 `aligned` 或把大公式放入单独页面。

## 可视化网页引用

如果某份讲义配套了可视化网页，应把网页源码放入 `领军计划/可视化网页/YYYY-MM-DD-主题`，并在对应讲义目录中新增或更新 `可视化引用.md`。

`可视化引用.md` 至少写清三项内容：公网入口、适用的讲义章节或例题、课堂使用建议。不要把可视化网页硬挂到不相关讲义中。
