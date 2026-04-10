import json
import os
import sys

# agent 디렉토리를 path에 추가하여 모듈 임포트 가능케 함
sys.path.append(os.path.join(os.path.dirname(__file__)))

from fetcher import run_fetcher
from ai_analyzer import run_analyzer
from insight_aggregator import aggregate_insights
from validate_posts import main as validate_posts_main

def main():
    print("🚀 [Policy Radar] 자동 업데이트 프로세스 시작")
    analyzer_limit_count = int(os.getenv("ANALYZER_LIMIT_COUNT", "10"))
    print(f"ℹ️ [Config] ANALYZER_LIMIT_COUNT={analyzer_limit_count}")
    
    # 1. 뉴스 수집
    total_fetched = 0
    try:
        raw_data = run_fetcher()
        if not raw_data:
            print("⚠️ [Fetcher] 새로운 데이터가 없습니다.")
            # 데이터가 없어도 상태 업데이트를 위해 진행할 수 있도록 처리
            raw_data = []
        
        total_fetched = len(raw_data)
            
        # raw_data.json 저장 (AI 분석을 위해)
        raw_data_path = 'agent/raw_data.json'
        with open(raw_data_path, 'w', encoding='utf-8') as f:
            json.dump(raw_data, f, ensure_ascii=False, indent=2)
        print(f"✅ [Fetcher] {total_fetched}건 수집 완료")
        
    except Exception as e:
        print(f"❌ [Fetcher] 오류 발생: {e}")
        sys.exit(1)

    # 2. AI 분석 및 posts.json 업데이트
    succeeded_count = 0
    try:
        analyzer_summary = run_analyzer(limit_count=analyzer_limit_count)
        failed_count = len(analyzer_summary.get("failed", []))
        succeeded_count = analyzer_summary.get("succeeded", 0)
        print(f"✅ [AI Analyzer] 분석 및 posts.json 업데이트 완료 (성공: {succeeded_count}, 실패: {failed_count})")
    except Exception as e:
        print(f"❌ [AI Analyzer] 오류 발생: {e}")
        # AI 분석 실패 시에도 상태 기록을 위해 계속 진행 (succeeded_count=0)

        
    # 3. 기관 데이터 통합 및 인사이트 생성
    try:
        from datetime import datetime
        status_info = {
            "last_check": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "daily_scans": total_fetched,
            "new_posts": succeeded_count,
            "status": "Active"
        }
        aggregate_insights(status_info=status_info)
        print("✅ [Insight Aggregator] 기관 데이터 및 마켓 펄스 업데이트 완료")
    except Exception as e:
        print(f"❌ [Insight Aggregator] 오류 발생: {e}")
        # 인사이트 실패는 전체 프로세스 중단 사유는 아니라고 판단하여 계속 진행

    try:
        original_argv = sys.argv[:]
        sys.argv = ["validate_posts.py", "--file", "public/posts.json", "--fix"]
        exit_code = validate_posts_main()
        sys.argv = original_argv
        if exit_code != 0:
            print(f"❌ [Validator] 검증 실패 (exit code: {exit_code})")
            return
        print("✅ [Validator] posts.json 검증 및 정규화 완료")
    except Exception as e:
        sys.argv = original_argv
        print(f"❌ [Validator] 오류 발생: {e}")
        sys.exit(1)

    print("🏁 [Policy Radar] 모든 프로세스 종료")

if __name__ == "__main__":
    main()
