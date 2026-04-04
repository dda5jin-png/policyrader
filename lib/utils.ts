import { Post } from "../components/PostComponents";

export const copyLink = (id: string) => {
  const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert('🔗 링크가 복사되었습니다!');
    });
  } else {
    const el = document.createElement('textarea');
    el.value = url;
    el.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(el);
    el.focus(); el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('🔗 링크가 복사되었습니다!');
  }
};

export const printPDF = (p: Post) => {
  const catColor: Record<string, string> = { F:'#166534', X:'#92400e', S:'#1e40af', T:'#991b1b', R:'#9a3412', P:'#6b21a8' };
  const catBg: Record<string, string> = { F:'#dcfce7', X:'#fef3c7', S:'#dbeafe', T:'#fee2e2', R:'#ffedd5', P:'#f3e8ff' };

  const summaryHTML = (p.summary || []).map((s, i) =>
    `<div class="s-item"><span class="s-num">${i+1}</span><span>${s}</span></div>`).join('');

  const keyDataHTML = (p.keyData && p.keyData.length) ? `
    <div class="section">
      <div class="sec-title">데이터 세부 지표</div>
      <table><thead><tr><th>항목</th><th>수치</th><th>적용대상</th></tr></thead><tbody>
        ${p.keyData.map(d => `<tr><td>${d.항목||''}</td><td class="num-cell">${d.수치||''}</td><td>${d.적용대상||''}</td></tr>`).join('')}
      </tbody></table>
    </div>` : '';

  const checklistHTML = (p.checklist && p.checklist.length) ? `
    <div class="section">
      <div class="sec-title">사용자 체크리스트</div>
      ${p.checklist.map(c => `<div class="c-item"><span class="c-arrow">→</span><span>${c}</span></div>`).join('')}
    </div>` : '';

  const expertHTML = (p.expertOpinions && p.expertOpinions.length) ? `
    <div class="section">
      <div class="sec-title">전문가 시나리오 분석</div>
      <div class="expert-box">"${p.expertOpinions[0].comment}"
        <div class="expert-name">— ${p.expertOpinions[0].name} (${p.expertOpinions[0].affiliation})</div>
      </div>
    </div>` : '';

  const col = catColor[p.cat] || '#333';
  const bg  = catBg[p.cat]   || '#f5f5f5';

  const win = window.open('', '_blank');
  if (!win) return;

  win.document.write(`<!DOCTYPE html><html lang="ko"><head>
    <meta charset="UTF-8">
    <title>${p.headline}</title>
    <style>
      @page { size: A4; margin: 14mm 14mm 12mm 14mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif; font-size: 9.5pt; color: #1a1a1a; line-height: 1.65; }
      .page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #e31837; padding-bottom: 7px; margin-bottom: 13px; }
      .logo { font-size: 12.5pt; font-weight: 800; color: #e31837; letter-spacing: -0.5px; }
      .header-meta { font-size: 7.5pt; color: #666; text-align: right; line-height: 1.5; }
      .badge { display: inline-block; padding: 3px 11px; background: ${bg}; color: ${col}; border-radius: 100px; font-size: 8pt; font-weight: 700; margin-bottom: 7px; }
      h1 { font-size: 13.5pt; font-weight: 800; line-height: 1.3; margin-bottom: 5px; color: #111; }
      .meta { font-size: 7.5pt; color: #666; margin-bottom: 13px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      .section { margin-bottom: 11px; page-break-inside: avoid; }
      .sec-title { font-size: 8.5pt; font-weight: 700; color: ${col}; border-bottom: 1px solid ${col}; padding-bottom: 3px; margin-bottom: 7px; letter-spacing: 0.3px; }
      .s-item { display: flex; gap: 8px; padding: 5px 10px; background: #f8f8f8; border-left: 3px solid ${col}; margin-bottom: 4px; page-break-inside: avoid; }
      .s-num { font-weight: 700; color: ${col}; min-width: 14px; }
      table { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
      th { background: #f4f4f5; font-weight: 700; padding: 5px 8px; text-align: left; border-bottom: 1.5px solid #ccc; font-size: 8pt; }
      td { padding: 4px 8px; border-bottom: 1px solid #eee; vertical-align: top; font-size: 9pt; }
      .num-cell { font-weight: 700; color: ${col}; }
      .c-item { display: flex; gap: 8px; padding: 5px 10px; background: #eff6ff; border-left: 3px solid #2563eb; margin-bottom: 4px; page-break-inside: avoid; }
      .c-arrow { color: #2563eb; font-weight: 700; }
      .expert-box { padding: 10px 14px; background: #fef2f2; border-left: 3px solid #e31837; border-radius: 0 8px 8px 0; font-style: italic; font-size: 9pt; page-break-inside: avoid; }
      .expert-name { margin-top: 8px; font-weight: 700; font-style: normal; font-size: 8pt; color: #e31837; text-align: right; }
      .page-footer { margin-top: 12px; padding-top: 7px; border-top: 1px solid #ddd; font-size: 7pt; color: #999; display: flex; justify-content: space-between; }
    </style>
  </head><body>
    <div class="page-header">
      <div class="logo">Policy Radar | AI Intelligence Pipeline</div>
      <div class="header-meta">${p.date}<br>출처: ${p.source}</div>
    </div>
    <div class="badge">${p.catName || ''}</div>
    <h1>${p.headline}</h1>
    <div class="meta">발행일: ${p.date} &nbsp;|&nbsp; 출처: ${p.source}</div>
    <div class="section">
      <div class="sec-title">핵심 정책 요약</div>
      ${summaryHTML}
    </div>
    ${keyDataHTML}
    ${expertHTML}
    ${checklistHTML}
    <div class="page-footer">
      <span>${p.sourceUrl}</span>
      <span>dda5jin-png.github.io/policyrader/</span>
    </div>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
};
