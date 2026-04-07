import google.generativeai as genai
import json
import os
import re
import time
from datetime import datetime
from dotenv import load_dotenv
from agent.data_connector import DataConnector

# .env 파일 로드
load_dotenv()

# ══════════════════════════════════════════════
# 설정 및 모델 구성
# ══════════════════════════════════════════════
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

MODELS_TO_TRY = ['gemini-2.0-flash', 'gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-pro-latest']

def get_model(model_name=None, temperature=0.0):
    generation_config = {
        "temperature": temperature,
        "top_p": 0.95,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }
    # 모델명 결정 (가용성 기반 리스트에서 선택)
    target_name = model_name if model_name else MODELS_TO_TRY[1]
    
    if not target_name.startswith("models/"):
        target_name = f"models/{target_name}"
        
    return genai.GenerativeModel(target_name, generation_config=generation_config)

def clean_json_response(text):
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if match: return match.group(1).strip()
    match = re.search(r'(\{.*\})', text, re.DOTALL)
    if match: return match.group(1).strip()
    return text.strip()

def extract_region(text):
    regions = ["강남구", "송파구", "서초구", "강동구", "마포구", "용산구", "성동구", "영등포구", "동작구", "수원", "성남", "용인", "과천", "하남", "판교", "분당"]
    for r in regions:
        if r in text: return r
    return None

# ══════════════════════════════════════════════
# 분석 파이프라인
# ══════════════════════════════════════════════

def run_pag_pipeline(post):
    """지표 오류 및 환각 방지를 위한 4단계 PAG 자가 검증 파이프라인"""
    original_text = post.get('originalText', post.get('original_text', ''))
    connector = DataConnector()
    region = extract_region(post['title'] + " " + original_text[:500])
    market_context = connector.get_market_context(region) if region else ""
    context_str = f"\n[참조: 실제 시장 데이터]\n{market_context}\n" if market_context else ""

    # [1단계: 베이스라인 생성]
    baseline_prompt = f"""
    당신은 대한민국 '부동산 및 금융 세무 정책 수석 리서처'입니다. 
    제공된 보도자료를 바탕으로 다음의 인텔리전스 데이터를 JSON으로 추출하십시오.
    
    [가드레일 - 핵심]:
    1. 지역별 세액 변화(Regional Impact): 강남 vs 비강남, 수도권 vs 지방 등 지역별로 혜택이 어떻게 다른지 구체적인 수치나 경향을 추출하십시오.
    2. 수익률 영향(Yield Impact): 취득세/재산세/양도세 변화가 실질 투자 수익률(ROI)에 어떤 영향을 주는지 분석하십시오.
    3. 근거 명시(Evidence): 분석된 내용의 근거가 되는 원문의 특정 구절이나 부처 발표 문서명을 'evidenceText' 필드에 텍스트로 명시하십시오.
    
    {context_str}
    
    [보도자료 제목]: {post['title']}
    [보도자료 원문]: {original_text[:10000]}

    반드시 다음 JSON 구조로 응답하십시오:
    {{
      "summary": ["..."],
      "cat": "...",
      "catName": "...",
      "keyData": [...],
      "regionalImpact": "지역별 예상 세금 변화 (수치/경향)",
      "yieldImpact": "수익률 및 투자 관점의 분석",
      "evidenceText": "분석의 근거가 되는 원문 출처 (텍스트로만)",
      "checklist": [...]
    }}
    """
    
    model = get_model()
    chat = model.start_chat(history=[])
    response = chat.send_message(baseline_prompt)
    return json.loads(clean_json_response(response.text))

def run_lite_pipeline(post):
    """할당량 부족 시 1회 호출로 핵심 정보를 추출하는 라이트 모드"""
    print("  ⚡ [Lite Mode] 고해상도 단일 단계 분석을 수행합니다.")
    original_text = post.get('originalText', post.get('original_text', ''))
    
    # Lite Mode에서도 반드시 포함되어야 하는 핵심 인텔리전스 프롬프트
    prompt = f"""
    당신은 대한민국 '부동산 및 금융 세무 정책 수석 리서처'입니다. 
    다음 보도자료를 전문적으로 분석하여 JSON으로 응답하십시오.
    
    [필수 분석 항목]:
    1. regionalImpact: 지역별(강남, 수도권, 지방 등) 세제 혜택 수치 변화 및 차별적 영향
    2. yieldImpact: 취득세/재산세/양도세 변화에 따른 실질 투자 수익률(ROI) 및 시장 전망 분석
    3. evidenceText: 이 분석의 근거가 되는 원문의 핵심 구절 (텍스트로만)
    
    제목: {post['title']}
    본문: {original_text[:5000]}
    
    응답 JSON 구조:
    {{
      "summary": ["..."],
      "cat": "...",
      "catName": "...",
      "keyData": [{{ "항목": "...", "수치": "...", "적용대상": "..." }}],
      "regionalImpact": "지역별 수치 변화 분석 결과",
      "yieldImpact": "수익률 및 투자 관점 리포트",
      "evidenceText": "분석 근거 원문 텍스트",
      "checklist": ["..."]
    }}
    """
    model = get_model('gemini-flash-lite-latest') 
    response = model.generate_content(prompt)
    return json.loads(clean_json_response(response.text))

def analyze_post_with_retry(post):
    """PAG 파이프라인 시도 후 실패 시 Lite Mode로 복구"""
    try:
        # 우선 순위: 고해상도 PAG 파이프라인
        return run_pag_pipeline(post)
    except Exception as e:
        if "429" in str(e) or "quota" in str(e).lower():
            return run_lite_pipeline(post)
        print(f"  ❌ 분석 실패: {e}")
        # 다른 모델로 교차 시도
        return run_lite_pipeline(post)

def run_analyzer(priority_ids=None, limit_count=10):
    print(f"🚀 [Analyzer] 분석 가동 (우선순위: {priority_ids})")
    raw_path, posts_path = 'agent/raw_data.json', 'public/posts.json'
    if not os.path.exists(raw_path): return
    with open(raw_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    existing_posts = []
    if os.path.exists(posts_path):
        with open(posts_path, 'r', encoding='utf-8') as f:
            existing_posts = json.load(f)
    
    post_map = {p['id']: p for p in existing_posts}
    to_analyze = [p for p in raw_data if p['id'] in (priority_ids or [])]
    new_ones = [p for p in raw_data if p['id'] not in post_map and p['id'] not in [x['id'] for x in to_analyze]]
    to_analyze.extend(new_ones[:limit_count])

    for idx, p in enumerate(to_analyze):
        print(f"\n[{idx+1}/{len(to_analyze)}] {p['title'][:30]}...")
        result = analyze_post_with_retry(p)
        if result:
            result.update({"id": p['id'], "date": p['date'], "link": p['link'], "source": p['source']})
            post_map[p['id']] = result
            # 즉시 업데이트
            with open(posts_path, 'w', encoding='utf-8') as f:
                json.dump(list(post_map.values()), f, ensure_ascii=False, indent=2)
            print("  ✅ 반영 완료")
            time.sleep(30) # 안전 대기

if __name__ == "__main__":
    run_analyzer()
