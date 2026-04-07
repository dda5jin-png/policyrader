import os
import json
from datetime import datetime
from agent.fetcher import fetch_via_api_range, select_top_posts

def enrich_tax_seasons():
    print("🚀 [Enrichment] 세금 정책 '골든 타임' 데이터 수집을 시작합니다.")
    
    # 수집할 골든 타임 시즌들
    seasons = [
        ("2024 세제개편", datetime(2024, 7, 1), datetime(2024, 8, 31)),
        ("2025 세제개편", datetime(2025, 7, 1), datetime(2025, 8, 31)),
        ("2026 시행령개정", datetime(2026, 1, 1), datetime(2026, 2, 28))
    ]
    
    all_tax_posts = []
    # 세금 관련 핵심 키워드 (제목 기반)
    TAX_KEYWORDS = ['세법', '세제', '종부세', '양도세', '취득세', '재산세', '증여세', '상속세', '과세', '부동산 세금', '공시가격', '지방세']

    for name, start, end in seasons:
        print(f"\n--- [{name}] 수집 중 ({start.date()} ~ {end.date()}) ---")
        # 부처 필터 없이 전체 수집 후 제목 키워드로 필터링
        raw_period_posts = fetch_via_api_range(start, end)
        tax_in_season = [p for p in raw_period_posts if any(kw in p['title'] for kw in TAX_KEYWORDS)]
        print(f"  ✅ {name} 시즌: 관련 자료 {len(tax_in_season)}건 발견")
        all_tax_posts.extend(tax_in_season)
    
    if not all_tax_posts:
        print("\n⚠️ 수집된 세금 관련 데이터가 없습니다. API 키나 날짜 형식을 확인해야 할 수 있습니다.")
        return
    
    print(f"\n✅ 총 {len(all_tax_posts)}건의 세금 정책 자료 확보")
    
    # 기존 raw_data.json과 합치기 (중복 제거)
    target_path = 'agent/raw_data.json'
    existing_data = []
    if os.path.exists(target_path):
        with open(target_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            
    existing_ids = {p['id'] for p in existing_data}
    new_data = [p for p in all_tax_posts if p['id'] not in existing_ids]
    
    combined = existing_data + new_data
    
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)
        
    print(f"📂 {target_path}에 {len(new_data)}건의 세금 정책 자료가 추가되었습니다.")

if __name__ == "__main__":
    enrich_tax_seasons()
