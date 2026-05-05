# 领军计划讲义模板

本目录保存 LaTeX Beamer 讲义的统一模板和样式文件。新建讲义时，建议复制 `lecture-template.tex` 和 `assets/logo1.jpg` 到新的讲义文件夹中。

样式统一由 `yingxing-beamer.sty` 管理。新讲义文件夹位于 `领军计划/讲义/YYYY-MM-DD-主题` 时，模板中的代码可以直接使用：

```tex
\makeatletter
\def\input@path{{../模板/}}
\makeatother
\usepackage{yingxing-beamer}
```

## 新建步骤

1. 在 `领军计划/讲义/` 下建立 `YYYY-MM-DD-主题` 目录。
2. 复制 `lecture-template.tex` 到新目录，并改名为 `主题.tex`。
3. 复制或保留需要的图片资源到新目录的 `assets/`。
4. 使用 XeLaTeX 编译两次，生成同名 `主题.pdf`。
5. 若讲义配套可视化网页，在新目录中新增 `可视化引用.md`。

## 样式要求

讲义统一使用 `ctexbeamer`、`16:9`、`11pt`、`Madrid` 主题。页脚 Logo 和标语由 `yingxing-beamer.sty` 提供，默认标语为：

```text
英行培优，成绩无忧；英行相伴，刮目相看
```

更完整的命名、排版、编译和可视化引用规则见 `领军计划/讲义/STYLE_GUIDE.md`。

## 提交前检查

提交前应确认源码和 PDF 同名，PDF 能正常打开，页脚 Logo 与标语显示完整，没有明显页面溢出问题，且目录中没有 `.aux`、`.log`、`.nav`、`.snm`、`.toc`、`.out`、`.synctex.gz` 等临时文件。
