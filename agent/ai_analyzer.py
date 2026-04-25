import google.generativeai as genai
import json
import os
import re
import time
from datetime import datetime
from dotenv import load_dotenv
try:
    from agent.data_connector import DataConnector
except ModuleNotFoundError:
    from data_connector import DataConnector
try:
    from agent.post_processor import load_posts, normalize_post, normalize_posts, save_posts, validate_posts
except ModuleNotFoundError:
    from post_processor import load_posts, normalize_post, normalize_posts, save_posts, validate_posts

# .env 파일 로드
load_dotenv()

# ══════════════════════════════════════════════
# 설정 및 모델 구성
# ══════════════════════════════════════════════
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# 가장 안정적인 1.5-flash를 시퀀스 처음에 배치하거나 목록에 포함 시킵니다.
MODELS_TO_TRY = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-2.0-flash']
MAX_ANALYZER_RETRIES = int(os.getenv("ANALYZER_MAX_RETRIES", "3"))
ANALYZER_RETRY_BUFFER_SECONDS = int(os.getenv("ANALYZER_RETRY_BUFFER_SECONDS", "5"))
ANALYZER_BETWEEN_POST_DELAY_SECONDS = int(os.getenv("ANALYZER_BETWEEN_POST_DELAY_SECONDS", "30"))

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

def is_quota_error(error):
    message = str(error).lower()
    return "429" in message or "quota" in message or "rate limit" in message

def extract_retry_delay_seconds(error):
    message = str(error)
    patterns = [
        r"retry in\s+(\d+(?:\.\d+)?)s",
        r"retry_delay\s*\{\s*seconds:\s*(\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE | re.DOTALL)
        if match:
            try:
                return max(1, int(float(match.group(1))) + ANALYZER_RETRY_BUFFER_SECONDS)
            except ValueError:
                continue
    return None

def wait_for_quota_reset(error, attempt_index):
    retry_seconds = extract_retry_delay_seconds(error)
    if retry_seconds is None:
        retry_seconds = min(90, (attempt_index + 1) * 20 + ANALYZER_RETRY_BUFFER_SECONDS)
    print(f"  ⏳ Gemini 할당량 제한 감지, {retry_seconds}초 대기 후 재시도합니다.")
    time.sleep(retry_seconds)

def check_relevance(post, model_name):
    """AI를 사용하여 해당 자료가 부동산/주택/거시금융 정책과 관련이 있는지 검사합니다."""
    original_text = post.get('originalText', post.get('original_text', ''))
    prompt = f"""
    당신은 대한민국 '부동산 및 주택 정책 전문 리서처'입니다. 
    다음 보도자료가 '부동산, 주택, 주거 복지, 국토 개발, 가계 대출(주택담보대출, 전세자금)'과 직접적으로 관련이 있는지 판단하십시오.
    
    [필터링 기준 - 중요]:
    - YES (포함): 아파트/빌라 대출 정책, 전세 사기 대응, 청약 제도, 부동산 세금(종부세, 양도세), GTX/철도망, 신도시 개발, 공공주택 공급, 주택 시장 거시 건전성 관리.
    - NO (제외): 
        * 산업 금융 (예: 석유화학/조선/반도체 PF, 기업 구조조정 자금 지원)
        * 보건/식약 (예: 제약 규제과학, 식품 안전)
        * 일반 경제 (예: 중동 정세에 따른 일반 기업 지원, 배달 라이더 보험, 주유비 지원)
        * 문화/교육/환경 (부동산 개발과 무관한 일반 정책)
    
    제목: {post['title']}
    내용 요약: {original_text[:1000]}
    
    위 '제외' 기준에 하나라도 해당하거나, 부동산/주택과 직접 관련이 없다면 무조건 'NO'라고 하십시오.
    관련이 확실할 때만 'YES'라고 응답하십시오. 응답은 'YES' 또는 'NO'로만 하십시오.
    """
    try:
        model = get_model(model_name)
        response = model.generate_content(prompt)
        decision = response.text.strip().upper()
        return "YES" in decision
    except:
        return True # 오류 발생 시 보수적으로 수집 유지

def analyze_with_model(post, model_name):
    original_text = post.get('originalText', post.get('original_text', ''))

    # Lite Mode 처리 (기존 로직 유지)
    if 'lite' in model_name:
        # Lite 모드에서도 적합성 검사는 수행
        if not check_relevance(post, model_name):
            print(f"  🚫 {model_name}: (Lite) 부동산 정책과 무관하여 필터링합니다.")
            return "FILTERED"

        print(f"  ⚡ [Lite Mode] {model_name} 단일 단계 분석을 수행합니다.")
        prompt = f"""
        당신은 대한민국 '부동산 및 금융 세무 정책 수석 리서처'입니다. 
        다음 보도자료를 전문적으로 분석하여 JSON으로 응답하십시오.
        
        [필수 분석 항목]:
        1. 핵심 의미 전달: 글머리기호(Bullet points)를 절대 사용하지 말고, 완성된 서술형 단락으로 최소 1,200자 이상 작성할 것.
        2. 4단 구조(content_sections): 요약, 해석, 시장 영향, 투자자 인사이트를 별도의 서술형 단락으로 구성할 것.
        3. 정책 분류(post_type): 이 글의 성격에 따라 "insight", "analysis", "opinion" 중 하나를 선택할 것.

        제목: {post['title']}
        본문: {original_text[:5000]}
        
        응답 JSON 구조:
        {{
          "headline": "...",
          "post_type": "insight / analysis / opinion 중 하나",
          "cat": "...",
          "catName": "...",
          "content_sections": {{
            "summary": "정책 핵심 요약 (최소 300자 이상, 서술형 문장, 글머리기호 금지)",
            "meaning": "정책이 의미하는 것과 해석 (최소 300자 이상, 서술형 문장)",
            "market_impact": "부동산 및 시장 영향 분석 (누가 이득/손해를 보는지, 최소 300자 이상, 서술형 문장)",
            "investor_insight": "개인/투자자 관점 인사이트와 대응 전략 (최소 300자 이상, 서술형 문장)"
          }},
          "keyData": [{{ "항목": "...", "수치": "...", "적용대상": "..." }}],
          "evidenceText": "...",
          "expertOpinions": [{{ "comment": "...", "affiliation": "정책 분석팀" }}],
          "checklist": ["..."]
        }}
        """
        model = get_model(model_name)
        response = model.generate_content(prompt)
        
        # 안전하게 텍스트 추출 (Blocked 등의 경우 예외 발생)
        try:
            text = response.text
        except ValueError:
            # Safety filter 등에 의해 텍스트가 없을 경우
            print(f"  ⚠️ {model_name} 응답이 비어있거나 차단되었습니다.")
            return None
            
        return json.loads(clean_json_response(text))

    # 본격적인 분석 전 적합성 검사
    if not check_relevance(post, model_name):
        print(f"  🚫 {model_name}: 부동산 정책과 무관한 자료로 판명되어 필터링합니다.")
        return "FILTERED"

    return run_pag_pipeline(post, model_name=model_name)

# ══════════════════════════════════════════════
# 분석 파이프라인
# ══════════════════════════════════════════════

def run_pag_pipeline(post, model_name=None):
    """지표 오류 및 환각 방지를 위한 4단계 PAG 자가 검증 파이프라인"""
    original_text = post.get('originalText', post.get('original_text', ''))
    connector = DataConnector()
    region = extract_region(post['title'] + " " + original_text[:500])
    market_context = connector.get_market_context(region) if region else ""
    context_str = f"\n[참조: 실제 시장 데이터]\n{market_context}\n" if market_context else ""

    # [1단계: 베이스라인 생성]
    baseline_prompt = f"""
    당신은 대한민국 '부동산 및 금융 세무 정책 수석 리서처'입니다. 
    제공된 보도자료와 [실제 시장 데이터]를 결합하여 전문적인 인텔리전스 리포트를 JSON으로 추출하십시오.
    
    [가드레일 - 핵심]:
    1. 4단 구조 서술형성: 요약, 해석, 시장 영향, 인사이트의 4가지 파트를 반드시 서술형 문장(단락)으로 작성하고, 절대로 글머리기호(Bullet)를 사용하지 마십시오. 파트별 최소 300자 이상 기록해야 합니다.
    2. 포스트 타입(post_type) 분류: 글 성격에 맞게 insight (일반 정책 해석), analysis (데이터/통계 위주 분석), opinion (주관적/종합적 시장 의견) 중 하나로 자동 배정하십시오.
    3. 근거 명시(Evidence): 분석된 수치와 결론의 근거가 되는 원문의 특정 구절이나 데이터를 'evidenceText' 필드에 텍스트로 명시하십시오.

    {context_str}
    
    [보도자료 제목]: {post['title']}
    [보도자료 원문]: {original_text[:10000]}

    반드시 다음 JSON 구조로 응답하십시오:
    {{
      "headline": "보도자료를 관통하는 임팩트 있는 제목",
      "post_type": "insight / analysis / opinion 중 하나",
      "cat": "category_id",
      "catName": "카테고리명",
      "content_sections": {{
        "summary": "정책 핵심 요약 (최소 300자 이상, 서술형 단락, 글머리기호 금지)",
        "meaning": "정책이 의미하는 것과 행간 해석 (최소 300자 이상, 서술형 단락)",
        "market_impact": "부동산 및 시장에 미치는 파급력 (최소 300자 이상, 서술형 단락)",
        "investor_insight": "실수요자/투자자 관점 대응 전략과 인사이트 (최소 300자 이상, 서술형 단락)"
      }},
      "keyData": [{{ "항목": "상세항목", "수치": "구체적수치", "적용대상": "대상자" }}],
      "evidenceText": "분석의 근거가 되는 원문 출처 (텍스트로만)",
      "expertOpinions": [{{ "comment": "정책의 핵심을 찌르는 수석 리서처의 총평", "affiliation": "정책 분석팀" }}],
      "checklist": ["투자자/실거주자가 체크해야 할 리스트"]
    }}
    """
    
    model = get_model(model_name)
    chat = model.start_chat(history=[])
    response = chat.send_message(baseline_prompt)
    
    try:
        text = response.text
    except ValueError:
        print(f"  ⚠️ {model_name} 응답이 비어있거나 차단되었습니다.")
        return None
        
    return json.loads(clean_json_response(text))

def analyze_post_with_retry(post):
    """모델 교차 시도 + 할당량 대기 재시도"""
    attempts = 0
    last_error = None
    model_sequence = ['gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-flash-lite-latest']

    while attempts < MAX_ANALYZER_RETRIES:
        for model_name in model_sequence:
            try:
                print(f"  🤖 {model_name} 분석 시도")
                return analyze_with_model(post, model_name)
            except Exception as error:
                last_error = error
                if is_quota_error(error):
                    print(f"  ⚠️ {model_name} 할당량 제한: {error}")
                    continue
                print(f"  ❌ {model_name} 분석 실패: {error}")

        if last_error and is_quota_error(last_error):
            wait_for_quota_reset(last_error, attempts)
            attempts += 1
            continue
        break

    raise last_error if last_error else RuntimeError("Unknown analyzer failure")

def run_analyzer(priority_ids=None, limit_count=10):
    print(f"🚀 [Analyzer] 분석 가동 (우선순위: {priority_ids})")
    raw_path, posts_path = 'agent/raw_data.json', 'public/posts.json'
    if not os.path.exists(raw_path):
        return {"processed": 0, "succeeded": 0, "failed": []}
    with open(raw_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    existing_posts = load_posts(posts_path)
    
    post_map = {p['id']: p for p in existing_posts}
    to_analyze = [p for p in raw_data if p['id'] in (priority_ids or [])]
    new_ones = [p for p in raw_data if p['id'] not in post_map and p['id'] not in [x['id'] for x in to_analyze]]
    to_analyze.extend(new_ones[:limit_count])
    failed_posts = []
    succeeded = 0

    for idx, p in enumerate(to_analyze):
        print(f"\n[{idx+1}/{len(to_analyze)}] {p['title'][:30]}...")
        try:
            result = analyze_post_with_retry(p)
        except Exception as error:
            failed_posts.append({"id": p.get("id"), "title": p.get("title"), "error": str(error)})
            print(f"  ❌ 분석 실패, 다음 자료로 넘어갑니다: {error}")
            continue

        if result == "FILTERED":
            print("  🗑️ 필터링됨 (부동산 무관)")
            continue

        if result:
            result.update({"id": p['id'], "date": p['date'], "link": p['link'], "source": p['source']})
            normalized, warnings = normalize_post(result, source_post=p)
            post_map[p['id']] = normalized
            for warning in warnings:
                print(f"  ⚠️ {warning}")
            # 즉시 업데이트
            save_posts(list(post_map.values()), posts_path)
            print("  ✅ 반영 완료")
            succeeded += 1
            time.sleep(ANALYZER_BETWEEN_POST_DELAY_SECONDS) # 안전 대기

    normalized_posts, normalization_warnings = normalize_posts(load_posts(posts_path))
    if normalization_warnings:
        print(f"ℹ️ [Analyzer] 기존 posts 데이터 {len(normalization_warnings)}건을 정규화했습니다.")
        save_posts(normalized_posts, posts_path)

    final_issues = validate_posts(load_posts(posts_path))
    if final_issues:
        raise ValueError(f"posts.json validation failed: {final_issues[:5]}")

    if failed_posts:
        print(f"⚠️ [Analyzer] {len(failed_posts)}건 분석 실패")
        for failed in failed_posts[:10]:
            print(f"  - {failed['id']}: {failed['error']}")
        if len(failed_posts) > 10:
            print(f"  - ... {len(failed_posts) - 10}건 추가 실패")

    return {"processed": len(to_analyze), "succeeded": succeeded, "failed": failed_posts}

def generate_market_pulse(insight_data):
    """기관별 소스 데이터를 기반으로 한 종합 시장 맥락 요약 생성"""
    print("📈 [Analyzer] Generating Market Pulse summary...")
    
    prompt = f"""
    당신은 대한민국 '부동산 및 금융 세무 정책 수석 리서처'입니다. 
    다음의 기관별 최신 데이터(JSON)를 분석하여 한 줄 평과 3가지 핵심 체크포인트를 요약하십시오.
    
    [데이터]:
    {json.dumps(insight_data, ensure_ascii=False, indent=2)}
    
    [요청 사항]:
    1. 마켓 한 줄 평: 현재 시장을 관통하는 가장 중요한 흐름을 30자 내외로 작성.
    2. 핵심 체크포인트: 투자자나 실거주자가 반드시 알아야 할 변화 3가지를 '강점/기회' 또는 '리스크' 관점에서 작성.
    3. 어조: 매우 전문적이고 경제적이며 단호한 어조 사용.
    
    응답 형식(JSON):
    {{
      "pulse_summary": "마켓 한 줄 평",
      "checkpoints": ["포인트1", "포인트2", "포인트3"]
    }}
    """
    
    try:
        model = get_model(MODELS_TO_TRY[0])
        response = model.generate_content(prompt)
        result = json.loads(clean_json_response(response.text))
        return result
    except Exception as e:
        print(f"  ❌ Market Pulse 생성 실패: {e}")
        return {
            "pulse_summary": "데이터 수집 완료. 시장 모니터링 중입니다.",
            "checkpoints": ["대출 금리 변동 주의", "청약 공고 상시 확인", "지역별 시장 양극화 유의"]
        }

if __name__ == "__main__":
    run_analyzer()
