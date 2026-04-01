#!/usr/bin/env python3
"""Export all exam questions and study guides to PDF files."""

import os
import re
import sys
from fpdf import FPDF

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "pdf_export")

EXAM_FILES = {
    "NCP-AI": [
        "NCP-AI-Part1.md", "NCP-AI-Part2.md", "NCP-AI-Part3.md",
        "NCP-AI-Part4.md", "NCP-AI-Part5-GapFill.md",
    ],
    "NCP-US": [
        "NCP-US-Part1.md", "NCP-US-Part2-D3.md", "NCP-US-Part2-D4.md",
        "NCP-US-Part3-GapFill.md",
    ],
    "NCP-CI": [
        "NCP-CI-Part1.md", "NCP-CI-Part2.md", "NCP-CI-Part3.md",
        "NCP-CI-Part4.md", "NCP-CI-Part5-GapFill.md",
    ],
    "NCM-MCI": [
        "NCM-MCI-Part1.md", "NCM-MCI-Part2.md", "NCM-MCI-Part3.md",
        "NCM-MCI-Part4.md", "NCM-MCI-Part5-GapFill.md",
    ],
}

STUDY_GUIDES = [
    ("studyguides/CHEATSHEET-NCP-AI.md", "Cheat-Sheet-NCP-AI.pdf"),
    ("studyguides/CHEATSHEET-NCP-US.md", "Cheat-Sheet-NCP-US.pdf"),
    ("studyguides/CHEATSHEET-NCP-CI.md", "Cheat-Sheet-NCP-CI.pdf"),
    ("studyguides/CHEATSHEET-NCM-MCI.md", "Cheat-Sheet-NCM-MCI.pdf"),
    ("studyguides/NCM-MCI-LAB-WALKTHROUGH.md", "NCM-MCI-Lab-Walkthrough.pdf"),
    ("studyguides/CROSS-EXAM-COMPARISON.md", "Cross-Exam-Comparison.pdf"),
]


class ExamPDF(FPDF):
    def __init__(self, title="Nutanix Exam Prep"):
        super().__init__()
        self.doc_title = title
        self.set_auto_page_break(auto=True, margin=15)

    def header(self):
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, self.doc_title, align="L")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def add_title_page(self, title, subtitle=""):
        self.add_page()
        self.ln(60)
        self.set_font("Helvetica", "B", 28)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 14, title, align="C")
        if subtitle:
            self.ln(10)
            self.set_font("Helvetica", "", 14)
            self.set_text_color(80, 80, 80)
            self.multi_cell(0, 8, subtitle, align="C")
        self.ln(20)
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, "Nutanix Certification Study Tool", align="C")


def sanitize(text):
    """Remove characters that can't be encoded in latin-1."""
    replacements = {
        '\u2014': '--', '\u2013': '-', '\u2018': "'", '\u2019': "'",
        '\u201c': '"', '\u201d': '"', '\u2026': '...', '\u2192': '->',
        '\u2190': '<-', '\u2194': '<->', '\u2022': '*', '\u25cf': '*',
        '\u2713': '[x]', '\u2717': '[ ]', '\u2715': 'x', '\u00d7': 'x',
        '\u2265': '>=', '\u2264': '<=', '\u2260': '!=', '\u21d2': '=>',
        '\u2b50': '*', '\u26a0': '!', '\u274c': 'X', '\u2705': '[OK]',
        '\u2611': '[x]', '\u2610': '[ ]', '\u00ae': '(R)', '\u2122': '(TM)',
        '\u00a9': '(c)', '\u20ac': 'EUR', '\u00b0': 'deg', '\u2248': '~=',
        '\u221e': 'inf', '\u00b2': '^2', '\u00b3': '^3',
        '\U0001f534': '[!]', '\U0001f7e1': '[~]', '\U0001f7e2': '[ok]',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Strip any remaining non-latin1 chars
    return text.encode('latin-1', errors='replace').decode('latin-1')


def safe_cell(pdf, w, h, text, **kwargs):
    """Safely write a cell, resetting x if needed."""
    pdf.set_x(pdf.l_margin)
    try:
        pdf.multi_cell(w, h, text, **kwargs)
    except Exception:
        try:
            pdf.multi_cell(w, h, text[:100], **kwargs)
        except Exception:
            pdf.ln(h)  # just skip the line


def render_markdown_to_pdf(pdf, text):
    """Render markdown text to PDF with basic formatting."""
    lines = text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()

        # Skip empty lines
        if not line.strip():
            pdf.ln(3)
            i += 1
            continue

        clean = sanitize(line)

        # Headers
        if line.startswith('# '):
            pdf.ln(5)
            pdf.set_font("Helvetica", "B", 18)
            pdf.set_text_color(0, 0, 0)
            safe_cell(pdf, 0, 10, sanitize(line[2:].strip()))
            pdf.ln(3)
        elif line.startswith('## '):
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 14)
            pdf.set_text_color(30, 30, 30)
            safe_cell(pdf, 0, 8, sanitize(line[3:].strip()))
            pdf.ln(2)
        elif line.startswith('### '):
            pdf.ln(3)
            pdf.set_font("Helvetica", "B", 12)
            pdf.set_text_color(50, 50, 50)
            safe_cell(pdf, 0, 7, sanitize(line[4:].strip()))
            pdf.ln(1)
        elif line.startswith('#### '):
            pdf.ln(2)
            pdf.set_font("Helvetica", "BI", 11)
            pdf.set_text_color(60, 60, 60)
            safe_cell(pdf, 0, 7, sanitize(line[5:].strip()))
            pdf.ln(1)

        # Table rows
        elif line.strip().startswith('|'):
            pdf.set_font("Courier", "", 6)
            pdf.set_text_color(0, 0, 0)
            while i < len(lines) and lines[i].strip().startswith('|'):
                tl = lines[i].strip()
                if not re.match(r'^\|[\s\-:|]+\|$', tl):
                    safe = sanitize(tl)
                    if len(safe) > 150:
                        safe = safe[:147] + "..."
                    safe_cell(pdf, 0, 4, safe)
                i += 1
            pdf.ln(2)
            continue

        # Horizontal rule
        elif re.match(r'^---+$', line.strip()):
            pdf.ln(3)
            y = pdf.get_y()
            pdf.line(10, y, 200, y)
            pdf.ln(3)

        # Code blocks
        elif line.strip().startswith('```'):
            pdf.set_font("Courier", "", 8)
            pdf.set_text_color(40, 40, 40)
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                safe_cell(pdf, 0, 4, sanitize("  " + lines[i].rstrip()))
                i += 1

        # Bold lines
        elif line.startswith('**') and line.endswith('**'):
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(0, 0, 0)
            safe_cell(pdf, 0, 6, sanitize(line.replace('**', '')))

        # Regular text
        else:
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(0, 0, 0)
            rendered = re.sub(r'\*\*(.+?)\*\*', r'\1', clean)
            rendered = re.sub(r'\*(.+?)\*', r'\1', rendered)
            rendered = re.sub(r'`(.+?)`', r'\1', rendered)
            safe_cell(pdf, 0, 5, rendered)

        i += 1


def build_exam_pdf(exam_name, files, output_path):
    """Build a single PDF for an exam from its question files."""
    pdf = ExamPDF(f"Nutanix {exam_name} Exam Prep")
    pdf.alias_nb_pages()

    exam_titles = {
        "NCP-AI": ("NCP-AI 6.10", "Nutanix Certified Professional\nAI Infrastructure"),
        "NCP-US": ("NCP-US 6.10", "Nutanix Certified Professional\nUnified Storage"),
        "NCP-CI": ("NCP-CI 6.10", "Nutanix Certified Professional\nCloud Integration"),
        "NCM-MCI": ("NCM-MCI 6.10", "Nutanix Certified Master\nMulticloud Infrastructure"),
    }

    title, subtitle = exam_titles.get(exam_name, (exam_name, ""))
    pdf.add_title_page(title, subtitle)

    q_count = 0
    for fname in files:
        fpath = os.path.join(BASE_DIR, fname)
        if not os.path.exists(fpath):
            print(f"  WARNING: {fname} not found, skipping")
            continue
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        # Count questions
        q_count += len(re.findall(r'^###?\s+Q\d+', content, re.MULTILINE))
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(30, 30, 30)
        pdf.cell(0, 10, sanitize(fname.replace('.md', '')),
                new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)
        render_markdown_to_pdf(pdf, content)

    pdf.output(output_path)
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  {exam_name}: {q_count} questions -> {output_path} ({size_mb:.1f} MB)")


def build_guide_pdf(input_path, output_path):
    """Build a PDF from a study guide markdown file."""
    fpath = os.path.join(BASE_DIR, input_path)
    if not os.path.exists(fpath):
        print(f"  WARNING: {input_path} not found, skipping")
        return
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title from first # header
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else os.path.basename(input_path)

    pdf = ExamPDF(sanitize(title))
    pdf.alias_nb_pages()
    pdf.add_page()
    render_markdown_to_pdf(pdf, content)
    pdf.output(output_path)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"  Guide: {os.path.basename(output_path)} ({size_kb:.0f} KB)")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Exporting to: {OUTPUT_DIR}\n")

    print("=== Exam Question PDFs ===")
    for exam_name, files in EXAM_FILES.items():
        out = os.path.join(OUTPUT_DIR, f"{exam_name}-Questions.pdf")
        build_exam_pdf(exam_name, files, out)

    print("\n=== Study Guide PDFs ===")
    for src, dst in STUDY_GUIDES:
        out = os.path.join(OUTPUT_DIR, dst)
        build_guide_pdf(src, out)

    # Combined "everything" PDF
    print("\n=== Combined Master PDF ===")
    pdf = ExamPDF("Nutanix 4-Cert Study Guide - Complete")
    pdf.alias_nb_pages()
    pdf.add_title_page(
        "Nutanix 4-Cert\nComplete Study Guide",
        "NCP-AI | NCP-US | NCP-CI | NCM-MCI\n1,458 Questions + Cheat Sheets + Lab Guide"
    )

    all_files = []
    for files in EXAM_FILES.values():
        all_files.extend(files)
    for src, _ in STUDY_GUIDES:
        all_files.append(src)

    for fname in all_files:
        fpath = os.path.join(BASE_DIR, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(30, 30, 30)
        label = os.path.basename(fname).replace('.md', '')
        pdf.cell(0, 10, sanitize(label),
                new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)
        render_markdown_to_pdf(pdf, content)

    master_path = os.path.join(OUTPUT_DIR, "COMPLETE-Study-Guide.pdf")
    pdf.output(master_path)
    size_mb = os.path.getsize(master_path) / (1024 * 1024)
    print(f"  Master: COMPLETE-Study-Guide.pdf ({size_mb:.1f} MB)")

    print(f"\nDone! All PDFs in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
