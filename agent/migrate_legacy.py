import json
import os

posts_path = os.path.join(os.path.dirname(__file__), "..", "public", "posts.json")
with open(posts_path, "r", encoding="utf-8") as f:
    posts = json.load(f)

migrated_count = 0
for post in posts:
    if "content_sections" not in post or not post["content_sections"]:
        # Map old data to new format
        summary_text = " ".join(post.get("summary", []))
        
        market_impact = ""
        if post.get("regionalImpact"):
            market_impact += f"지역 영향: {post['regionalImpact']}\n\n"
        if post.get("yieldImpact"):
            market_impact += f"수익률 영향: {post['yieldImpact']}"
            
        investor_insight = ""
        for opinion in post.get("expertOpinions", []):
            investor_insight += f"[{opinion.get('name', '전문가')} - {opinion.get('affiliation', '')}] {opinion.get('comment', '')}\n\n"
            
        if post.get("checklist"):
            investor_insight += "확인 포인트:\n" + "\n".join([f"- {c}" for c in post["checklist"]])

        meaning = post.get("evidenceText", "상세 근거는 원문을 참고하세요.")

        post["content_sections"] = {
            "summary": summary_text or "요약 정보가 없습니다.",
            "meaning": meaning,
            "market_impact": market_impact.strip() or "시장 영향 정보가 없습니다.",
            "investor_insight": investor_insight.strip() or "인사이트 정보가 없습니다."
        }
        
        if "post_type" not in post:
            post["post_type"] = "insight"
            
        migrated_count += 1

with open(posts_path, "w", encoding="utf-8") as f:
    json.dump(posts, f, ensure_ascii=False, indent=2)

print(f"Migrated {migrated_count} legacy posts to the new content_sections format.")
