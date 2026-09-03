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

# 선호 모델 순서 — 어디까지나 '희망사항'이고, 실제 사용 모델은
# resolve_models()가 API에 살아있는 모델을 조회해 결정한다.
#
# 2026-09-03 사고 기록:
#   gemini-2.5-flash 은퇴로 고정 목록 3개가 전부 404 → 분석 0건이 7주간 방치됨.
#   같은 일이 반복되지 않도록 고정 목록에 의존하지 않는다.
MODEL_PREFERENCE = [
    'gemini-3.6-flash',
    'gemini-3-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
]
_MODEL_CACHE = None

def _available_models():
    """generateContent를 지원하는, 지금 실제로 살아있는 모델 목록."""
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE
    try:
        names = []
        for m in genai.list_models():
            if 'generateContent' in getattr(m, 'supported_generation_methods', []):
                names.append(m.name.replace('models/', ''))
        _MODEL_CACHE = names
    except Exception as e:
        print(f"  ⚠️ 모델 목록 조회 실패(선호 목록으로 진행): {e}")
        _MODEL_CACHE = []
    return _MODEL_CACHE

def resolve_models():
    """선호 목록 중 살아있는 것만 사용. 전부 은퇴했으면 가용 모델로 자동 대체."""
    available = _available_models()
    if not available:
        return list(MODEL_PREFERENCE)
    alive = [m for m in MODEL_PREFERENCE if m in available]
    if alive:
        return alive
    auto = sorted((m for m in available if 'flash' in m and 'embedding' not in m), reverse=True)[:3]
    print(f"  ⚠️ 선호 모델이 모두 사용 불가. 가용 모델로 자동 대체: {auto}")
    return auto or available[:3]
MAX_ANALYZER_RETRIES = int(os.getenv("ANALYZER_MAX_RETRIES", "3"))
ANALYZER_RETRY_BUFFER_SECONDS = int(os.getenv("ANALYZER_RETRY_BUFFER_SECONDS", "5"))
ANALYZER_BETWEEN_POST_DELAY_SECONDS = int(os.getenv("ANALYZER_BETWEEN_POST_DELAY_SECONDS", "30"))
# 초안 생성 후 자가 검수(2차 패스) 수행 여부
ANALYZER_REFINE_PASS = os.getenv("ANALYZER_REFINE_PASS", "true").lower() == "true"

def get_model(model_name=None, temperature=0.35):
    generation_config = {
        "temperature": temperature,
        "top_p": 0.95,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }
    # 모델명 결정 (가용성 기반 리스트에서 선택)
    target_name = model_name if model_name else resolve_models()[0]
    
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

def is_daily_quota_error(error):
    """일일 한도(PerDay) 초과 여부. 이 경우 대기 후 재시도가 무의미함."""
    message = str(error)
    return "PerDay" in message or "per_day" in message.lower()

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

ANALYST_PERSONA = """당신은 국내 증권사 리서치센터에서 15년간 부동산·건설 섹터를 담당해 온 수석연구원입니다.
독자는 실수요자, 임대인·임차인, 개인 투자자이며, 이들은 뉴스 요약이 아니라 '그래서 나에게 어떤 의미인가'를 알고 싶어 합니다.
당신의 글은 증권사 산업 리포트처럼 데이터에 근거하되, 일반 독자가 이해할 수 있는 문장으로 씁니다."""

STYLE_RULES = """[문체·품질 규칙 - 반드시 준수]
1. 모든 주장에 근거를 붙일 것. 원문 속 수치·날짜·적용 대상을 최대한 인용하고, [실제 시장 데이터]가 제공되면 그중 최소 2개 지표를 본문 분석에 직접 연결할 것.
2. 상투적 표현 금지: "귀추가 주목된다", "전략적 함의", "패러다임 전환", "다각적인 노력", "만전을 기하다", "지속적인 모니터링이 필요하다"류의 마무리, "~할 것으로 보인다"의 반복.
3. 뜬구름 문장 금지: 수치·대상·시점·메커니즘 중 아무것도 담지 않은 문장이 2개 이상 연속되면 안 됨.
4. 정부 발표문을 옮겨 적지 말고 행간을 해석할 것: 왜 지금 발표했는지, 원문이 말하지 않은 것은 무엇인지, 과거 유사 정책 국면(예: 2017~2022 규제 강화기, 2023~2024 완화기)과 무엇이 다른지.
5. 수혜 주체와 부담 주체를 구체적으로 구분할 것. "시장에 영향을 줄 것" 대신 "잔금대출을 앞둔 수분양자는 ~, 규제지역 다주택 보유자는 ~"처럼 쓸 것.
6. 서술형 문단으로 쓰되 한 문단은 3~5문장. 글머리기호(-, ·, 숫자 목록) 금지.
7. 전문 용어(LTV, DSR, PF 등)는 처음 등장할 때 한 번만 짧게 풀어 쓸 것.
8. 확실한 사실과 전망을 구분할 것. 전망을 쓸 때는 "~라면 ~가능성" 형태로 조건을 명시할 것."""

JSON_SPEC = """반드시 다음 JSON 구조로만 응답하십시오:
{
  "headline": "45자 이내. '~전략 분석', '~함의' 같은 보고서식 제목 금지. 핵심 변화와 숫자를 담은 구체적 제목",
  "post_type": "insight(정책 해석) / analysis(데이터·통계 중심) / opinion(시장 종합 의견) 중 하나",
  "cat": "F/X/S/T/R/P 중 하나",
  "catName": "카테고리명",
  "summary": ["원문 핵심 요점 3~4개. 각 60~120자, 가능한 한 수치 포함"],
  "content_sections": {
    "summary": "무엇이 발표됐는지 핵심 사실 정리. 500~800자 서술형 단락",
    "meaning": "정책의 배경·의도·행간 해석. 왜 지금인지, 무엇이 빠져 있는지. 600~900자",
    "market_impact": "매매·전세·분양·대출 등 시장 경로별 파급. 수혜/부담 주체 구분. 시장 데이터 지표 연결. 600~900자",
    "investor_insight": "실수요자/보유자/투자자 각각의 관점에서 확인할 것과 대응 시나리오. 500~800자"
  },
  "keyData": [{ "항목": "원문에서 추출한 실제 지표명", "수치": "구체적 수치·기간", "적용대상": "대상자" }],
  "evidenceText": "분석의 근거가 된 원문 문장 1~3개를 그대로 인용",
  "expertOpinions": [{ "comment": "정책의 본질을 짚는 4~6문장 총평. 원문 요약 반복 금지", "affiliation": "Policy Radar 리서치" }],
  "checklist": ["이 정책에만 해당하는 구체적 확인·행동 항목 4~6개. 어느 정책에나 통하는 문구 금지"]
}
- keyData는 최소 3개. 원문에 수치가 부족하면 [실제 시장 데이터]의 지표(기준금리, 정책대출 금리 등)를 활용해 채우십시오. 제목을 그대로 반복하는 행 금지."""

REFINE_PROMPT = """방금 작성한 JSON 초안을 수석연구원 관점에서 스스로 검수하고 수정하십시오.
검수 기준:
1. 분량: content_sections.summary 500자 이상, meaning 600자 이상, market_impact 600자 이상, investor_insight 500자 이상. 미달 섹션은 원문과 시장 데이터를 근거로 보강.
2. 근거 없는 주장은 삭제하거나 원문 인용·데이터로 뒷받침.
3. 상투 표현·중복 문장 제거.
4. keyData가 제목이나 요약의 반복이면 원문의 실제 수치로 교체.
5. checklist가 범용 문구면 이 정책 고유의 행동 항목으로 교체.
6. headline이 보고서식('~분석', '~함의')이면 구체적 변화 중심으로 다시 작성.
수정한 최종 JSON만 출력하십시오. JSON 외 다른 텍스트를 붙이지 마십시오."""

def analyze_with_model(post, model_name, skip_relevance=False):
    # 본격적인 분석 전 적합성 검사
    if not skip_relevance and not check_relevance(post, model_name):
        print(f"  🚫 {model_name}: 부동산 정책과 무관한 자료로 판명되어 필터링합니다.")
        return "FILTERED"

    return run_pag_pipeline(post, model_name=model_name)

# ══════════════════════════════════════════════
# 분석 파이프라인
# ══════════════════════════════════════════════

def run_pag_pipeline(post, model_name=None):
    """초안 생성 + 자가 검수 2단계 파이프라인 (시장 데이터 상시 주입)"""
    original_text = post.get('originalText', post.get('original_text', ''))
    connector = DataConnector()
    region = extract_region(post['title'] + " " + original_text[:500])
    try:
        market_context = connector.get_market_context(region)
    except Exception as e:
        print(f"  ⚠️ 시장 데이터 수집 실패(분석은 계속 진행): {e}")
        market_context = ""
    context_str = f"\n[실제 시장 데이터 - 공공기관 API 실시간 조회값]\n{market_context}\n" if market_context else ""

    baseline_prompt = f"""{ANALYST_PERSONA}

제공된 정부 보도자료 원문과 [실제 시장 데이터]를 결합해, 폴리시레이더에 게재할 심층 분석 리포트를 JSON으로 작성하십시오.

{STYLE_RULES}
{context_str}
[보도자료 제목]: {post['title']}
[보도자료 발표일]: {post.get('date', '')}
[발표 기관]: {post.get('source', '')}
[보도자료 원문]: {original_text[:14000]}

{JSON_SPEC}
"""

    model = get_model(model_name)
    chat = model.start_chat(history=[])
    response = chat.send_message(baseline_prompt)

    try:
        text = response.text
    except ValueError:
        print(f"  ⚠️ {model_name} 응답이 비어있거나 차단되었습니다.")
        return None

    draft = json.loads(clean_json_response(text))

    if not ANALYZER_REFINE_PASS:
        return draft

    # 2차 자가 검수 패스
    try:
        refine_response = chat.send_message(REFINE_PROMPT)
        refined = json.loads(clean_json_response(refine_response.text))
        # 검수 결과가 초안보다 얇아지면 초안 유지
        def _total_len(d):
            cs = d.get("content_sections") or {}
            return sum(len(cs.get(k) or "") for k in ["summary", "meaning", "market_impact", "investor_insight"])
        if _total_len(refined) >= _total_len(draft) * 0.8:
            print(f"  ✨ 자가 검수 완료 ({_total_len(draft)}자 → {_total_len(refined)}자)")
            return refined
        print("  ⚠️ 검수본이 초안보다 부실하여 초안을 유지합니다.")
        return draft
    except Exception as e:
        print(f"  ⚠️ 자가 검수 패스 실패, 초안 사용: {e}")
        return draft

def analyze_post_with_retry(post, skip_relevance=False):
    """모델 교차 시도 + 할당량 대기 재시도"""
    attempts = 0
    last_error = None
    model_sequence = resolve_models()

    while attempts < MAX_ANALYZER_RETRIES:
        for model_name in model_sequence:
            try:
                print(f"  🤖 {model_name} 분석 시도")
                return analyze_with_model(post, model_name, skip_relevance=skip_relevance)
            except Exception as error:
                last_error = error
                if is_quota_error(error):
                    print(f"  ⚠️ {model_name} 할당량 제한: {error}")
                    continue
                print(f"  ❌ {model_name} 분석 실패: {error}")

        if last_error and is_quota_error(last_error):
            if is_daily_quota_error(last_error):
                print("  🛑 일일 무료 할당량 소진 감지. 대기해도 오늘은 회복되지 않아 중단합니다.")
                break
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
            if is_daily_quota_error(error):
                print("  🛑 일일 할당량 소진: 남은 자료는 다음 실행에서 처리합니다.")
                break
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
