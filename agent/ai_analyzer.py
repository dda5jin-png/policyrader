import google.generativeai as genai
import json
import os
import re
import time
from datetime import datetime
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# ══════════════════════════════════════════════
# 설정
# ══════════════════════════════════════════════
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# 가용 모델 목록 (무료 티어에서 가장 안정적인 모델 우선)
MODELS_TO_TRY = ['gemini-flash-latest', 'gemini-1.5-flash', 'gemini-2.0-flash']

def get_model():
    """가용한 모델 중 하나를 선택하여 반환합니다."""
    for model_name in MODELS_TO_TRY:
        try:
            # 모델명을 명확히 지정 (models/ 접두어 포함 권장)
            m_name = f"models/{model_name}" if not model_name.startswith("models/") else model_name
            m = genai.GenerativeModel(m_name)
            print(f"[AI] 모델 설정 완료: {model_name}")
            return m
        except:
            continue
    return genai.GenerativeModel('gemini-pro')

model = get_model()

def clean_json_response(text):
    """AI 응답에서 JSON만 추출하는 유틸리티"""
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    match = re.search(r'(\{.*\})', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()

def analyze_post_with_retry(post, retries=3):
    """할당량 초과 시 재시도 로직이 포함된 분석 함수"""
    prompt = f"""
    당신은 대한민국 '부동산 및 금융 정책 분석가'입니다. 
    아래 보도자료를 분석하여 실질적인 시장 영향과 사용자가 알아야 할 핵심 정보를 리포트 형식으로 요약해주세요.

    [보도자료 제목]: {post['title']}
    [보도자료 본문]: {post['originalText'][:5000]} # 너무 길면 잘라냄

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
        {{ "name": "AI 정책 분석기", "affiliation": "초거대 AI 기반 지능형 분석", "stance": "중립/긍정/부정", "comment": "전문가 시각에서의 시장 영향 분석", "source": "Gemini Engine" }}
      ],
      "checklist": ["사용자가 즉시 확인하거나 조치해야 할 사항 3가지 이상"],
      "premium": true/false
    }}
    """
    
    for i in range(retries):
        try:
            response = model.generate_content(prompt)
            clean_json = clean_json_response(response.text)
            analysis = json.loads(clean_json)
            
            analysis.update({
                "id": post['id'],
                "headline": post['title'],
                "source": post['source'],
                "sourceUrl": post['link'],
                "date": post['date'],
                "originalText": post['originalText'][:1000], # 저장용 데이터는 요약
                "views": post.get('views', 0)
            })
            return analysis
        except Exception as e:
            if "quota" in str(e).lower() or "429" in str(e):
                wait_time = (i + 1) * 20 # 할당량 초과 시 점진적으로 대기 시간 증가
                print(f"  [AI] 할당량 초과. {wait_time}초 후 재시도 합니다... ({i+1}/{retries})")
                time.sleep(wait_time)
            else:
                print(f"[AI] 분석 실패 ({post['title']}): {e}")
                break
                
    return None # 실패 시

def run_analyzer(limit_count=30):
    if not GEMINI_API_KEY:
        print("[AI] API 키 오류")
        return

    print(f"[AI] 분석 프로세스 가동 (최대 {limit_count}건 우선 분석)...")
    raw_data_path = 'agent/raw_data.json'
    if not os.path.exists(raw_data_path): return

    with open(raw_data_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    if not raw_data: return

    # 기존 데이터 로드
    existing_posts = []
    if os.path.exists('posts.json'):
        with open('posts.json', 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if content: existing_posts = json.loads(content)
    
    existing_ids = {p['id'] for p in existing_posts}
    
    analyzed_count = 0
    new_analyzed_posts = []
    
    # 최신 데이터부터 순회
    for p in raw_data:
        if analyzed_count >= limit_count: break
        if p['id'] in existing_ids: continue
            
        print(f"[AI] ({analyzed_count+1}/{limit_count}) 분석 중: {p['title'][:40]}...")
        result = analyze_post_with_retry(p)
        if result:
            new_analyzed_posts.append(result)
            analyzed_count += 1
            time.sleep(10) # 무료 티어 안전 대기 시간

    if not new_analyzed_posts:
        print("[AI] 새로 분석된 내용이 없습니다.")
        return

    # 병합
    post_map = {p['id']: p for p in existing_posts}
    for p in new_analyzed_posts:
        post_map[p['id']] = p

    final_posts = sorted(post_map.values(), key=lambda x: x['date'], reverse=True)

    with open('posts.json', 'w', encoding='utf-8') as f:
        json.dump(final_posts, f, ensure_ascii=False, indent=2)
    
    print(f"[AI] {len(new_analyzed_posts)}건 분석 완료.")

if __name__ == "__main__":
    run_analyzer(limit_count=30)
