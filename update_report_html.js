const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getBase64Image(filename) {
  const filePath = path.join(__dirname, 'screenshots', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Screenshot not found: ${filePath}`);
  }
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const landingImg = getBase64Image('01_landing_hero.png');
const doctorDirImg = getBase64Image('02_doctor_directory.png');
const adminDashImg = getBase64Image('05_admin_dashboard.png');
const doctorDashImg = getBase64Image('06_doctor_dashboard.png');
const patientPortImg = getBase64Image('07_patient_portal.png');
const bookingImg = getBase64Image('08_patient_booking.png');

console.log('✓ All 6 screenshots loaded into base64 buffers.');

// Read existing HTML template
let html = fs.readFileSync(path.join(__dirname, 'PROJECT_REPORT.html'), 'utf8');

// Replace Page 5 content with Real Screenshot Grid
const page5OldRegex = /<!-- ==================== PAGE 5: SCREENSHOTS & UI WALKTHROUGH ==================== -->[\s\S]*?<!-- ==================== PAGE 6: TESTING, DEPLOYMENT & CONCLUSION ==================== -->/;

const page5New = `<!-- ==================== PAGE 5: SCREENSHOTS & UI WALKTHROUGH ==================== -->
  <div class="page">
    <div class="page-header">APPLICATION WALKTHROUGH — CAREPOINT</div>
    <div class="content">
      <div class="section-title">4. APPLICATION SCREENSHOTS & UI WALKTHROUGH</div>
      <p style="font-size: 8pt; color: #475569; margin-bottom: 5px;">
        The screenshots below illustrate key responsive modules captured live from the operational CarePoint system across public, physician, and patient interfaces.
      </p>

      <div class="screenshot-grid">
        <div class="screenshot-card">
          <img src="${landingImg}" alt="Figure 4.1: Public Landing Page" />
          <div class="caption">Figure 4.1: Public Landing Page & Healthcare Hero Section.</div>
        </div>
        <div class="screenshot-card">
          <img src="${doctorDirImg}" alt="Figure 4.2: Doctor Directory" />
          <div class="caption">Figure 4.2: Doctor Directory with department filters, ratings & fees.</div>
        </div>
        <div class="screenshot-card">
          <img src="${doctorDashImg}" alt="Figure 4.3: Doctor Dashboard" />
          <div class="caption">Figure 4.3: Doctor Dashboard with consultation queue & schedule.</div>
        </div>
        <div class="screenshot-card">
          <img src="${patientPortImg}" alt="Figure 4.4: Patient Portal" />
          <div class="caption">Figure 4.4: Patient Portal with health profile & appointment history.</div>
        </div>
      </div>

      <div class="subsection-title">4.1 Patient-Facing Screens & Booking Flow</div>
      <p>
        The patient interface comprises the healthcare landing page, doctor directory with real-time filtering, interactive 3-step booking wizard with calendar and time slot selection, consultation history table, and medical profile editor. Real-time feedback, badge indicators, and automated slot locking streamline the booking experience while preventing double-bookings.
      </p>

      <div class="subsection-title">4.2 Doctor-Facing Screens & Clinical Encounters</div>
      <p>
        The physician portal includes today's patient queue, schedule management (weekday selectors and slot increments), clinical encounter documentation (clinical notes, diagnostic observations, and electronic prescriptions), and patient search registry.
      </p>

      <div class="subsection-title">4.3 Administrative Governance & Analytics</div>
      <p>
        The administrator interface provides complete oversight of medical personnel, patient registries, department configurations, and hospital appointment queues, backed by visual statistical summaries and interactive charts.
      </p>
    </div>
    <div class="page-footer">CAREPOINT | PAGE 5</div>
  </div>

  <!-- ==================== PAGE 6: TESTING, DEPLOYMENT & CONCLUSION ==================== -->`;

html = html.replace(page5OldRegex, page5New);

// Replace Page 6 Figure 5 ASCII box with Real Admin Screenshot
const page6FigureOldRegex = /<div class="section-title">4\. APPLICATION SCREENSHOTS \(CONTINUED\)<\/div>[\s\S]*?<div class="caption">Figure 5: Administrator Executive Dashboard and Recharts Visualizations\.<\/div>/;

const page6FigureNew = `<div class="section-title">4. APPLICATION SCREENSHOTS (CONTINUED)</div>
      <div class="screenshot-card" style="margin-bottom: 6px;">
        <img src="${adminDashImg}" style="height: 120px; object-fit: cover; object-position: top;" alt="Figure 4.5: Administrator Command Center" />
        <div class="caption">Figure 4.5: Administrator Command Center with Recharts analytics and hospital KPI cards.</div>
      </div>`;

html = html.replace(page6FigureOldRegex, page6FigureNew);

// Ensure CSS has styles for screenshot-grid and screenshot-card
if (!html.includes('.screenshot-grid')) {
  const cssInjection = `
    .screenshot-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
      margin: 4px 0 6px 0;
    }
    .screenshot-card {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      overflow: hidden;
      background: #f8fafc;
      text-align: center;
    }
    .screenshot-card img {
      width: 100%;
      height: 98px;
      object-fit: cover;
      object-position: top;
      display: block;
    }
    .screenshot-card .caption {
      font-size: 7.2pt;
      font-weight: bold;
      color: #1e3a8a;
      padding: 3px 4px;
      background: #f1f5f9;
      border-top: 1px solid #cbd5e1;
      text-align: center;
      margin: 0;
    }
  `;
  html = html.replace('/* ASCII Diagrams */', cssInjection + '\n    /* ASCII Diagrams */');
}

fs.writeFileSync(path.join(__dirname, 'PROJECT_REPORT.html'), html, 'utf8');
console.log('✓ Successfully injected live screenshot elements and CSS into PROJECT_REPORT.html');
