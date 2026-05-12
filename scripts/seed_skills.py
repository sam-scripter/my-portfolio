"""
Skills Seed Script
===================
Populates the skills table with Samuel's technical skills.
Safe to re-run — clears and re-inserts to keep ordering clean.

Usage:
    python scripts/seed_skills.py

Update proficiency or add skills here, then re-run.
Proficiency scale:
    5 = Expert — shipped production code, go-to skill
    4 = Proficient — comfortable, used in multiple projects
    3 = Working knowledge — used it, know it well enough
    2 = Foundational — know the basics, still growing
    1 = Exploring — just started
"""

import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / "backend-python" / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

SKILLS = [
    # ── Mobile ────────────────────────────────────────────────────────
    {"name": "Flutter",         "category": "Mobile",           "proficiency": 5, "display_order": 1},
    {"name": "Dart",            "category": "Mobile",           "proficiency": 5, "display_order": 2},
    {"name": "Firebase",        "category": "Mobile",           "proficiency": 4, "display_order": 3},
    {"name": "Riverpod",        "category": "Mobile",           "proficiency": 4, "display_order": 4},
    {"name": "Android SDK",     "category": "Mobile",           "proficiency": 3, "display_order": 5},
    {"name": "Kotlin",          "category": "Mobile",           "proficiency": 2, "display_order": 6},

    # ── AI & Automation ───────────────────────────────────────────────
    {"name": "LLM Integration", "category": "AI & Automation",  "proficiency": 5, "display_order": 1},
    {"name": "Prompt Engineering","category": "AI & Automation","proficiency": 5, "display_order": 2},
    {"name": "OpenAI API",      "category": "AI & Automation",  "proficiency": 4, "display_order": 3},
    {"name": "Gemini AI",       "category": "AI & Automation",  "proficiency": 4, "display_order": 4},
    {"name": "AI Agents",       "category": "AI & Automation",  "proficiency": 4, "display_order": 5},
    {"name": "Token Optimization","category": "AI & Automation","proficiency": 4, "display_order": 6},
    {"name": "RAG Systems",     "category": "AI & Automation",  "proficiency": 3, "display_order": 7},
    {"name": "pgvector",        "category": "AI & Automation",  "proficiency": 3, "display_order": 8},

    # ── Backend ───────────────────────────────────────────────────────
    {"name": "Python",          "category": "Backend",          "proficiency": 4, "display_order": 1},
    {"name": "Django",          "category": "Backend",          "proficiency": 4, "display_order": 2},
    {"name": "Django REST Framework","category": "Backend",     "proficiency": 4, "display_order": 3},
    {"name": "Node.js",         "category": "Backend",          "proficiency": 4, "display_order": 4},
    {"name": "FastAPI",         "category": "Backend",          "proficiency": 3, "display_order": 5},
    {"name": "PostgreSQL",      "category": "Backend",          "proficiency": 4, "display_order": 6},
    {"name": "REST API Design", "category": "Backend",          "proficiency": 4, "display_order": 7},

    # ── Frontend ──────────────────────────────────────────────────────
    {"name": "React.js",        "category": "Frontend",         "proficiency": 4, "display_order": 1},
    {"name": "Next.js",         "category": "Frontend",         "proficiency": 3, "display_order": 2},
    {"name": "Tailwind CSS",    "category": "Frontend",         "proficiency": 4, "display_order": 3},
    {"name": "TypeScript",      "category": "Frontend",         "proficiency": 3, "display_order": 4},

    # ── Tools & DevOps ────────────────────────────────────────────────
    {"name": "Git",             "category": "Tools & DevOps",   "proficiency": 4, "display_order": 1},
    {"name": "Docker",          "category": "Tools & DevOps",   "proficiency": 3, "display_order": 2},
    {"name": "Nginx",           "category": "Tools & DevOps",   "proficiency": 3, "display_order": 3},
    {"name": "Oracle Cloud VPS","category": "Tools & DevOps",   "proficiency": 3, "display_order": 4},
    {"name": "Google Maps API", "category": "Tools & DevOps",   "proficiency": 4, "display_order": 5},
    {"name": "Socket.io",       "category": "Tools & DevOps",   "proficiency": 3, "display_order": 6},
]


def seed_skills():
    if not DATABASE_URL:
        print("❌ DATABASE_URL not set in backend-python/.env")
        sys.exit(1)

    print("🔌 Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    print("✅ Connected\n")

    # Clear and re-insert — simpler than upsert for skills
    # since names can change and ordering matters
    cur.execute("DELETE FROM skills")
    deleted = cur.rowcount
    print(f"  🗑️  Cleared {deleted} existing skill rows")

    for skill in SKILLS:
        cur.execute("""
            INSERT INTO skills (name, category, proficiency, display_order)
            VALUES (%(name)s, %(category)s, %(proficiency)s, %(display_order)s)
        """, skill)

    conn.commit()

    # Verify
    cur.execute("SELECT category, COUNT(*) FROM skills GROUP BY category ORDER BY category")
    rows = cur.fetchall()

    print("\n  Skills seeded by category:")
    total = 0
    for category, count in rows:
        print(f"    {category}: {count} skills")
        total += count

    cur.close()
    conn.close()

    print(f"\n{'='*50}")
    print(f"✅ Total skills seeded: {total}")
    print(f"{'='*50}")


if __name__ == "__main__":
    seed_skills()