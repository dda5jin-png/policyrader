import requests
import xml.etree.ElementTree as ET
import json
import os
from datetime import datetime, timedelta
import time
import re
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# ══════════════════════════════════════════════
# 설정
# ══════════════════════════════════════════════
TARGET_KEYWORDS = [
    '부동산', '주택', '금융', '세제', '대출', '청약', '공시가격', '국토', '기본주택',
    '가계부채', 'LTV', 'DSR', '종부세', '재산세', '양도세', '취득세', '금리', '역전세',
    'GTX', '철도', '지하철', '신도시', '공공주택', '규제', '공사', '분양'
]

# 공공데이터포털 인증키
API_KEY = os.getenv("DATA_GO_KR_API_KEY")
BASE_URL = "http://apis.data.go.kr/1371000/pressReleaseService/pressReleaseList"

def fetch_period_api(start_date_str, end_date_str):
    """지정된 기간(최대 3일) 동안의 보도자료를 API로 가져옵니다."""
    if not API_KEY: return []
    
    params = {
        'serviceKey': API_KEY,
        'startDate': start_date_str,
        'endDate': end_date_str,
        'numOfRows': 100
    }
    
    try:
        response = requests.get(BASE_URL, params=params, timeout=30)
        response.raise_for_status()
        
        root = ET.fromstring(response.content)
        items = root.findall('.//NewsItem')
        
        results = []
        for item in items:
            title = item.findtext('Title', '').strip()
            dept = item.findtext('MinisterCode', '').strip()
            date_raw = item.findtext('ApproveDate', '').strip()
            
            try:
                # MM/DD/YYYY HH:MM:SS -> YYYY-MM-DD
                date_dt = datetime.strptime(date_raw, "%m/%d/%Y %H:%M:%S")
                date_str = date_dt.strftime("%Y-%m-%d")
            except:
                date_str = date_raw[:10]

            link = item.findtext('OriginalUrl', '').strip()
            content = item.findtext('DataContents', '').strip()
            news_id = item.findtext('NewsItemId', '').strip()

            # 대상 부처 필터링 (국토교통부, 금융위원회)
            if "국토" in dept or "금융" in dept:
                results.append({
                    "id": f"api_{news_id}",
                    "title": title,
                    "link": link,
                    "date": date_str,
                    "source": dept,
                    "views": 0,
                    "originalText": content,
                    "has_keyword": any(kw in title for kw in TARGET_KEYWORDS)
                })
        return results
    except Exception as e:
        return []

def fetch_via_api_historical(start_year=2025):
    """오늘부터 과거(2025년)로 역순 수집을 진행합니다."""
    print(f"[Fetcher] {start_year}년까지 오늘부터 역순으로 3일 단위 수집 시작...")
    
    all_posts = []
    current_date = datetime.now()
    limit_date = datetime(start_year, 1, 1)
    
    iter_date = current_date
    while iter_date >= limit_date:
        e_str = iter_date.strftime("%Y%m%d")
        # 3일(오늘 포함) 수집을 위해 -2일 계산
        s_date = iter_date - timedelta(days=2)
        if s_date < limit_date: s_date = limit_date
        s_str = s_date.strftime("%Y%m%d")
        
        print(f"  -> {s_str} ~ {e_str} 수집 중... (누적: {len(all_posts)}건)", end="\r")
        
        period_posts = fetch_period_api(s_str, e_str)
        all_posts.extend(period_posts)
        
        # 다음 3일 블록으로 이동 (s_date보다 하루 전으로)
        iter_date = s_date - timedelta(days=1)
        time.sleep(0.1)
        
    print(f"\n[Fetcher] API 역순 수집 완료: 총 {len(all_posts)}건 확보")
    return all_posts

def select_top_posts(all_posts, max_per_month=5):
    monthly_data = {}
    for p in all_posts:
        m_key = p['date'][:7]
        if m_key not in monthly_data: monthly_data[m_key] = []
        monthly_data[m_key].append(p)
    
    final = []
    for m, posts in monthly_data.items():
        # 키워드 우선 정렬
        sorted_p = sorted(posts, key=lambda x: (x['has_keyword'], x['date']), reverse=True)
        final.extend(sorted_p[:max_per_month])
    return sorted(final, key=lambda x: x['date'], reverse=True)

def run_fetcher():
    print("[Fetcher] 정책레이더 API 역순 수집 엔진 가동...")
    raw_posts = fetch_via_api_historical(2025)
    
    if not raw_posts:
        print("⚠️ [Fetcher] 수집된 데이터가 없습니다.")
        return []

    selected = select_top_posts(raw_posts)
    unique = {p['id']: p for p in selected}
    result = list(unique.values())
    
    print(f"[Fetcher] 총 {len(result)}건의 정책 자료를 선별했습니다.")
    return result

if __name__ == "__main__":
    data = run_fetcher()
    if data:
        os.makedirs('agent', exist_ok=True)
        with open('agent/raw_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
