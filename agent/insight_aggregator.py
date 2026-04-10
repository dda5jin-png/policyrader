import json
import os
from datetime import datetime
from data_connector import DataConnector
from ai_analyzer import generate_market_pulse

def aggregate_insights(status_info=None):
    print("📊 [Insight Aggregator] Institutional Data Collection Started...")
    connector = DataConnector()
    
    insights = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "system_status": status_info or {
            "last_check": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "daily_scans": 0,
            "new_posts": 0,
            "status": "Ready"
        },
        "market_indices": {},
        "loan_rates": [],
        "conforming_rates": [],
        "rent_loan_rates": [],
        "lh_notices": [],
        "risk_alerts": [],
        "auction_stats": []
    }
    
    # 1. REB Market Indices (매매가격지수 현황)
    print("  -> Fetching REB Market Indices...")
    reb_data = connector.fetch_reb_trend("A_2024_00072") # 예시 테이블 ID
    if reb_data:
        # 최신 전국 데이터 추출
        latest = reb_data[0]
        insights["market_indices"] = {
            "name": latest.get("STATBL_NM", "부동산 시장 지표"),
            "value": latest.get("DATA_VALUE", "0"),
            "unit": "%",
            "period": latest.get("PRD_DE", "")
        }
    
    # 2. HF Loan Rates (Multi-Type)
    print("  -> Fetching HF Interest Rates (Bogeumjari, Conforming, Rent)...")
    hf_data = connector.fetch_hf_rates()
    if hf_data: insights["loan_rates"] = hf_data
    
    cf_data = connector.fetch_conforming_loan_rates()
    if cf_data: insights["conforming_rates"] = cf_data
    
    rl_data = connector.fetch_rent_loan_rates()
    if rl_data: insights["rent_loan_rates"] = rl_data
        
    # 3. LH Notices
    print("  -> Fetching LH Subscription Notices...")
    lh_data = connector.fetch_lh_notices(row_count=5)
    if lh_data:
        insights["lh_notices"] = lh_data
        
    # 4. HUG Safety (Accidents)
    print("  -> Fetching HUG Safety Data...")
    hug_data = connector.fetch_hug_safety()
    if hug_data:
        insights["risk_alerts"] = hug_data
        
    # 5. Court Auctions
    print("  -> Fetching Court Auction Stats...")
    court_data = connector.fetch_court_auctions()
    if court_data:
        insights["auction_stats"] = court_data

    # 6. Generate AI Summary (NEW)
    print("  -> Generating AI Market Pulse summary...")
    ai_summary = generate_market_pulse(insights)
    insights["ai_summary"] = ai_summary

    # Save to public directory for frontend access
    output_path = "public/insights.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(insights, f, ensure_ascii=False, indent=2)
    
    print(f"✅ [Insight Aggregator] Insights saved to {output_path}")
    return insights

if __name__ == "__main__":
    aggregate_insights()
