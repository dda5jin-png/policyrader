import requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

urls = [
    "https://www.molit.go.kr/USR/NEWS/m_71/lst.jsp?lcmspage=1&search_regdate_s=2025-01-01&search_regdate_e=2026-04-03&psize=50",
    "https://www.fsc.go.kr/no010101",
    "https://www.korea.kr/news/pressReleaseList.do"
]

from bs4 import BeautifulSoup

for url in urls:
    try:
        print(f"Testing {url}...")
        res = requests.get(url, headers=headers, timeout=10)
        res.encoding = res.apparent_encoding
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Test without tbody
        rows = soup.select('.table_list tr')
        print(f"  -> Rows found with '.table_list tr': {len(rows)}")
        
        # Test with direct tr find
        all_tr = soup.find_all('tr')
        print(f"  -> Total <tr> in soup: {len(all_tr)}")
        
    except Exception as e:
        print(f"  Error: {e}")
