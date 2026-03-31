#!/usr/bin/env python3
"""
LLM CLI Answer Validator
Reads all question markdown files, parses each question,
and outputs them in a format for LLM validation.

Usage:
  python validate_answers.py --exam NCP-US --batch 1    # Questions 1-40
  python validate_answers.py --exam NCP-US --batch 2    # Questions 41-80
  python validate_answers.py --exam ALL --summary        # Summary of all exams
  python validate_answers.py --exam NCP-AI --question 45 # Single question
"""

import re
import sys
import glob
import os
import argparse
import json
from pathlib import Path

EXAM_PREFIXES = {
    "NCP-US": "NCP-US",
    "NCP-CI": "NCP-CI",
    "NCP-AI": "NCP-AI",
    "NCM-MCI": "NCM-MCI",
}

BATCH_SIZE = 40


def parse_questions(filepath):
    """Parse markdown question file into structured questions."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    questions = []
    # Split on ### Q markers
    parts = re.split(r'(?=###\s*Q\d+)', content)

    for part in parts:
        part = part.strip()
        if not part.startswith("### Q"):
            continue

        q = {}

        # Extract question number
        num_match = re.match(r'###\s*Q(\d+)', part)
        if not num_match:
            continue
        q["number"] = int(num_match.group(1))

        # Extract stem (everything between Q# header and first option)
        stem_match = re.search(r'###\s*Q\d+[^\n]*\n(.*?)(?=\n[A-E][\.\)]\s)', part, re.DOTALL)
        if stem_match:
            q["stem"] = stem_match.group(1).strip()
        else:
            q["stem"] = "(Could not parse stem)"

        # Extract options
        q["options"] = []
        opt_pattern = re.findall(r'([A-E])[\.\)]\s*(.*?)(?=\n[A-E][\.\)]\s|\n\*\*Answer|\n---|\Z)', part, re.DOTALL)
        for letter, text in opt_pattern:
            q["options"].append({"letter": letter, "text": text.strip()})

        # Extract marked answer
        ans_match = re.search(r'\*\*Answer[:\s]*([A-E,\s]+)\*\*', part)
        if ans_match:
            raw = ans_match.group(1).replace(" ", "").replace(",", "")
            q["marked_answer"] = sorted(list(raw))
        else:
            q["marked_answer"] = []

        # Extract explanation
        expl_match = re.search(r'\*\*(?:Explanation|Why)[:\s]*\*?\*?\s*(.*?)(?=\n---|\n###|\Z)', part, re.DOTALL)
        if expl_match:
            q["explanation"] = expl_match.group(1).strip()
        else:
            q["explanation"] = ""

        # Detect question type
        if len(q["marked_answer"]) > 1:
            q["type"] = "multi-select"
        elif "order" in q["stem"].lower() or "sequence" in q["stem"].lower() or "arrange" in q["stem"].lower():
            q["type"] = "ordering"
        else:
            q["type"] = "single"

        q["source_file"] = os.path.basename(filepath)
        questions.append(q)

    return questions


def load_exam(exam_code, base_dir="."):
    """Load all questions for an exam."""
    prefix = EXAM_PREFIXES.get(exam_code)
    if not prefix:
        print(f"Unknown exam: {exam_code}")
        return []

    files = sorted(glob.glob(os.path.join(base_dir, f"{prefix}*.md")))
    all_questions = []
    for f in files:
        qs = parse_questions(f)
        # Add global numbering
        for q in qs:
            q["exam"] = exam_code
            q["global_num"] = len(all_questions) + 1
            all_questions.append(q)
    return all_questions


def format_question_for_validation(q):
    """Format a question for LLM validation."""
    lines = []
    lines.append(f"── Q{q['global_num']} ({q['exam']}, {q['source_file']}, #{q['number']}) [{q['type']}] ──")
    lines.append(f"STEM: {q['stem']}")
    lines.append("")
    for opt in q["options"]:
        lines.append(f"  {opt['letter']}. {opt['text']}")
    lines.append("")
    lines.append(f"MARKED ANSWER: {', '.join(q['marked_answer'])}")
    lines.append(f"EXPLANATION: {q['explanation'][:200]}..." if len(q.get('explanation', '')) > 200 else f"EXPLANATION: {q.get('explanation', 'N/A')}")
    lines.append("")
    return "\n".join(lines)


def format_batch_for_validation(questions, batch_num):
    """Format a batch of questions for LLM review."""
    start = (batch_num - 1) * BATCH_SIZE
    end = min(start + BATCH_SIZE, len(questions))
    batch = questions[start:end]

    if not batch:
        return None, 0

    header = f"""
╔══════════════════════════════════════════════════════════════╗
║  LLM ANSWER VALIDATION — {batch[0]['exam']} Batch {batch_num}
║  Questions {start+1}-{end} of {len(questions)}
║  
║  For EACH question below:
║  1. Read the stem and all options carefully
║  2. Determine the correct answer(s) using your knowledge
║  3. Compare against the MARKED ANSWER
║  4. If you DISAGREE, flag it with reason
║  
║  Output format for each:
║  Q[#]: AGREE | DISAGREE — [Your answer] — [Brief reason if disagree]
╚══════════════════════════════════════════════════════════════╝
"""
    body = "\n".join(format_question_for_validation(q) for q in batch)
    return header + "\n" + body, len(batch)


def export_json(questions, filepath):
    """Export questions to JSON for programmatic processing."""
    data = []
    for q in questions:
        data.append({
            "global_num": q["global_num"],
            "exam": q["exam"],
            "source_file": q["source_file"],
            "local_num": q["number"],
            "type": q["type"],
            "stem": q["stem"],
            "options": q["options"],
            "marked_answer": q["marked_answer"],
            "explanation": q["explanation"],
        })
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return len(data)


def print_summary(base_dir="."):
    """Print summary of all exams."""
    print("\n╔══════════════════════════════════════════════════════════════╗")
    print("║              QUESTION BANK SUMMARY                         ║")
    print("╠══════════════════════════════════════════════════════════════╣")

    total = 0
    for exam_code in EXAM_PREFIXES:
        questions = load_exam(exam_code, base_dir)
        types = {"single": 0, "multi-select": 0, "ordering": 0}
        for q in questions:
            types[q["type"]] += 1

        files = set(q["source_file"] for q in questions)
        print(f"║  {exam_code:10s}: {len(questions):3d} questions ({types['single']} MCQ, {types['multi-select']} multi, {types['ordering']} order)")
        print(f"║             Files: {', '.join(sorted(files))}")
        total += len(questions)

    print(f"╠══════════════════════════════════════════════════════════════╣")
    print(f"║  TOTAL: {total} questions across {len(EXAM_PREFIXES)} exams")
    batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"║  BATCHES: {batches} (at {BATCH_SIZE} questions per batch)")
    print(f"╚══════════════════════════════════════════════════════════════╝")


def main():
    parser = argparse.ArgumentParser(description="LLM Answer Validator CLI")
    parser.add_argument("--exam", default="ALL", help="Exam code (NCP-US, NCP-CI, NCP-AI, NCM-MCI, ALL)")
    parser.add_argument("--batch", type=int, default=0, help="Batch number (1-based, 0=all)")
    parser.add_argument("--question", type=int, default=0, help="Single question number")
    parser.add_argument("--summary", action="store_true", help="Show summary only")
    parser.add_argument("--export-json", type=str, default="", help="Export to JSON file")
    parser.add_argument("--dir", default=".", help="Base directory with markdown files")
    parser.add_argument("--batch-size", type=int, default=40, help="Questions per batch")
    args = parser.parse_args()

    global BATCH_SIZE
    BATCH_SIZE = args.batch_size

    if args.summary:
        print_summary(args.dir)
        return

    if args.exam == "ALL":
        all_questions = []
        for exam_code in EXAM_PREFIXES:
            all_questions.extend(load_exam(exam_code, args.dir))

        if args.export_json:
            n = export_json(all_questions, args.export_json)
            print(f"Exported {n} questions to {args.export_json}")
            return

        print_summary(args.dir)
        return

    questions = load_exam(args.exam, args.dir)
    if not questions:
        print(f"No questions found for {args.exam}")
        return

    if args.export_json:
        n = export_json(questions, args.export_json)
        print(f"Exported {n} questions to {args.export_json}")
        return

    if args.question > 0:
        q = next((q for q in questions if q["global_num"] == args.question), None)
        if q:
            print(format_question_for_validation(q))
        else:
            print(f"Question {args.question} not found")
        return

    if args.batch > 0:
        output, count = format_batch_for_validation(questions, args.batch)
        if output:
            print(output)
        else:
            print(f"Batch {args.batch} out of range")
        return

    # Default: show all batches info
    total_batches = (len(questions) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"\n{args.exam}: {len(questions)} questions, {total_batches} batches")
    print(f"Usage: python validate_answers.py --exam {args.exam} --batch N")
    for b in range(1, total_batches + 1):
        start = (b - 1) * BATCH_SIZE + 1
        end = min(b * BATCH_SIZE, len(questions))
        print(f"  Batch {b}: Q{start}-Q{end}")


if __name__ == "__main__":
    main()
