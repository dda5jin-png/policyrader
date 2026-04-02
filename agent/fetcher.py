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
    '가계부채', 'LTV', 'DSR', '종부세', '재산세', '양도세', '취득세', '금리', '역전세',
    'GTX', '철도', '지하철', '신도시', '공공주택', '규제', '공사', '분양'
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
            
            # 해당 소스의 모든 포스트를 날짜순으로 정렬
            source_posts = []
            for entry in feed.entries:
                post = {
                    "id": entry.id if hasattr(entry, 'id') else entry.link,
                    "title": entry.title,
                    "link": entry.link,
                    "date": datetime(*entry.published_parsed[:6]).strftime('%Y-%m-%d'),
                    "source": source['name'],
                    "has_keyword": any(kw in entry.title for kw in TARGET_KEYWORDS)
                }
                source_posts.append(post)
            
            # 날짜순 정렬
            source_posts.sort(key=lambda x: x['date'], reverse=True)
            
            # 전략 1: 키워드가 있는 모든 글 포함
            # 전략 2: 키워드가 없더라도 해당 기관의 최신 5개 글은 무조건 포함 (사이트가 비어보이지 않게)
            included_count = 0
            for i, p in enumerate(source_posts):
                if p['has_keyword'] or i < 5:
                    all_posts.append(p)
                    included_count += 1
            
            print(f"  -> {source['name']}: {included_count}건 선별 완료")
                
        except Exception as e:
            print(f"[Fetcher] {source['name']} RSS 오류: {e}")
    return all_posts

def scrape_full_text(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        res = requests.get(url, timeout=15, headers=headers)
        res.raise_for_status()
        res.encoding = res.apparent_encoding
        soup = BeautifulSoup(res.text, 'html.parser')
        
        content = None
        if "molit.go.kr" in url:
            content = soup.select_one('.board_view_cont') or soup.select_one('.view_cont')
        elif "fsc.go.kr" in url:
            content = soup.select_one('#content-detail') or soup.select_one('.board-view-content')
        elif "korea.kr" in url:
            content = soup.select_one('.article-content') or soup.select_one('.view-cont')
        
        if not content:
            content = soup.select_one('article') or soup.select_one('#content') or soup.select_one('.content')

        if content:
            for s in content(['script', 'style', 'header', 'footer', 'nav']):
                s.decompose()
            return content.get_text(separator='\n', strip=True)[:3000]
        
        return "본문 내용을 특정할 수 없습니다. 원문 링크를 확인해주세요."
    except Exception as e:
        return f"스크래핑 실패: {str(e)}"

def run_fetcher():
    print("[Fetcher] 프로젝트 수집 시작...")
    all_raw_posts = fetch_rss_data()
    
    # 중복 제거 (ID 기준)
    unique_posts_dict = {}
    for p in all_raw_posts:
        if p['id'] not in unique_posts_dict:
            unique_posts_dict[p['id']] = p
    
    # 최신순 정렬
    sorted_posts = sorted(unique_posts_dict.values(), key=lambda x: x['date'], reverse=True)

    # 상위 10건만 처리 (병목 방지)
    selected_posts = sorted_posts[:10]
    
    final_data = []
    for p in selected_posts:
        print(f"[Fetcher] 본문 추출 중: {p['title']}")
        p['originalText'] = scrape_full_text(p['link'])
        final_data.append(p)
        time.sleep(0.5)
        
    return final_data

if __name__ == "__main__":
    data = run_fetcher()
    os.makedirs('agent', exist_ok=True)
    with open('agent/raw_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[Fetcher] 총 {len(data)}건 최종 수집 완료.")
