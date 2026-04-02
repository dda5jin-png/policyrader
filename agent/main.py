import json
import os
import sys

# agent 디렉토리를 path에 추가하여 모듈 임포트 가능케 함
sys.path.append(os.path.join(os.path.dirname(__file__)))

from fetcher import run_fetcher
from ai_analyzer import run_analyzer

def main():
    print("🚀 [Policy Radar] 자동 업데이트 프로세스 시작")
    
    # 1. 뉴스 수집
    try:
        raw_data = run_fetcher()
        if not raw_data:
            print("⚠️ [Fetcher] 새로운 데이터가 없습니다.")
            return
            
        # raw_data.json 저장 (AI 분석을 위해)
        # root에서 실행되므로 agent/raw_data.json 경로 유지
        raw_data_path = 'agent/raw_data.json'
        with open(raw_data_path, 'w', encoding='utf-8') as f:
            json.dump(raw_data, f, ensure_ascii=False, indent=2)
        print(f"✅ [Fetcher] {len(raw_data)}건 수집 완료")
        
    except Exception as e:
        print(f"❌ [Fetcher] 오류 발생: {e}")
        return

    # 2. AI 분석 및 posts.json 업데이트
    try:
        run_analyzer()
        print("✅ [AI Analyzer] 분석 및 posts.json 업데이트 완료")
    except Exception as e:
        print(f"❌ [AI Analyzer] 오류 발생: {e}")
        return

    print("🏁 [Policy Radar] 모든 프로세스 종료")

if __name__ == "__main__":
    main()
