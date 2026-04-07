import json
import os
import sys

# agent 디렉토리를 path에 추가하여 모듈 임포트 가능케 함
sys.path.append(os.path.join(os.path.dirname(__file__)))

from fetcher import run_fetcher
from ai_analyzer import run_analyzer
from validate_posts import main as validate_posts_main

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
        return

    print("🏁 [Policy Radar] 모든 프로세스 종료")

if __name__ == "__main__":
    main()
