"""
Projects Seed Script
=====================
Populates the projects table with Samuel's portfolio projects.
Safe to re-run — uses INSERT ON CONFLICT DO UPDATE (upsert).

Usage:
    python scripts/seed_projects.py

Add new projects by appending to the PROJECTS list and re-running.
The slug must be unique and URL-safe (used in /projects/[slug] routes).
"""

import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / "backend-python" / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

# ── Project data ──────────────────────────────────────────────────────
# display_order controls the order on the portfolio page (lower = first)
# featured=True renders as a large hero card on the homepage
# tech_stack is a PostgreSQL array — passed as a Python list

PROJECTS = [
    {
        "title": "Stratum",
        "slug": "stratum",
        "short_description": (
            "An AI-powered personal finance tracker for Android that automatically "
            "reads M-Pesa SMS notifications, parses transactions without any manual "
            "input, and provides monthly AI-generated financial analysis."
        ),
        "case_study": (Path(__file__).parent.parent / "knowledge/projects/stratum.md").read_text(encoding="utf-8"),
        "tech_stack": ["Flutter", "Dart", "Hive", "Riverpod", "OpenAI", "Android SMS API"],
        "github_url": "",
        "playstore_url": "https://play.google.com/store/apps/details?id=com.shadivah.stratum",
        "live_url": "",
        "status": "live",
        "featured": True,
        "display_order": 1,
    },
    {
        "title": "Atlas",
        "slug": "atlas",
        "short_description": (
            "An autonomous AI job search agent that discovers job postings via RSS, "
            "scores each one against my professional profile using GPT-4o-mini, "
            "drafts tailored applications for high matches, and runs 3x daily on a "
            "schedule — fully without human intervention."
        ),
        "case_study": (Path(__file__).parent.parent / "knowledge/projects/atlas.md").read_text(encoding="utf-8"),
        "tech_stack": ["Python", "OpenAI", "PostgreSQL", "RSS", "SMTP", "Oracle VPS", "Cron"],
        "github_url": "",
        "playstore_url": "",
        "live_url": "",
        "status": "in_progress",
        "featured": True,
        "display_order": 2,
    },
    {
        "title": "Number Your Days",
        "slug": "number-your-days",
        "short_description": (
            "An intentional journaling app for Android using a tiered AI analysis "
            "system — daily insights with Gemini Flash, monthly and yearly synthesis "
            "with Gemini Pro. Uses a summarization chaining strategy that reduces "
            "token usage by ~98% vs naive approaches."
        ),
        "case_study": (Path(__file__).parent.parent / "knowledge/projects/number_your_days.md").read_text(encoding="utf-8"),
        "tech_stack": ["Flutter", "Dart", "Firebase", "Firestore", "Gemini AI", "Cloud Functions"],
        "github_url": "",
        "playstore_url": "https://play.google.com/store/apps/details?id=com.shadivah.nyd",
        "live_url": "https://number-your-days.web.app",
        "status": "live",
        "featured": False,
        "display_order": 3,
    },
    {
        "title": "KSG ICT Platform",
        "slug": "ksg-ict-platform",
        "short_description": (
            "A full internal ICT management system for Kenya School of Government — "
            "covering asset lifecycle management (procurement to retirement) and a "
            "service desk with SLA tracking, real-time WebSocket notifications, and "
            "role-based access. Deployed on Oracle Cloud VPS with Docker."
        ),
        "case_study": (Path(__file__).parent.parent / "knowledge/projects/ksg_ict.md").read_text(encoding="utf-8"),
        "tech_stack": ["React.js", "Node.js", "Express", "PostgreSQL", "Prisma", "Socket.io", "Docker", "Nginx"],
        "github_url": "https://github.com/Sam-scripter/ksg-ict-platform",
        "playstore_url": "",
        "live_url": "https://ksg-ict.duckdns.org",
        "status": "live",
        "featured": False,
        "display_order": 4,
    },
    {
        "title": "IVY Community — Wardrobe App",
        "slug": "ivy-wardrobe",
        "short_description": (
            "A fashion tech platform with a multi-role Flutter app (store owners, "
            "attendants, customers), a Django REST backend, and a custom Measurement "
            "API using OpenPose computer vision to extract body measurements from "
            "2D photos. Includes R&D on SMPLX 3D body mesh generation."
        ),
        "case_study": (Path(__file__).parent.parent / "knowledge/projects/ivy_community.md").read_text(encoding="utf-8"),
        "tech_stack": ["Flutter", "Dart", "Django", "Python", "OpenPose", "SMPLX", "Firebase", "OpenCV"],
        "github_url": "",
        "playstore_url": "",
        "live_url": "",
        "status": "in_progress",
        "featured": False,
        "display_order": 5,
    },
    {
        "title": "Uasin Gishu IVMS",
        "slug": "uasin-gishu-ivms",
        "short_description": (
            "A Flutter + Django system replacing a paper-based fuel and repair "
            "requisition process for Uasin Gishu County Government. Google Maps API "
            "calculates fuel quotas from actual route distances — directly mitigating "
            "fuel theft. Built during undergraduate final year."
        ),
        "case_study": (Path(__file__).parent.parent / "knowledge/projects/uasin_gishu.md").read_text(encoding="utf-8"),
        "tech_stack": ["Flutter", "Dart", "Django", "Python", "PostgreSQL", "Google Maps API"],
        "github_url": "",
        "playstore_url": "",
        "live_url": "",
        "status": "live",
        "featured": False,
        "display_order": 6,
    },
    {
        "title": "Miseflow",
        "slug": "miseflow",
        "short_description": (
            "An Android AI assistant that reads WhatsApp conversations via Android "
            "Accessibility Service and suggests AI-generated responses in a floating "
            "overlay window — built with a Flutter UI layer over a Kotlin backend "
            "using platform channels."
        ),
        "case_study": (Path(__file__).parent.parent / "knowledge/projects/miseflow.md").read_text(encoding="utf-8"),
        "tech_stack": ["Flutter", "Dart", "Kotlin", "Android SDK", "OpenAI", "Accessibility Service"],
        "github_url": "",
        "playstore_url": "",
        "live_url": "",
        "status": "in_progress",
        "featured": False,
        "display_order": 7,
    },
]


def seed_projects():
    if not DATABASE_URL:
        print("❌ DATABASE_URL not set in backend-python/.env")
        sys.exit(1)

    print("🔌 Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    print("✅ Connected\n")

    inserted = 0
    updated = 0

    for project in PROJECTS:
        cur.execute("""
            INSERT INTO projects (
                title, slug, short_description, case_study,
                tech_stack, github_url, playstore_url, live_url,
                status, featured, display_order
            ) VALUES (
                %(title)s, %(slug)s, %(short_description)s, %(case_study)s,
                %(tech_stack)s, %(github_url)s, %(playstore_url)s, %(live_url)s,
                %(status)s, %(featured)s, %(display_order)s
            )
            ON CONFLICT (slug) DO UPDATE SET
                title             = EXCLUDED.title,
                short_description = EXCLUDED.short_description,
                case_study        = EXCLUDED.case_study,
                tech_stack        = EXCLUDED.tech_stack,
                github_url        = EXCLUDED.github_url,
                playstore_url     = EXCLUDED.playstore_url,
                live_url          = EXCLUDED.live_url,
                status            = EXCLUDED.status,
                featured          = EXCLUDED.featured,
                display_order     = EXCLUDED.display_order,
                updated_at        = now()
            RETURNING (xmax = 0) AS inserted
        """, project)

        row = cur.fetchone()
        if row and row[0]:
            print(f"  ✅ Inserted: {project['title']}")
            inserted += 1
        else:
            print(f"  🔄 Updated:  {project['title']}")
            updated += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"\n{'='*50}")
    print(f"Projects inserted: {inserted}")
    print(f"Projects updated:  {updated}")
    print(f"Total:             {inserted + updated}")
    print(f"{'='*50}")


if __name__ == "__main__":
    seed_projects()