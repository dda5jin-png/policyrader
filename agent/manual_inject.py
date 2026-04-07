import json
import os
from datetime import datetime
from agent.fetcher import scrape_full_content

def inject_golden_tax_data():
    print("🎯 [Manual Injection] 핵심 세금 정책 자료(텍스트 포함) 주목을 시작합니다.")
    
    target_data = [
        {
            "id": "manual_tax_2025_reform",
            "title": "상속세 최고세율 40%로 하향…민생 살리는 ‘2025년 세제개편안’ 주요내용",
            "link": "https://www.korea.kr/news/policyNewsView.do?newsId=148946731",
            "date": "2025-07-25",
            "source": "재정경제부",
            "originalText": """
            정부는 25일 세제발전심의위원회를 개최하여 ‘2025년 세제개편안’을 확정 발표했습니다.
            주요 내용으로 상속세 최고세율을 현행 50%에서 40%로 하향 조정하고, 자녀 1인당 상속세 공제액을 5천만 원에서 5억 원으로 대폭 상향합니다.
            또한, 종합부동산세(종부세) 부담 완화를 위해 1주택자의 공제 한도를 확대하고, 3주택 이상 다주택자의 중과세율도 완화하는 내용이 포함되었습니다.
            금융투자소득세(금투세)는 폐지하기로 결정하였으며, 결혼 및 출산 장려를 위해 '결혼세액공제'를 신설하여 1인당 50만 원의 세액공제를 제공합니다.
            이는 경제 활력을 제고하고 가계의 세 부담을 실질적으로 경감하기 위한 조치입니다.
            """
        },
        {
            "id": "manual_tax_2026_policy",
            "title": "2026년 경제정책방향 발표… 부동산 실거주 의무 전면 폐지 추진",
            "link": "https://www.korea.kr/news/policyNewsView.do?newsId=148957488",
            "date": "2026-01-05",
            "source": "경제기획부",
            "originalText": """
            2026년 경제정책방향에 따르면, 정부는 내 집 마련의 걸림돌을 제거하기 위해 수도권 분양가 상한제 아파트의 실거주 의무를 전면 폐지하기로 했습니다.
            또한, 주택 거래 활성화를 위해 다주택자 양도세 중과 유예 조치를 1년 더 연장하고, LTV 및 DSR 규제를 지역별 상황에 맞춰 기동성 있게 운영할 계획입니다.
            GTX-A 노선의 완전 개통과 B, C 노선의 조기 착공을 통해 역세권 중심의 주택 공급을 확대하고, 노후 계획도시 재건축을 위한 마스터플랜을 상반기 내 확정할 계획입니다.
            """
        },
        {
            "id": "manual_tax_2026_decree",
            "title": "세법 시행령 개정안 확정… 다주택자 양도세 중과 유예 연장",
            "link": "https://www.korea.kr/news/policyNewsView.do?newsId=148958167",
            "date": "2026-01-16",
            "source": "재정경제부",
            "originalText": """
            정부는 국무회의를 통해 2025년 세법 개정 후속 시행령 개정안을 확정했습니다.
            가장 눈에 띄는 대목은 2026년 5월 종료 예정이었던 '다주택자 양도소득세 중과 유예' 조치를 2027년 5월까지 1년 더 연장한 것입니다.
            이로써 다주택자가 주택을 처분할 때 최대 82.5%에 달하던 징벌적 세세율 대신 기본세율(6~45%)을 적용받게 됩니다.
            또한, 일시적 2주택자의 종전 주택 처분 기한을 3년으로 유지하고, 상생임대인에 대한 양도세 특례 적용 기한도 2년 연장하기로 결정했습니다.
            """
        },
        {
            "id": "manual_tax_2025_appraisal",
            "title": "2025년 부동산 공시가격 현실화율 2020년 수준으로 동결",
            "link": "https://www.korea.kr/news/policyNewsView.do?newsId=148936451",
            "date": "2024-11-19",
            "source": "국토교통부",
            "originalText": """
            정부는 2025년 적용될 아파트 등 부동산의 공시가격 현실화율을 2020년 수준으로 동결하기로 했습니다.
            당초 로드맵대로라면 현실화율이 70% 이상으로 상향되어야 하지만, 가계의 재산세 및 종부세 부담을 완화하기 위해 현실화율을 하향 조정했던 2020년 수준(공동주택 기준 69.0%)으로 묶기로 한 것입니다.
            이에 따라 집값 상승분이 크지 않은 지역의 경우, 내년도 보유세 부담은 올해와 비슷하거나 완만하게 상승할 것으로 보입니다.
            정부는 공시가격 현실화 로드맵 자체를 전면 폐지하고 새로운 공시 체계를 도입하는 방안을 추진 중입니다.
            """
        }
    ]
    
    # 기존 데이터와 병합 로직 (중복 제거)
    target_path = 'agent/raw_data.json'
    existing_data = []
    if os.path.exists(target_path):
        with open(target_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            
    existing_ids = {p['id'] for p in existing_data}
    added_count = 0
    
    for entry in target_data:
        if entry['id'] not in existing_ids:
            entry["views"] = 0
            entry["has_keyword"] = True
            existing_data.append(entry)
            added_count += 1
            
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)
        
    print(f"\n🚀 총 {added_count}건의 고부가가치 세금 정책 자료가 주입되었습니다.")

if __name__ == "__main__":
    inject_golden_tax_data()
