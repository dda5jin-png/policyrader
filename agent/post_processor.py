import json
import os
import re
from typing import Any, Dict, List, Optional, Set, Tuple

POSTS_PATH = "public/posts.json"

CAT_NAMES = {
    "F": "부동산 금융정책",
    "X": "부동산 세금정책",
    "S": "부동산 공급·개발정책",
    "T": "부동산 거래·법령",
    "R": "부동산 임대·주거정책",
    "P": "프롭테크",
}

CAT_KEYWORDS = {
    "X": ["세제", "세금", "양도세", "취득세", "재산세", "종부세", "상속세", "증여세", "지방세", "공시가격", "과세"],
    "F": ["금융", "대출", "가계부채", "LTV", "DSR", "보증", "금리", "서민금융", "채권", "펀드"],
    "S": ["공급", "개발", "주택통계", "공공주택", "신도시", "재건축", "재개발", "착공", "분양", "철도", "GTX"],
    "T": ["규제", "거래", "법령", "토지이용", "허가", "중개", "시장", "설명", "고시"],
    "R": ["임대", "전세", "월세", "주거복지", "갱신", "공공임대"],
    "P": ["프롭테크", "스타트업", "디지털", "플랫폼", "데이터", "스마트"],
}


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    if not isinstance(value, str):
        value = str(value)
    value = re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()
    return value


def _collect_text(post: Dict[str, Any], source_post: Optional[Dict[str, Any]] = None) -> str:
    parts = [
        post.get("headline"),
        post.get("title"),
        post.get("catName"),
        post.get("source"),
        post.get("originalText"),
    ]
    if source_post:
        parts.extend([
            source_post.get("title"),
            source_post.get("source"),
            source_post.get("originalText"),
        ])
    parts.extend([
        post.get("policy_summary", {}).get("title") if isinstance(post.get("policy_summary"), dict) else "",
    ])
    return " ".join(_clean_text(part) for part in parts if part)


def _infer_category(post: Dict[str, Any], source_post: Optional[Dict[str, Any]] = None) -> str:
    cat = _clean_text(post.get("cat")).upper()
    if cat in CAT_NAMES:
        return cat

    searchable = " ".join(
        [
            cat,
            _clean_text(post.get("catName")),
            _collect_text(post, source_post),
        ]
    )

    if "TAX_POLICY" in searchable or "세무" in searchable:
        return "X"
    if "RE_POLICY" in searchable:
        return "X"

    best_cat = "S"
    best_score = -1
    for candidate, keywords in CAT_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in searchable)
        if score > best_score:
            best_cat = candidate
            best_score = score
    return best_cat


def _fallback_summary(post: Dict[str, Any], source_post: Optional[Dict[str, Any]] = None) -> List[str]:
    title = _clean_text(post.get("headline") or post.get("title"))
    if not title and source_post:
        title = _clean_text(source_post.get("title"))
    text = _clean_text(post.get("originalText") or (source_post or {}).get("originalText"))
    sentence_candidates = [s.strip() for s in re.split(r"[.\n]", text) if s.strip()]

    summary: List[str] = []
    if title:
        summary.append(f"{title} 관련 정책 자료입니다.")
    for sentence in sentence_candidates:
        if len(summary) >= 3:
            break
        if sentence not in summary:
            summary.append(sentence[:140])
    if not summary:
        summary = ["정책 원문 기반 후속 분석이 필요한 자료입니다."]
    return summary[:3]


def _fallback_key_data(post: Dict[str, Any], cat: str) -> List[Dict[str, str]]:
    return [
        {
            "항목": "발행일",
            "수치": _clean_text(post.get("date")) or "정보 확인 필요",
            "적용대상": _clean_text(post.get("source")) or "정책 수요자",
        },
        {
            "항목": "정책 분류",
            "수치": CAT_NAMES.get(cat, cat),
            "적용대상": "정책 수요자",
        },
    ]


def _fallback_expert_opinions(post: Dict[str, Any], cat: str) -> List[Dict[str, str]]:
    headline = _clean_text(post.get("headline") or post.get("title")) or "이 정책"
    return [
        {
            "name": "지능형 분석 리서치",
            "affiliation": "Policy Radar Research",
            "comment": f"{headline}는 {CAT_NAMES.get(cat, '정책')} 흐름에서 핵심 포인트와 실제 적용 범위를 함께 확인해야 하는 자료입니다.",
        }
    ]


def _fallback_checklist(post: Dict[str, Any], cat: str) -> List[str]:
    source = _clean_text(post.get("source")) or "관계부처"
    category_name = CAT_NAMES.get(cat, "정책")
    return [
        f"{source} 원문과 첨부자료 기준으로 세부 시행 요건 확인",
        f"{category_name} 관련 기존 보유 자산·대출·거래 계획에 미치는 영향 점검",
        "후속 시행령·고시·지침 발표 여부 모니터링",
    ]


def normalize_post(post: Dict[str, Any], source_post: Optional[Dict[str, Any]] = None) -> Tuple[Dict[str, Any], List[str]]:
    normalized = dict(post)
    warnings: List[str] = []

    cat = _infer_category(normalized, source_post)
    if normalized.get("cat") != cat:
        warnings.append(f"cat normalized: {normalized.get('cat')} -> {cat}")
    normalized["cat"] = cat
    normalized["catName"] = CAT_NAMES[cat]

    headline = _clean_text(
        normalized.get("headline")
        or normalized.get("title")
        or (normalized.get("policy_summary", {}) or {}).get("title")
        or (source_post or {}).get("title")
    )
    if not headline:
        headline = "제목 확인 필요"
        warnings.append("headline fallback applied")
    normalized["headline"] = headline

    source_url = _clean_text(normalized.get("sourceUrl") or normalized.get("link") or (source_post or {}).get("link"))
    if source_url:
        normalized["sourceUrl"] = source_url
    else:
        warnings.append("sourceUrl missing")

    if source_post:
        normalized.setdefault("source", source_post.get("source"))
        normalized.setdefault("date", source_post.get("date"))
        normalized.setdefault("link", source_post.get("link"))
        normalized.setdefault("views", source_post.get("views", 0))

    # checklist 처리
    checklist_raw = normalized.get("checklist", [])
    if isinstance(checklist_raw, str):
        checklist_items = [_clean_text(checklist_raw)]
    elif isinstance(checklist_raw, list):
        checklist_items = [_clean_text(item) for item in checklist_raw]
    else:
        checklist_items = []
        
    checklist_items = [item for item in checklist_items if item]
    if not checklist_items:
        checklist_items = _fallback_checklist(normalized, cat)
        warnings.append("checklist fallback applied")
    normalized["checklist"] = checklist_items

    # post_type 및 4단 구조(content_sections) 처리
    post_type = _clean_text(normalized.get("post_type", ""))
    if post_type not in ["insight", "analysis", "opinion"]:
        post_type = "insight"
    normalized["post_type"] = post_type

    sections = normalized.get("content_sections", {})
    if sections and isinstance(sections, dict):
        for sec_key in ["summary", "meaning", "market_impact", "investor_insight"]:
            if not _clean_text(sections.get(sec_key)):
                sections[sec_key] = _fallback_summary(normalized, source_post)[0] if sec_key == "summary" else "내용 확인 필요"
        normalized["content_sections"] = sections
        # To maintain compatibility or allow UI to pick, we optionally don't touch top-level summary,
        # but let's remove it if it exists so we don't duplicate.
        if "summary" in normalized and not isinstance(normalized["summary"], list):
            pass # We leave it for now
    else:
        # 과거 데이터: summary 리스트 처리
        summary_raw = normalized.get("summary", [])
        if isinstance(summary_raw, str):
            summary_items = [_clean_text(summary_raw)]
        elif isinstance(summary_raw, list):
            summary_items = [_clean_text(item) for item in summary_raw]
        else:
            summary_items = []
            
        summary_items = [item for item in summary_items if item]
        if not summary_items:
            summary_items = _fallback_summary(normalized, source_post)
            warnings.append("summary fallback applied")
        normalized["summary"] = summary_items

    key_data = normalized.get("keyData")
    key_data_items = []
    if isinstance(key_data, list):
        for entry in key_data:
            if not isinstance(entry, dict):
                continue
            item = dict(entry)
            item["항목"] = _clean_text(entry.get("항목"))
            item["수치"] = _clean_text(entry.get("수치"))
            item["적용대상"] = _clean_text(entry.get("적용대상"))
            if item["항목"] and item["수치"]:
                if not item["적용대상"]:
                    item["적용대상"] = "정책 수요자"
                key_data_items.append(item)
    if not key_data_items:
        key_data_items = _fallback_key_data(normalized, cat)
        warnings.append("keyData fallback applied")
    normalized["keyData"] = key_data_items

    opinions = normalized.get("expertOpinions")
    normalized_opinions = []
    if isinstance(opinions, list):
        for opinion in opinions:
            if not isinstance(opinion, dict):
                continue
            comment = _clean_text(opinion.get("comment"))
            affiliation = _clean_text(opinion.get("affiliation")) or "Policy Radar Research"
            name = _clean_text(opinion.get("name")) or "지능형 분석 리서치"
            if comment:
                normalized_opinion = dict(opinion)
                normalized_opinion["name"] = name
                normalized_opinion["affiliation"] = affiliation
                normalized_opinion["comment"] = comment
                normalized_opinions.append(normalized_opinion)
    if not normalized_opinions:
        normalized_opinions = _fallback_expert_opinions(normalized, cat)
        warnings.append("expertOpinions fallback applied")
    normalized["expertOpinions"] = normalized_opinions

    normalized["source"] = _clean_text(normalized.get("source") or (source_post or {}).get("source")) or "출처 확인 필요"
    normalized["date"] = _clean_text(normalized.get("date") or (source_post or {}).get("date")) or "1970-01-01"
    normalized["id"] = _clean_text(normalized.get("id") or (source_post or {}).get("id"))
    normalized["views"] = normalized.get("views", 0)

    return normalized, warnings


def normalize_posts(posts: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[str]]:
    normalized_posts: List[Dict[str, Any]] = []
    warnings: List[str] = []
    for post in posts:
        normalized, post_warnings = normalize_post(post)
        normalized_posts.append(normalized)
        warnings.extend(f"{normalized.get('id', 'unknown')}: {warning}" for warning in post_warnings)
    return normalized_posts, warnings


def validate_posts(posts: List[Dict[str, Any]]) -> List[str]:
    issues: List[str] = []
    seen_ids: Set[str] = set()

    for index, post in enumerate(posts):
        post_id = _clean_text(post.get("id")) or f"index:{index}"
        if post_id in seen_ids:
            issues.append(f"{post_id}: duplicate id")
        seen_ids.add(post_id)

        if _clean_text(post.get("cat")) not in CAT_NAMES:
            issues.append(f"{post_id}: invalid cat {post.get('cat')}")

        for field in ["headline", "date", "source", "sourceUrl"]:
            if not _clean_text(post.get(field)):
                issues.append(f"{post_id}: missing {field}")

        # "summary" can be missing if "content_sections" is present
        has_summary = bool(post.get("summary")) or bool(post.get("content_sections"))
        if not has_summary:
            issues.append(f"{post_id}: missing summary or content_sections")
            
        for field in ["keyData", "expertOpinions", "checklist"]:
            val = post.get(field)
            if not val:
                issues.append(f"{post_id}: missing or empty {field}")
            elif not isinstance(val, list):
                issues.append(f"{post_id}: {field} must be a list")

    return issues


def load_posts(path: str = POSTS_PATH) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as file:
        data = json.load(file)
    return data if isinstance(data, list) else []


def save_posts(posts: List[Dict[str, Any]], path: str = POSTS_PATH) -> None:
    sorted_posts = sorted(posts, key=lambda post: _clean_text(post.get("date")), reverse=True)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(sorted_posts, file, ensure_ascii=False, indent=2)
