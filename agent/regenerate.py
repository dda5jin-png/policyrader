"""기존 발행 글을 새 분석 파이프라인으로 재생성하는 스크립트.

사용 예:
  python agent/regenerate.py --days 90            # 최근 90일 글 재생성
  python agent/regenerate.py --days 90 --limit 5  # 최근 90일 중 5건만 (테스트)
  python agent/regenerate.py --ids api_123 api_456
  python agent/regenerate.py --days 90 --dry-run  # 대상 목록만 출력

원문은 sourceUrl(korea.kr)에서 재스크래핑하며, 실패 시 기존 분석 텍스트를
원문 대용으로 사용합니다. 처리 건마다 posts.json에 즉시 저장합니다.
"""
import argparse
import os
import sys
import time
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__)))

from fetcher import scrape_full_content
from ai_analyzer import analyze_post_with_retry
from post_processor import load_posts, normalize_post, save_posts, validate_posts

POSTS_PATH = "public/posts.json"


def build_fallback_text(post):
    """스크래핑 실패 시 기존 데이터로 원문 대용 텍스트 구성."""
    parts = [post.get("headline", "")]
    if post.get("evidenceText"):
        parts.append(post["evidenceText"])
    sections = post.get("content_sections") or {}
    for key in ["summary", "meaning", "market_impact", "investor_insight"]:
        if sections.get(key):
            parts.append(sections[key])
    for item in post.get("summary") or []:
        parts.append(item)
    return "\n".join(p for p in parts if p)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=90, help="재생성 대상 기간(일)")
    parser.add_argument("--limit", type=int, default=0, help="최대 처리 건수 (0=무제한)")
    parser.add_argument("--ids", nargs="*", default=None, help="특정 post id만 재생성")
    parser.add_argument("--dry-run", action="store_true", help="대상 목록만 출력")
    parser.add_argument("--delay", type=int, default=int(os.getenv("ANALYZER_BETWEEN_POST_DELAY_SECONDS", "10")), help="건당 대기 시간(초)")
    parser.add_argument("--min-chars", type=int, default=0, help="이 값보다 분석 분량이 많은 글은 건너뜀 (0=전부 재생성)")
    args = parser.parse_args()

    posts = load_posts(POSTS_PATH)
    if not posts:
        print("❌ posts.json이 비어 있습니다.")
        return 1

    cutoff = (datetime.now() - timedelta(days=args.days)).strftime("%Y-%m-%d")

    if args.ids:
        targets = [p for p in posts if p.get("id") in set(args.ids)]
    else:
        targets = [p for p in posts if (p.get("date") or "") >= cutoff]

    if args.min_chars > 0:
        def total_len(p):
            cs = p.get("content_sections") or {}
            return sum(len(cs.get(k) or "") for k in ["summary", "meaning", "market_impact", "investor_insight"])
        targets = [p for p in targets if total_len(p) < args.min_chars]

    targets.sort(key=lambda p: p.get("date") or "", reverse=True)
    if args.limit > 0:
        targets = targets[: args.limit]

    print(f"🎯 재생성 대상: {len(targets)}건 (기준일 {cutoff} 이후)")
    if args.dry_run:
        for p in targets:
            print(f"  - {p.get('date')} [{p.get('id')}] {p.get('headline', '')[:50]}")
        return 0

    post_map = {p["id"]: p for p in posts}
    succeeded, failed = 0, []

    for idx, post in enumerate(targets):
        pid = post.get("id")
        url = post.get("sourceUrl") or post.get("link") or ""
        print(f"\n[{idx + 1}/{len(targets)}] {post.get('date')} {post.get('headline', '')[:40]}")

        original_text = scrape_full_content(url) if url else ""
        if original_text and len(original_text) >= 200:
            print(f"  📄 원문 재스크래핑 성공 ({len(original_text)}자)")
        else:
            original_text = build_fallback_text(post)
            print(f"  ⚠️ 원문 스크래핑 실패 → 기존 텍스트 기반 재분석 ({len(original_text)}자)")

        pseudo_raw = {
            "id": pid,
            "title": post.get("headline", ""),
            "link": url,
            "date": post.get("date", ""),
            "source": post.get("source", ""),
            "views": post.get("views", 0),
            "originalText": original_text,
        }

        try:
            result = analyze_post_with_retry(pseudo_raw, skip_relevance=True)
        except Exception as error:
            failed.append({"id": pid, "error": str(error)})
            print(f"  ❌ 분석 실패: {error}")
            continue

        if not result or result == "FILTERED":
            failed.append({"id": pid, "error": "empty or filtered result"})
            print("  ❌ 결과 없음")
            continue

        result.update({
            "id": pid,
            "date": post.get("date", ""),
            "link": url,
            "source": post.get("source", ""),
            "sourceUrl": url,
            "views": post.get("views", 0),
            "regenerated_at": datetime.now().strftime("%Y-%m-%d"),
        })
        normalized, warnings = normalize_post(result, source_post=pseudo_raw)
        for warning in warnings:
            print(f"  ⚠️ {warning}")
        post_map[pid] = normalized
        save_posts(list(post_map.values()), POSTS_PATH)
        succeeded += 1
        print("  ✅ 재생성 완료 및 저장")
        time.sleep(args.delay)

    issues = validate_posts(load_posts(POSTS_PATH))
    if issues:
        print(f"⚠️ 검증 경고 {len(issues)}건: {issues[:5]}")

    print(f"\n🏁 완료: 성공 {succeeded} / 실패 {len(failed)}")
    for f in failed[:10]:
        print(f"  - {f['id']}: {f['error']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
