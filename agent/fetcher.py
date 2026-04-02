import requests
import feedparser
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime
import time

# ══════════════════════════════════════════════
# 설정
# ══════════════════════════════════════════════
TARGET_KEYWORDS = [
    '부동산', '주택', '금융', '세제', '대출', '청약', '공시가격', '국토', '기본주택',
    '가계부채', 'LTV', 'DSR', '종부세', '재산세', '양도세', '취득세', '금리', '역전세'
]

RSS_SOURCES = [
    {"name": "국토교통부", "url": "https://www.molit.go.kr/dev/board/board_rss.jsp?rss_id=NEWS"},
    {"name": "금융위원회", "url": "https://www.fsc.go.kr/rss/press_release.xml"},
    {"name": "정책브리핑(기재부)", "url": "https://www.korea.kr/rss/dept_moef.xml"},
    {"name": "정책브리핑(국토부)", "url": "https://www.korea.kr/rss/dept_molit.xml"}
]

def fetch_rss_data():
    all_posts = []
    for source in RSS_SOURCES:
        try:
            print(f"[Fetcher] {source['name']} RSS 가져오는 중...")
            feed = feedparser.parse(source['url'])
            for entry in feed.entries:
                if any(kw in entry.title for kw in TARGET_KEYWORDS):
                    all_posts.append({
                        "id": entry.id if hasattr(entry, 'id') else entry.link,
                        "title": entry.title,
                        "link": entry.link,
                        "date": datetime(*entry.published_parsed[:6]).strftime('%Y-%m-%d'),
                        "source": source['name']
                    })
        except Exception as e:
            print(f"[Fetcher] {source['name']} RSS 오류: {e}")
    return all_posts

def scrape_full_text(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        res = requests.get(url, timeout=15, headers=headers)
        res.raise_for_status()
        # 인코딩 자동 감지 (한글 깨짐 방지)
        res.encoding = res.apparent_encoding
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # 사이트별 본문 영역 추출 (고도화)
        content = None
        if "molit.go.kr" in url:
            content = soup.select_one('.board_view_cont') or soup.select_one('.view_cont')
        elif "fsc.go.kr" in url:
            content = soup.select_one('#content-detail') or soup.select_one('.board-view-content')
        elif "korea.kr" in url:
            content = soup.select_one('.article-content') or soup.select_one('.view-cont')
        
        # 폴백: 위 셀렉터로 못찾으면 본문으로 추정되는 큰 영역 시도
        if not content:
            content = soup.select_one('article') or soup.select_one('#content') or soup.select_one('.content')

        if content:
            # 불필요한 태그 제거 (스크립트, 스타일 등)
            for s in content(['script', 'style', 'header', 'footer', 'nav']):
                s.decompose()
            return content.get_text(separator='\n', strip=True)[:3000]
        
        return "본문 내용을 특정할 수 없습니다. 원문 링크를 확인해주세요."
    except Exception as e:
        return f"스크래핑 실패: {str(e)}"

def run_fetcher():
    print("[Fetcher] 프로젝트 수집 시작...")
    all_raw_posts = fetch_rss_data()
    
    # 중복 제거 및 최신순 정렬
    unique_posts = {p['id']: p for p in all_raw_posts}.values()
    sorted_posts = sorted(unique_posts, key=lambda x: x['date'], reverse=True)

    # 최 최신 10건 선정 (API 호출 비용 및 시간 절약)
    selected_posts = sorted_posts[:10]
    
    final_data = []
    for p in selected_posts:
        print(f"[Fetcher] 본문 추출 중: {p['title']}")
        p['originalText'] = scrape_full_text(p['link'])
        final_data.append(p)
        time.sleep(0.5) # 서버 부하 방지
        
    return final_data

if __name__ == "__main__":
    data = run_fetcher()
    os.makedirs('agent', exist_ok=True)
    with open('agent/raw_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[Fetcher] {len(data)}건 수집 완료.")
