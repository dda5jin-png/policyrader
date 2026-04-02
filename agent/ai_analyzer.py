import google.generativeai as genai
import json
import os
import re
from datetime import datetime

# ══════════════════════════════════════════════
# 설정
# ══════════════════════════════════════════════
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def clean_json_response(text):
    """AI 응답에서 JSON만 추출하는 유틸리티"""
    # ```json ... ``` 또는 ``` ... ``` 블록 추출
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    # 블록이 없으면 텍스트 전체에서 첫 { 와 마지막 } 사이 추출
    match = re.search(r'(\{.*\})', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()

def analyze_post(post):
    prompt = f"""
    당신은 대한민국 '부동산 및 금융 정책 분석가'입니다. 
    아래 보도자료를 분석하여 실질적인 시장 영향과 사용자가 알아야 할 핵심 정보를 리포트 형식으로 요약해주세요.

    [보도자료 제목]: {post['title']}
    [보도자료 본문]: {post['originalText']}

    [분석 가이드라인]:
    1. 부동산 시장(가격, 거래량, 제도)과 가계 금융(대출, 금리, 세금)에 직접적인 영향이 있는 내용을 우선하십시오.
    2. 중립적이고 전문적인 논조를 유지하되, 실무적인 체크리스트를 포함하십시오.
    3. JSON 형식으로만 응답해야 합니다.

    [출력 JSON 구조]:
    {{
      "summary": ["핵심 요약 1", "핵심 요약 2", "핵심 요약 3"],
      "cat": "T(거래·법령), F(금융·거시), X(세제·평가), S(공급·개발), P(프롭테크) 중 하나",
      "catName": "카테고리 한글명",
      "searchPath": "자료를 찾을 수 있는 사이트 메뉴 경로",
      "keyData": [
        {{ "항목": "상세항목명", "수치": "구체적수치", "기준일": "YYYY.MM.DD", "적용대상": "대상자 범위" }}
      ],
      "expertOpinions": [
        {{ "name": "AI 정책 분석기", "affiliation": "초거대 AI 기반 지능형 분석", "stance": "중립/긍정/부정", "comment": "전문가 시각에서의 시장 영향 분석", "source": "Gemini 1.5 Framework" }}
      ],
      "checklist": ["사용자가 즉시 확인하거나 조치해야 할 사항 3가지 이상"],
      "premium": true/false (정말 중요하거나 파급력이 큰 정책인 경우 true)
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        clean_json = clean_json_response(response.text)
        analysis = json.loads(clean_json)
        
        # 기본 정보 병합 (수집된 데이터 유지)
        analysis.update({
            "id": post['id'],
            "headline": post['title'],
            "source": post['source'],
            "sourceUrl": post['link'],
            "date": post['date'],
            "originalText": post['originalText'],
            "views": 0
        })
        return analysis
    except Exception as e:
        print(f"[AI] 분석 실패 ({post['title']}): {e}")
        # 실패 시 최소한의 데이터만이라도 유지하여 반환할 수 있으나, 여기서는 None 반환 후 스킵
        return None

def run_analyzer():
    if not GEMINI_API_KEY:
        print("[AI] API 키가 설정되지 않았습니다. 분석을 스킵합니다.")
        return

    print("[AI] 분석 시작...")
    raw_data_path = 'agent/raw_data.json'
    if not os.path.exists(raw_data_path):
        print(f"[AI] {raw_data_path} 파일이 없습니다.")
        return

    with open(raw_data_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    if not raw_data:
        print("[AI] 분석할 새로운 데이터가 없습니다.")
        return

    analyzed_posts = []
    for p in raw_data:
        print(f"[AI] 분석 중: {p['title']}")
        result = analyze_post(p)
        if result:
            analyzed_posts.append(result)

    # 기존 posts.json 로드 및 병합
    existing_posts = []
    if os.path.exists('posts.json'):
        with open('posts.json', 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if content:
                existing_posts = json.loads(content)

    # 중복 제거 및 업데이트 (ID 기준)
    post_map = {p['id']: p for p in existing_posts}
    for p in analyzed_posts:
        post_map[p['id']] = p

    # 최신순 정렬
    final_posts = sorted(post_map.values(), key=lambda x: x['date'], reverse=True)

    with open('posts.json', 'w', encoding='utf-8') as f:
        json.dump(final_posts, f, ensure_ascii=False, indent=2)
    
    print(f"[AI] {len(analyzed_posts)}건 분석 및 저장 완료 (전체 {len(final_posts)}건).")

if __name__ == "__main__":
    run_analyzer()
