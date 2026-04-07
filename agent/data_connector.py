import requests
import xml.etree.ElementTree as ET
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class DataConnector:
    """국토교통부 실거래가 API 및 기타 공공데이터 연동 클래스"""
    
    def __init__(self):
        self.api_key = os.getenv("DATA_GO_KR_API_KEY")
        # 사용자가 제공한 데브(Dev) 엔드포인트 사용
        self.base_url = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev"
        
        # 주요 시군구 법정동 코드 (앞 5자리)
        # TODO: 필요 시 별도 JSON 파일로 분리하여 관리
        self.region_codes = {
            "종로구": "11110", "중구": "11140", "용산구": "11170", "성동구": "11200", "광진구": "11215",
            "동대문구": "11230", "중랑구": "11260", "성북구": "11290", "강북구": "11305", "도봉구": "11320",
            "노원구": "11350", "은평구": "11380", "서대문구": "11410", "마포구": "11440", "양천구": "11470",
            "강서구": "11500", "구로구": "11530", "금천구": "11545", "영등포구": "11560", "동작구": "11590",
            "관악구": "11620", "서초구": "11650", "강남구": "11680", "송파구": "11710", "강동구": "11740",
            "수원": "41110", "성남": "41130", "용인": "41460", "안양": "41170", "부천": "41190",
            "광명": "41210", "평택": "41220", "안산": "41270", "고양": "41280", "과천": "41290",
            "구리": "41310", "남양주": "41360", "오산": "41370", "시흥": "41390", "군포": "41410",
            "의왕": "41430", "하남": "41450"
        }

    def get_lawd_cd(self, region_name):
        """지역명에서 5자리 시군구 코드를 찾습니다."""
        if not region_name:
            return None
        
        for name, code in self.region_codes.items():
            if name in region_name:
                return code
        return None

    def fetch_apt_trades(self, lawd_cd, deal_ymd):
        """특정 지역, 특정 월의 아파트 매매 실거래가를 가져옵니다."""
        if not self.api_key:
            return None
        
        params = {
            'serviceKey': self.api_key,
            'LAWD_CD': lawd_cd,
            'DEAL_YMD': deal_ymd,
            'numOfRows': 100,
            'pageNo': 1
        }
        
        try:
            # XML 형식만 지원하는 경우가 많으므로 XML로 처리
            response = requests.get(self.base_url + "/getAptTradeDev", params=params, timeout=10)
            response.raise_for_status()
            
            root = ET.fromstring(response.content)
            items = root.findall('.//item')
            
            trades = []
            for item in items:
                try:
                    price_str = item.findtext('거래금액', '0').replace(',', '').strip()
                    area = item.findtext('전용면적', '0').strip()
                    apt_name = item.findtext('아파트', '').strip()
                    floor = item.findtext('층', '0').strip()
                    build_year = item.findtext('건축년도', '').strip()
                    
                    trades.append({
                        "price": int(price_str),
                        "area": float(area),
                        "name": apt_name,
                        "floor": floor,
                        "build_year": build_year
                    })
                except Exception as e:
                    continue
            return trades
        except Exception as e:
            print(f"  ⚠️ API 호출 실패: {e}")
            return None

    def fetch_apt_rents(self, lawd_cd, deal_ymd):
        """특정 지역, 특정 월의 아파트 전월세 실거래가를 가져옵니다."""
        if not self.api_key:
            return None
        
        # 실제 운영 API 엔드포인트는 보통 RTMSDataSvcAptRent
        rent_url = "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent"
        params = {
            'serviceKey': self.api_key,
            'LAWD_CD': lawd_cd,
            'DEAL_YMD': deal_ymd,
            'numOfRows': 100,
            'pageNo': 1
        }
        
        try:
            response = requests.get(rent_url + "/getAptRent", params=params, timeout=10)
            response.raise_for_status()
            
            root = ET.fromstring(response.content)
            items = root.findall('.//item')
            
            rents = []
            for item in items:
                try:
                    deposit = item.findtext('보증금액', '0').replace(',', '').strip()
                    monthly = item.findtext('월세금액', '0').replace(',', '').strip()
                    area = item.findtext('전용면적', '0').strip()
                    apt_name = item.findtext('아파트', '').strip()
                    
                    rents.append({
                        "deposit": int(deposit),
                        "monthly": int(monthly),
                        "area": float(area),
                        "name": apt_name
                    })
                except Exception:
                    continue
            return rents
        except Exception as e:
            print(f"  ⚠️ 전월세 API 호출 실패: {e}")
            return None

    def fetch_bok_stats(self, table_code, item_code, cycle='M', count=1):
        """한국은행 ECOS API를 통해 경제 통계를 가져옵니다."""
        api_key = os.getenv("BOK_ECOS_API_KEY")
        if not api_key:
            return None
        
        now = datetime.now()
        if cycle == 'M':
            end_period = now.strftime("%Y%m")
            start_period = (now - timedelta(days=120)).strftime("%Y%m")
        else: # Daily
            end_period = now.strftime("%Y%m%d")
            start_period = (now - timedelta(days=30)).strftime("%Y%m%d")
            
        url = f"https://ecos.bok.or.kr/api/StatisticSearch/{api_key}/json/kr/1/{count}/{table_code}/{cycle}/{start_period}/{end_period}/{item_code}"
        
        try:
            response = requests.get(url, timeout=10)
            data = response.json()
            if "StatisticSearch" in data:
                return data["StatisticSearch"]["row"]
            return None
        except Exception as e:
            print(f"  ⚠️ BOK API 호출 실패: {e}")
            return None

    def fetch_reb_trend(self, table_id, item_tag=None):
        """한국부동산원 R-ONE API를 통해 매매/전세 지표 트렌드를 가져옵니다."""
        api_key = os.getenv("REB_RONE_API_KEY")
        if not api_key:
            return None
        
        # R-ONE API 엔드포인트
        url = "https://www.reb.or.kr/r-one/openapi/SttsApiData.do"
        params = {
            'KEY': api_key,
            'Type': 'json',
            'pIndex': 1,
            'pSize': 5,
            'STATBL_ID': table_id
        }
        if item_tag:
            params['ITM_TAG'] = item_tag
            
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            if "SttsApiData" in data and len(data["SttsApiData"]) > 1:
                # 첫 번째 요소는 결과 코드이므로 두 번째 요소부터 리스트
                return data["SttsApiData"][1].get("row", [])
            return None
        except Exception as e:
            print(f"  ⚠️ REB API 호출 실패: {e}")
            return None

    def get_market_context(self, region_name):
        """지역 데이터, 금리, 그리고 부동산원 지표 트렌드를 통합 요약합니다."""
        # 1. 거시 경제 지표 (금리)
        macro_summary = "[거시 경제 및 시장 지표]\n"
        base_rate_data = self.fetch_bok_stats("722Y001", "0101000", cycle='D', count=1)
        if base_rate_data:
            macro_summary += f"- 한국은행 기준금리: {base_rate_data[0]['DATA_VALUE']}% (공시일: {base_rate_data[0]['TIME']})\n"
        
        # 2. 부동산원 시장 심리 지수 (주간/월간 트렌드)
        # 테이블 ID 예시: A_2024_00072 (매매 대비 전세가격 비율)
        reb_data = self.fetch_reb_trend("A_2024_00072")
        if reb_data:
            # 전국 또는 서울 권역의 최신 데이터 추출
            latest_reb = next((r for r in reb_data if "서울" in r.get("UNIT_NM", "") or "전국" in r.get("UNIT_NM", "")), reb_data[0])
            macro_summary += f"- 시장 추세(부동산원): {latest_reb.get('STATBL_NM', '')} {latest_reb.get('DATA_VALUE', '')}% ({latest_reb.get('PRD_DE', '')})\n"

        # 3. 지역 데이터 (매매/전세 실거래)
        lawd_cd = self.get_lawd_cd(region_name)
        if not lawd_cd:
            return macro_summary + f"\n[{region_name}] 상세 시장 데이터(실거래)는 법정동 코드 미등록으로 생략되었습니다."
        
        now = datetime.now()
        months = [
            now.strftime("%Y%m"),
            (now.replace(day=1) - timedelta(days=1)).strftime("%Y%m")
        ]
        
        all_trades = []
        all_rents = []
        for ym in months:
            trades = self.fetch_apt_trades(lawd_cd, ym)
            rents = self.fetch_apt_rents(lawd_cd, ym)
            if trades: all_trades.extend(trades)
            if rents: all_rents.extend(rents)
        
        summary = f"\n[{region_name} 실거래 현황 (최근 2개월)]\n"
        
        if all_trades:
            avg_trade = sum(t['price'] for t in all_trades) / len(all_trades)
            summary += f"- 평균 매매가: {avg_trade:,.0f}만원 ({len(all_trades)}건)\n"
            
        jeonse_only = [r for r in all_rents if r['monthly'] == 0]
        if jeonse_only:
            avg_rent = sum(r['deposit'] for r in jeonse_only) / len(jeonse_only)
            summary += f"- 평균 전세가: {avg_rent:,.0f}만원 ({len(jeonse_only)}건)\n"
            
            if all_trades:
                jeonse_rate = (avg_rent / avg_trade) * 100
                summary += f"- 실거래 기반 전세가율: {jeonse_rate:.1f}%\n"
        
        return macro_summary + summary

if __name__ == "__main__":
    from datetime import timedelta # 테스트용
    connector = DataConnector()
    print(connector.get_market_context("강남구"))
