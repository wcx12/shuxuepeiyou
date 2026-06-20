#!/usr/bin/env python3
"""Generate the lecture download section in the GitHub Pages homepage."""

from __future__ import annotations

import argparse
import html
import re
import sys
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LECTURE_ROOT = ROOT / "领军计划" / "讲义"
INDEX_HTML = ROOT / "index.html"

COUNT_START = "<!-- LECTURE_COUNT_START -->"
COUNT_END = "<!-- LECTURE_COUNT_END -->"
LATEST_START = "<!-- LECTURE_LATEST_START -->"
LATEST_END = "<!-- LECTURE_LATEST_END -->"
LIST_START = "<!-- LECTURE_LIST_START -->"
LIST_END = "<!-- LECTURE_LIST_END -->"

LECTURE_DIR_RE = re.compile(r"^(?P<date>\d{4}-\d{2}-\d{2})-(?P<title>.+)$")


@dataclass(frozen=True)
class Lecture:
    date: str
    title: str
    href: str
    size_label: str


def format_size(byte_count: int) -> str:
    return f"{byte_count / (1024 * 1024):.2f} MB"


def discover_lectures() -> list[Lecture]:
    if not LECTURE_ROOT.exists():
        raise FileNotFoundError(f"Lecture directory not found: {LECTURE_ROOT}")

    lectures: list[Lecture] = []
    for lecture_dir in sorted(LECTURE_ROOT.iterdir(), key=lambda path: path.name):
        if not lecture_dir.is_dir() or lecture_dir.name == "模板":
            continue

        match = LECTURE_DIR_RE.match(lecture_dir.name)
        if not match:
            continue

        lecture_date = match.group("date")
        for pdf_path in sorted(lecture_dir.rglob("*.pdf"), key=lambda path: path.name):
            relative_path = pdf_path.relative_to(ROOT).as_posix()
            lectures.append(
                Lecture(
                    date=lecture_date,
                    title=pdf_path.stem,
                    href=f"./{relative_path}",
                    size_label=format_size(pdf_path.stat().st_size),
                )
            )

    lectures.sort(key=lambda item: (item.title, item.href))
    lectures.sort(key=lambda item: item.date, reverse=True)
    return lectures


def render_lecture_item(lecture: Lecture) -> str:
    date = html.escape(lecture.date)
    title = html.escape(lecture.title)
    href = html.escape(lecture.href, quote=True)
    size_label = html.escape(lecture.size_label)

    return f"""        <li class="lecture-card">
          <time class="date" datetime="{date}">{date}</time>
          <div class="lecture-title">
            <h3>{title}</h3>
            <div class="meta">
              <span class="tag">PDF</span>
              <span>{size_label}</span>
            </div>
          </div>
          <a class="download-link" href="{href}" download>下载 PDF</a>
        </li>"""


def replace_between(source: str, start: str, end: str, replacement: str) -> str:
    pattern = re.compile(f"{re.escape(start)}.*?{re.escape(end)}", re.DOTALL)
    if not pattern.search(source):
        raise ValueError(f"Missing marker pair: {start} / {end}")
    return pattern.sub(f"{start}{replacement}{end}", source, count=1)


def render_index(source: str, lectures: list[Lecture]) -> str:
    latest = lectures[0].date if lectures else "暂无"
    list_html = "\n\n".join(render_lecture_item(lecture) for lecture in lectures)
    if list_html:
        list_html = f"\n{list_html}\n      "
    else:
        list_html = '\n        <li class="lecture-card">暂无讲义 PDF</li>\n      '

    output = source
    output = replace_between(output, COUNT_START, COUNT_END, f"{len(lectures)} 份")
    output = replace_between(output, LATEST_START, LATEST_END, latest)
    output = replace_between(output, LIST_START, LIST_END, list_html)
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit with a non-zero status if index.html is not up to date.",
    )
    args = parser.parse_args()

    source = INDEX_HTML.read_text(encoding="utf-8")
    lectures = discover_lectures()
    rendered = render_index(source, lectures)

    if args.check:
        if rendered != source:
            print("index.html is not up to date. Run tools/generate_lecture_index.py.", file=sys.stderr)
            return 1
        print(f"index.html is up to date with {len(lectures)} lecture PDFs.")
        return 0

    if rendered != source:
        INDEX_HTML.write_text(rendered, encoding="utf-8", newline="\n")
        print(f"Updated index.html with {len(lectures)} lecture PDFs.")
    else:
        print(f"index.html is already up to date with {len(lectures)} lecture PDFs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
