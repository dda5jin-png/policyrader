import requests
import xml.etree.ElementTree as ET
import json
import os
from datetime import datetime, timedelta
import time
import re
from dotenv import load_dotenv
from bs4 import BeautifulSoup

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
POSTS_PATH = "public/posts.json"

def scrape_full_content(url):
    """보도자료 원문 URL에서 본문 내용을 추출합니다."""
    if not url or "korea.kr" not in url:
        return ""
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 보도자료 본문 영역 (korea.kr 기준)
        content_div = soup.select_one('.news-article') or soup.select_one('.article-content') or soup.select_one('.view-cont')
        if content_div:
            # 불필요한 태그 제거
            for s in content_div(['script', 'style', 'iframe', 'button']):
                s.decompose()
            return content_div.get_text(separator='\n', strip=True)
        return ""
    except Exception as e:
        print(f"  ⚠️ Scraping error ({url}): {e}")
        return ""

def fetch_period_api(start_date_str, end_date_str):
    """지정된 기간 동안의 보도자료를 API로 가져옵니다."""
    if not API_KEY: 
        print("❌ API_KEY가 설정되지 않았습니다.")
        return []
    
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
        
        # resultCode 체크
        result_code = root.findtext('.//resultCode')
        result_msg = root.findtext('.//resultMsg')
        if result_code and result_code != '0':
            print(f"  ❌ API 에러 (코드: {result_code}, 메시지: {result_msg})")
            return []

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

            # 수정: 부처 상관없이 제목에 키워드(부동산 등)가 있으면 일단 가져오도록 변경!
            is_relevant_dept = any(d in dept for d in ["국토", "금융", "기획재정", "재정경제", "행정안전", "국세", "중소벤처", "국무"])
            is_keyword_match = any(kw in title for kw in TARGET_KEYWORDS)

            if is_relevant_dept or is_keyword_match:
                # Placeholder 체크: 본문이 없으면 스크래핑 시도
                is_placeholder = "자세한 내용은 첨부파일" in content or len(content) < 100
                full_text = content
                
                if is_placeholder and link:
                    print(f"  🔍 본문 스크래핑 시도: {title[:30]}...")
                    scraped = scrape_full_content(link)
                    if scraped:
                        full_text = scraped
                        print(f"    ✅ 스크래핑 성공 ({len(scraped)}자)")

                results.append({
                    "id": f"api_{news_id}",
                    "title": title,
                    "link": link,
                    "date": date_str,
                    "source": dept,
                    "views": 0,
                    "originalText": full_text,
                    "has_keyword": is_keyword_match
                })
        return results
    except Exception as e:
        print(f"❌ API 요청 중 오류: {e}")
        return []

def fetch_via_api_range(start_date_limit, end_date_limit=None):
    """지정된 시작일부터 종료일(기본값은 현재)까지 수집합니다."""
    if end_date_limit is None:
        end_date_limit = datetime.now()
        
    print(f"[Fetcher] {start_date_limit.strftime('%Y-%m-%d')} ~ {end_date_limit.strftime('%Y-%m-%d')} 기간 수집 시작...")
    
    all_posts = []
    iter_date = end_date_limit
    
    while iter_date >= start_date_limit:
        e_str = iter_date.strftime("%Y%m%d")
        # 3일 단위 블록 수집 (API의 THREE_DAYS_OVER_ERROR 방지)
        s_date = iter_date - timedelta(days=2)
        if s_date < start_date_limit: s_date = start_date_limit
        s_str = s_date.strftime("%Y%m%d")
        
        print(f"  -> {s_str} ~ {e_str} 수집 중... (누적: {len(all_posts)}건)")
        
        period_posts = fetch_period_api(s_str, e_str)
        all_posts.extend(period_posts)
        
        # 다음 블록으로 이동
        iter_date = s_date - timedelta(days=1)
        time.sleep(0.5)
        
    print(f"[Fetcher] 해당 기간 수집 완료: 총 {len(all_posts)}건 확보")
    return all_posts

def select_top_posts(all_posts, max_per_month=10):
    """월별로 중요도가 높은 포스트를 선별합니다."""
    monthly_data = {}
    for p in all_posts:
        m_key = p['date'][:7] # YYYY-MM
        if m_key not in monthly_data: monthly_data[m_key] = []
        monthly_data[m_key].append(p)
    
    final = []
    for m, posts in monthly_data.items():
        # 키워드 포함 여부 및 날짜순 정렬
        sorted_p = sorted(posts, key=lambda x: (x['has_keyword'], x['date']), reverse=True)
        final.extend(sorted_p[:max_per_month])
    return sorted(final, key=lambda x: x['date'], reverse=True)

def get_last_post_date():
    """기존 posts.json에서 가장 최신 날짜를 가져옵니다."""
    if os.path.exists(POSTS_PATH):
        try:
            with open(POSTS_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if data and isinstance(data, list) and len(data) > 0:
                    return datetime.strptime(data[0]['date'], "%Y-%m-%d")
        except Exception as e:
            print(f"  ⚠️ Error reading posts.json: {e}")
    return None # 신규 설치 시

def run_fetcher():
    print("[Fetcher] 정책레이더 지능형 수집 엔진 가동...")
    
    last_date = get_last_post_date()
    force_backfill = os.getenv("FORCE_BACKFILL", "false").lower() == "true"
    
    if last_date and not force_backfill:
        # 증분 수집: 마지막 수집일로부터 3일 전부터 (누락 방지)
        start_date_limit = last_date - timedelta(days=3)
        max_posts = 15
    else:
        # 최초 수집 또는 강제 백필: 최근 90일치 (약 3개월) 데이터를 수집하여 기반 데이터 확보
        if force_backfill:
            print("  🚀 강제 백필 모드 활성화: 최근 90일 데이터를 수집합니다.")
        else:
            print("  💡 최초 실행(또는 데이터 없음) 감지: 최근 90일 데이터를 수집합니다.")
        start_date_limit = datetime.now() - timedelta(days=90)
        max_posts = 40 # 초기/백필 데이터는 넉넉히 확보

    raw_posts = fetch_via_api_range(start_date_limit)
    
    if not raw_posts:
        print("⚠️ [Fetcher] 새로운 데이터가 없습니다.")
        return []

    # 중요 포스트 선별
    selected = select_top_posts(raw_posts, max_per_month=15)
    
    # 중복 제거 (이미 posts.json에 있는 ID 제외)
    existing_ids = set()
    if os.path.exists(POSTS_PATH):
        try:
            with open(POSTS_PATH, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                existing_ids = {p['id'] for p in existing_data}
        except: pass

    result = [p for p in selected if p['id'] not in existing_ids]
    
    print(f"[Fetcher] 총 {len(result)}건의 새로운 고부가가치 정책 자료를 선별했습니다.")
    return result

if __name__ == "__main__":
    data = run_fetcher()
    if data:
        os.makedirs('agent', exist_ok=True)
        with open('agent/raw_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
