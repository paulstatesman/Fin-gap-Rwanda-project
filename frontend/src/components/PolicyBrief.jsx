import React, { useState, useRef } from 'react';
import { generatePolicyReport, fetchDistrict } from '../services/api';

/* ─────────────────────────────────────────────────────────────────────────
   Minimal Markdown → HTML renderer (handles headings, bold, tables, lists,
   horizontal rules, paragraphs). No external dependency needed.
───────────────────────────────────────────────────────────────────────── */
const renderMarkdown = (md) => {
  if (!md) return '';
  const lines = md.split('\n');
  const html = [];
  let inTable = false;
  let inList = false;
  let tableHeader = false;

  const flushList = () => {
    if (inList) { html.push('</ul>'); inList = false; }
  };
  const flushTable = () => {
    if (inTable) { html.push('</tbody></table>'); inTable = false; tableHeader = false; }
  };

  const inline = (text) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      flushList(); flushTable();
      html.push('<hr class="brief-hr" />');
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (hMatch) {
      flushList(); flushTable();
      const level = hMatch[1].length;
      html.push(`<h${level} class="brief-h${level}">${inline(hMatch[2])}</h${level}>`);
      continue;
    }

    // Table rows
    if (line.startsWith('|')) {
      flushList();
      const cells = line.split('|').filter((_, i2, a) => i2 > 0 && i2 < a.length - 1);
      if (line.includes('---')) {
        // separator row — start tbody
        html.push('</thead><tbody>');
        tableHeader = false;
        continue;
      }
      if (!inTable) {
        html.push('<div class="table-scroll-x"><table class="brief-table"><thead>');
        inTable = true;
        tableHeader = true;
      }
      const tag = tableHeader ? 'th' : 'td';
      html.push('<tr>' + cells.map(c => `<${tag}>${inline(c.trim())}</${tag}>`).join('') + '</tr>');
      continue;
    } else {
      flushTable();
    }

    // Unordered list items
    const liMatch = line.match(/^[-*]\s+(.*)/);
    if (liMatch) {
      flushTable();
      if (!inList) { html.push('<ul class="brief-ul">'); inList = true; }
      html.push(`<li>${inline(liMatch[1])}</li>`);
      continue;
    }

    flushList();

    // Blank line
    if (line.trim() === '') {
      html.push('<br/>');
      continue;
    }

    // Paragraph / plain text
    html.push(`<p class="brief-p">${inline(line)}</p>`);
  }

  flushList();
  flushTable();
  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────────────────────
   Rwanda districts list (used when parent passes none)
───────────────────────────────────────────────────────────────────────── */
const RWANDA_DISTRICTS = [
  'Bugesera','Burera','Gakenke','Gasabo','Gatsibo','Gicumbi','Gisagara',
  'Huye','Kamonyi','Karongi','Kayonza','Kicukiro','Kirehe','Muhanga',
  'Musanze','Ngoma','Ngororero','Nyabihu','Nyagatare','Nyamagabe',
  'Nyamasheke','Nyanza','Nyarugenge','Nyaruguru','Rubavu','Ruhango',
  'Rulindo','Rusizi','Rutsiro','Rwamagana',
];

/* ─────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────── */
const PolicyBrief = ({ districts = [] }) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [aiPowered, setAiPowered] = useState(false);
  const printRef = useRef(null);

  const districtList = districts.length > 0
    ? districts
    : RWANDA_DISTRICTS.map((name, i) => ({ id: i + 1, district: name, province: '—' }));

  const handleGenerate = async () => {
    if (!selectedDistrictId) return;
    setGenerating(true);
    setError('');
    setReportMarkdown('');
    setAiPowered(false);

    try {
      // 1. Fetch full district detail (includes drivers + recommendations)
      let districtData;
      try {
        districtData = await fetchDistrict(selectedDistrictId);
      } catch {
        // Fallback: use the row from the districts prop
        districtData = districts.find(d => String(d.id) === String(selectedDistrictId));
      }

      if (!districtData) throw new Error('Could not load district data.');

      // 2. Generate the report (LLM or deterministic fallback)
      const hasKey = !!process.env.REACT_APP_GEMINI_API_KEY;
      const md = await generatePolicyReport(districtData, districts);
      setReportMarkdown(md);
      setAiPowered(hasKey);
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Policy Brief — FIN-GAP RWANDA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@700;800&display=swap');
    body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #fff; max-width: 800px; margin: 0 auto; padding: 40px 48px; font-size: 13px; line-height: 1.75; }
    .print-header { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #10b981; padding-bottom: 18px; margin-bottom: 28px; }
    .print-logo { width: 52px; height: 52px; background: linear-gradient(135deg,#10b981,#06b6d4); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .print-title { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: #0f172a; }
    .print-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
    h2 { font-family:'Outfit',sans-serif; font-size: 19px; color: #0f172a; margin: 24px 0 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    h3 { font-family:'Outfit',sans-serif; font-size: 15px; color: #065f46; margin: 20px 0 6px; }
    h4 { font-size: 13px; color: #1e3a5f; margin: 14px 0 4px; }
    p  { margin: 6px 0; }
    ul { padding-left: 20px; margin: 6px 0; }
    li { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 18px; font-size: 12px; }
    th { background: #f1f5f9; color: #0f172a; font-weight: 700; padding: 8px 10px; text-align: left; border: 1px solid #cbd5e1; }
    td { padding: 7px 10px; border: 1px solid #e2e8f0; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 18px 0; }
    strong { color: #0f172a; }
    code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-family: monospace; }
    .print-footer { border-top: 1px solid #e2e8f0; margin-top: 36px; padding-top: 12px; font-size: 10.5px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 20px; }
      .print-header { break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <div class="print-logo">🇷🇼</div>
    <div>
      <div class="print-title">FIN-GAP RWANDA</div>
      <div class="print-sub">District Financial Inclusion Policy Brief · NISR 2026</div>
    </div>
  </div>
  ${content}
  <div class="print-footer">
    FIN-GAP RWANDA © 2026 · Built for NISR Big Data Hackathon (Track 2) · Data: FinScope Rwanda 2024 / EICV6
  </div>
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const selectedName = districtList.find(d => String(d.id) === String(selectedDistrictId))?.district || '';

  return (
    <div className="glass card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card-header">
        <h2><i className="fa-solid fa-file-contract"></i> Executive Policy Brief</h2>
        <div className="card-desc">
          Dynamically generated, localized policy PDF reports for local government leaders — powered by the Mismatch Matrix.
        </div>
      </div>

      {/* ── Static national brief ──────────────────────────────────────────── */}
      <div className="policy-doc">
        <p>
          Based on the findings from the <strong>FIN-GAP RWANDA Mismatch Tool</strong>, bridging the financial inclusion gap requires shifting from a blanket national approach to targeted, district-specific interventions. The data clearly shows that districts with similar poverty levels (e.g., Gisagara and Rutsiro) often face entirely different structural barriers to inclusion.
        </p>

        <h3>Strategic Alignment with NST2 Priorities</h3>

        <div className="table-scroll-x">
          <table className="nst2-table">
            <thead>
              <tr>
                <th>NST2 Pillar</th>
                <th>FIN-GAP Finding</th>
                <th>Recommended Policy Action (MINECOFIN / BNR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Economic Transformation</strong><br/><span className="text-dim">Job Creation &amp; Agriculture</span></td>
                <td>Deep reliance on informal savings (Ikimina) in rural agricultural districts (e.g., Nyanza, Gatsibo) despite growing mobile money usage.</td>
                <td>Digitize VSLA (Village Savings and Loan Associations) and integrate agricultural cooperative payouts directly into mobile wallets.</td>
              </tr>
              <tr>
                <td><strong>Social Transformation</strong><br/><span className="text-dim">Eradicating Extreme Poverty</span></td>
                <td>Severely Underserved districts show a massive gender gap in financial access and phone ownership (e.g., Rutsiro female exclusion at 31%).</td>
                <td>Launch the <strong>"Agent Kazi"</strong> female agent network pilot and subsidize smart-feature phones for female heads of households.</td>
              </tr>
              <tr>
                <td><strong>Transformational Governance</strong><br/><span className="text-dim">Service Delivery</span></td>
                <td>Remote districts with harsh topography (Ngororero, Nyaruguru) suffer from high agent distance barriers.</td>
                <td>Mandate BNR cash-float subsidies for agents operating in extreme rural sectors to ensure liquidity. Establish shared MFI digital kiosks at Sector offices.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>The "Mismatch" Intervention Strategy</h3>
        <p>
          Districts fall into three categories based on their Mismatch Gap, dictating the type of intervention needed:
        </p>

        <div className="policy-grid">
          <div className="policy-box" style={{ borderLeft: '4px solid var(--red)' }}>
            <h4 className="text-red">1. High Positive Gap (Severely Underserved)</h4>
            <p className="text-dim mt-2" style={{ fontSize: '12px' }}>Districts like Gisagara &amp; Rutsiro where exclusion is much worse than poverty alone explains.</p>
            <ul className="mt-2">
              <li>Infrastructure first: Incentivize telco network expansion.</li>
              <li>Agent liquidity subsidies to ensure rural cash-in/cash-out reliability.</li>
              <li>Offline-capable (USSD) micro-savings tools.</li>
            </ul>
          </div>

          <div className="policy-box" style={{ borderLeft: '4px solid var(--emerald)' }}>
            <h4 className="text-emerald">2. Negative Gap (Well-Served / Over-performing)</h4>
            <p className="text-dim mt-2" style={{ fontSize: '12px' }}>Districts like Nyarugenge &amp; Rubavu that have overcome baseline poverty constraints.</p>
            <ul className="mt-2">
              <li>Transition from access to usage: Promote micro-insurance and digital credit.</li>
              <li>Expand merchant QR code payments for informal urban traders.</li>
              <li>Promote retail investment and EjoHeza digital pension plans.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── District Report Generator ──────────────────────────────────────── */}
      <div className="report-generator-section">
        <div className="report-gen-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-wand-magic-sparkles text-purple"></i>
            <h3 style={{ fontSize: '15px', color: 'var(--gold)', margin: 0 }}>
              Report Generator
            </h3>
          </div>
          <div className="report-gen-badges">
            {process.env.REACT_APP_GEMINI_API_KEY ? (
              <span className="report-gen-badge badge-ai">
                <i className="fa-solid fa-robot"></i> Gemini AI Powered
              </span>
            ) : (
              <span className="report-gen-badge badge-offline">
                <i className="fa-solid fa-shield-halved"></i> Evidence-Based Fallback
              </span>
            )}
            <span className="report-gen-badge badge-pdf">
              <i className="fa-solid fa-file-pdf"></i> PDF Ready
            </span>
          </div>
        </div>
        <p className="text-dim" style={{ fontSize: '12.5px', marginBottom: '16px' }}>
          Select a district to dynamically generate a localized policy brief tailored for its local government leader,
          drawing insights directly from the Mismatch Matrix data.
        </p>

        {/* Selector + Button */}
        <div className="report-gen-controls">
          <div className="sim-select" style={{ flex: 1, marginBottom: 0 }}>
            <label>Select District</label>
            <select
              value={selectedDistrictId}
              onChange={e => {
                setSelectedDistrictId(e.target.value);
                setReportMarkdown('');
                setError('');
              }}
            >
              <option value="">— Choose a district —</option>
              {districtList.map(d => (
                <option key={d.id} value={d.id}>
                  {d.district}{d.province && d.province !== '—' ? ` (${d.province})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!selectedDistrictId || generating}
            style={{ alignSelf: 'flex-end', minWidth: '180px' }}
          >
            {generating ? (
              <><i className="fa-solid fa-circle-notch fa-spin"></i> Generating…</>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate Brief</>
            )}
          </button>
        </div>

        {error && (
          <div className="error-box" style={{ marginTop: '14px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}

        {/* Report Output */}
        {reportMarkdown && (
          <div className="report-output-wrapper">
            {/* Toolbar */}
            <div className="report-output-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-file-lines text-teal"></i>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                  Policy Brief — {selectedName}
                </span>
                {aiPowered ? (
                  <span className="report-gen-badge badge-ai" style={{ fontSize: '10px' }}>
                    <i className="fa-solid fa-robot"></i> AI Generated
                  </span>
                ) : (
                  <span className="report-gen-badge badge-offline" style={{ fontSize: '10px' }}>
                    <i className="fa-solid fa-database"></i> Data-Driven
                  </span>
                )}
              </div>
              <button className="btn btn-outline btn-sm" onClick={handlePrint}>
                <i className="fa-solid fa-download"></i> Download / Print PDF
              </button>
            </div>

            {/* Rendered brief */}
            <div
              className="report-rendered-brief"
              ref={printRef}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(reportMarkdown) }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyBrief;
