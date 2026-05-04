# 领军计划讲义模板

新建 LaTeX Beamer 讲义时，建议复制本目录中的 `lecture-template.tex` 和 `assets/logo1.jpg` 到新的讲义文件夹中。

样式统一由 `yingxing-beamer.sty` 管理。新讲义文件夹位于 `领军计划/讲义/YYYY-MM-DD-主题` 时，模板中的

```tex
\makeatletter
\def\input@path{{../模板/}}
\makeatother
\usepackage{yingxing-beamer}
```

可以直接使用。
