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
MODELS_TO_TRY = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest', 'gemini-3-flash-preview']

def get_model(model_name=None):
    """지정된 모델 또는 가용한 모델 중 하나를 선택하여 반환합니다."""
    if model_name:
        try:
            m_name = f"models/{model_name}" if not model_name.startswith("models/") else model_name
            return genai.GenerativeModel(m_name)
        except:
            pass

    for m_name_to_try in MODELS_TO_TRY:
        try:
            m_full_name = f"models/{m_name_to_try}" if not m_name_to_try.startswith("models/") else m_name_to_try
            m = genai.GenerativeModel(m_full_name)
            return m
        except:
            continue
    return genai.GenerativeModel('gemini-1.5-flash')

def clean_json_response(text):
    """AI 응답에서 JSON만 추출하는 유틸리티"""
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    match = re.search(r'(\{.*\})', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()

def analyze_post_with_retry(post, retries=2):
    """할당량 초과 시 모델을 교체하며 재시도하는 분석 함수"""
    prompt = f"""
    당신은 대한민국 '부동산 및 금융 정책 수석 분석가'입니다. 
    제공된 보도자료의 원문을 심층 분석하여 시장의 흐름과 사용자(투자자, 실거주자)가 즉시 알아야 할 핵심 정보를 리포트 형식으로 추출해주세요.

    [보도자료 제목]: {post['title']}
    [보도자료 본문]: 
    {post['originalText'][:8000]} # 충분한 컨텍스트 제공

    [분석 가이드라인]:
    1. 시장 영향력: 부동산 가격, 대출 규제, 세금 변화, 공급 대책 중 실질적 파급력을 우선 분석하십시오.
    2. 전문성: 단순 요약이 아닌, 정책의 이면과 향후 시장에 미칠 '전문가 시각'을 포함하십시오.
    3. 실무성: 사용자가 오늘 바로 확인하거나 준비해야 할 '전문가 인사이트'를 구체적으로 작성하십시오.
    4. 출력 형식: 반드시 유효한 JSON 형식으로만 응답하십시오.

    [출력 JSON 구조]:
    {{
      "summary": ["정책의 배경 및 목적", "주요 변경 사항 및 시행일", "대상자 및 혜택/규제 범위"],
      "cat": "F(부동산 금융정책), X(부동산 세금정책), S(부동산 공급·개발정책), T(부동산 거래·법령), R(부동산 임대·주거정책) 중 필히 1개 선택",
      "catName": "카테고리 한글명 (예: 부동산 금융정책)",
      "searchPath": "자료를 찾을 수 있는 사이트 메뉴 경로",
      "keyData": [
        {{ "항목": "항목명", "수치": "구체적수치", "기준일": "YYYY.MM.DD", "적용대상": "대상자 범위" }}
      ],
      "expertOpinions": [
        {{ 
          "name": "AI 수석 분석관", 
          "affiliation": "Policy Radar Intelligence", 
          "stance": "중립/긍정/부정", 
          "comment": "이 정책이 시장에 가져올 3개월~1년 뒤의 시나리오 분석",
          "source": "Gemini Insight Engine" 
        }}
      ],
      "checklist": ["사용자가 즉시 확인해야 할 서류나 자격", "관련 기관(은행, 구청 등) 문의 사항", "향후 일정에 따른 준비 사항"],
      "premium": true
    }}
    """
    
    # 모델 후보군 시도
    for model_name in MODELS_TO_TRY:
        current_model = get_model(model_name)
        for i in range(retries):
            try:
                print(f"  [AI] {model_name} 모델로 분석 중... ({i+1}/{retries})")
                
                # 안전 장치: 너무 짧은 텍스트는 분석 거절
                if len(post['originalText']) < 50:
                    print("    ⚠️ 원문 데이터가 너무 짧아 분석을 건너뜁니다.")
                    return None

                response = current_model.generate_content(prompt)
                clean_json = clean_json_response(response.text)
                analysis = json.loads(clean_json)
                
                analysis.update({
                    "id": post['id'],
                    "headline": post['title'],
                    "source": post['source'],
                    "sourceUrl": post['link'],
                    "date": post['date'],
                    "originalText": post['originalText'][:500], # 저장용 초록
                    "views": post.get('views', 0)
                })
                return analysis
            except Exception as e:
                err_msg = str(e).lower()
                if "quota" in err_msg or "429" in err_msg:
                    print(f"  ⚠️ [AI] {model_name} 할당량 초과. 다음 모델로 전환을 시도합니다.")
                    break # 다음 모델로 루프 이동
                else:
                    print(f"  [AI] {model_name} 분석 실패: {e}")
                    break # 다음 모델로 넘어감
                    
    return None # 모든 모델 실패 시

def run_analyzer(limit_count=20):
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY가 없습니다.")
        return

    print(f"[AI] 정책 지능형 분석 프로세스 가동 (신규 {limit_count}건 우선)...")
    raw_data_path = 'agent/raw_data.json'
    if not os.path.exists(raw_data_path):
        print("⚠️ 분석할 신규 raw_data.json이 없습니다.")
        return

    with open(raw_data_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    if not raw_data: 
        print("⚠️ 분석할 데이터가 비어있습니다.")
        return

    # 출력 경로: public/posts.json (Next.js 정적 파일 서빙 경로)
    output_path = 'public/posts.json'

    # 기존 데이터 로드
    existing_posts = []
    if os.path.exists(output_path):
        try:
            with open(output_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content and content != '[]':
                    existing_posts = json.loads(content)
        except: pass

    post_map = {p['id']: p for p in existing_posts}
    analyzed_count = 0

    for p in raw_data:
        if analyzed_count >= limit_count: break
        if p['id'] in post_map: continue

        print(f"[AI] ({analyzed_count+1}/{limit_count}) 분석 대상: {p['title'][:40]}...")
        result = analyze_post_with_retry(p)

        if result:
            # 즉시 병합 및 증분 저장
            post_map[result['id']] = result
            final_posts = sorted(post_map.values(), key=lambda x: x['date'], reverse=True)

            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(final_posts, f, ensure_ascii=False, indent=2)
            
            analyzed_count += 1
            print(f"  ✅ 분석 성공 및 저장 완료")
            time.sleep(25) # 무료 티어 안전 대기 시간 (25초 이상 권장)
        else:
            print(f"  ⚠️ 분석 건너뜀")
            time.sleep(5)

    print(f"🏁 [AI] 총 {analyzed_count}건의 프리미엄 리포트가 완성되었습니다.")

if __name__ == "__main__":
    run_analyzer(limit_count=20)
