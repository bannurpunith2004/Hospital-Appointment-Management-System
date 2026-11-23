const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR_ROOT = path.resolve(__dirname, 'screenshots');
const OUT_DIR_PUBLIC = path.resolve(__dirname, 'client', 'public', 'screenshots');

for (const dir of [OUT_DIR_ROOT, OUT_DIR_PUBLIC]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function login(email, password) {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Login failed for ${email}: ${data.message}`);
  }
  return data;
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        }
      } catch (e) {
        reject(e);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('1. Authenticating test users...');
  const adminAuth = await login('admin@carepoint.com', 'Admin@1234');
  const docAuth = await login('dr.reynolds@carepoint.com', 'Doctor@1234');
  const patAuth = await login('patient@carepoint.com', 'Patient@1234');

  console.log('✓ Admin authenticated:', adminAuth.user.name);
  console.log('✓ Doctor authenticated:', docAuth.user.name);
  console.log('✓ Patient authenticated:', patAuth.user.name);

  console.log('2. Starting headless Chrome browser on CDP port 9222...');
  const tmpDir = path.join(process.env.TEMP || 'C:\\temp', 'carepoint_chrome_' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const browser = spawn(BROWSER_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1440,900',
    '--disable-gpu',
    '--no-first-run',
    'about:blank'
  ]);

  await sleep(2000);

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    console.log('✓ Connected to page debugger:', wsUrl);
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    const capturePage = async (url, filename, authData = null, waitTime = 2500) => {
      console.log(`\nCapturing: ${filename} -> ${url}`);
      // Navigate to base origin first to inject state cleanly
      await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:5173/' });
      await sleep(400);

      if (authData) {
        await sendCDP(ws, 'Runtime.evaluate', {
          expression: `
            localStorage.setItem('carepoint_token', ${JSON.stringify(authData.token)});
            localStorage.setItem('carepoint_user', ${JSON.stringify(JSON.stringify(authData.user))});
          `
        });
      } else {
        await sendCDP(ws, 'Runtime.evaluate', {
          expression: `
            localStorage.removeItem('carepoint_token');
            localStorage.removeItem('carepoint_user');
          `
        });
      }

      await sleep(200);
      await sendCDP(ws, 'Page.navigate', { url });
      await sleep(waitTime);

      const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png', quality: 95 });
      const buf = Buffer.from(shot.data, 'base64');

      fs.writeFileSync(path.join(OUT_DIR_ROOT, filename), buf);
      fs.writeFileSync(path.join(OUT_DIR_PUBLIC, filename), buf);
      console.log(`✓ Saved ${filename}: ${Math.round(buf.length / 1024)} KB`);
    };

    // 1. Landing Page
    await capturePage('http://127.0.0.1:5173/', '01_landing_hero.png', null, 2000);

    // 2. Doctor Directory & Department Filter
    await capturePage('http://127.0.0.1:5173/doctors', '02_doctor_directory.png', null, 2000);

    // 3. Departments Catalog
    await capturePage('http://127.0.0.1:5173/departments', '03_departments.png', null, 2000);

    // 4. Login Portal
    await capturePage('http://127.0.0.1:5173/login', '04_login_portal.png', null, 1500);

    // 5. Admin Command Center Dashboard (Analytics, KPI cards, charts)
    await capturePage('http://127.0.0.1:5173/admin/dashboard', '05_admin_dashboard.png', adminAuth, 3500);

    // 6. Doctor Dashboard & Queue
    await capturePage('http://127.0.0.1:5173/doctor/dashboard', '06_doctor_dashboard.png', docAuth, 3500);

    // 7. Patient Portal
    await capturePage('http://127.0.0.1:5173/patient/dashboard', '07_patient_portal.png', patAuth, 3500);

    // 8. Patient Booking Flow
    await capturePage('http://127.0.0.1:5173/patient/book', '08_patient_booking.png', patAuth, 3000);

    ws.close();
    console.log('\nAll 8 screenshots successfully captured and saved in both screenshots/ and client/public/screenshots/!');
  } finally {
    browser.kill();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
