/**
 * BLOOM-OS // AESTHETIC NOTION LIFE DASHBOARD
 * Dreamy Pastel & Cozy Lofi Theme for Girls
 */

// ==========================================
// 1. DEFAULT DATA STATE (CLEAN SLATE)
// ==========================================
const DEFAULT_STATE = {
  profile: {
    name: "Aura",
    title: "BLOOM // AESTHETIC LIFE OS",
    quote: "You don’t have to chase what is already aligned with you. Stay calm, stay faithful, and bloom.",
    soundEnabled: true,
    particlesEnabled: true
  },
  lastActiveDate: new Date().toISOString().split('T')[0],
  tasks: [],
  prayers: {
    fajr: { name: "Fajr", nameAr: "الفجر", completed: false, time: "05:15 AM", sunnah: false },
    dhuhr: { name: "Dhuhr", nameAr: "الظهر", completed: false, time: "12:45 PM", sunnah: false },
    asr: { name: "Asr", nameAr: "العصر", completed: false, time: "04:10 PM", sunnah: false },
    maghrib: { name: "Maghrib", nameAr: "المغرب", completed: false, time: "06:40 PM", sunnah: false },
    isha: { name: "Isha", nameAr: "العشاء", completed: false, time: "08:00 PM", sunnah: false }
  },
  spiritual: {
    quranPage: 1,
    quranTotal: 604,
    currentSurah: "Al-Fatihah (الفَاتِحَة)",
    dailyTargetPages: 4,
    pagesReadToday: 0,
    qiyamCompleted: false,
    qiyamRakaat: 0,
    qiyamNotes: "",
    morningAdhkar: false,
    eveningAdhkar: false,
    waterGlasses: 0, // Out of 8
    prayerStreak: 0
  },
  contentVideos: [],
  study: {
    todayHoursTarget: 4.0,
    todayHoursLogged: 0.0,
    streakDays: 0,
    subjects: [],
    notes: ""
  },
  projects: [],
  weeklyHistory: [
    { day: "Mon", tasks: 0, prayers: 0, quran: 0, studyHrs: 0, score: 0 },
    { day: "Tue", tasks: 0, prayers: 0, quran: 0, studyHrs: 0, score: 0 },
    { day: "Wed", tasks: 0, prayers: 0, quran: 0, studyHrs: 0, score: 0 },
    { day: "Thu", tasks: 0, prayers: 0, quran: 0, studyHrs: 0, score: 0 },
    { day: "Fri", tasks: 0, prayers: 0, quran: 0, studyHrs: 0, score: 0 },
    { day: "Sat", tasks: 0, prayers: 0, quran: 0, studyHrs: 0, score: 0 },
    { day: "Sun", tasks: 0, prayers: 0, quran: 0, studyHrs: 0, score: 0 }
  ]
};

// ==========================================
// 2. STATE MANAGER & PERSISTENCE
// ==========================================
class StateManager {
  constructor() {
    this.storageKey = "BLOOM_OS_DATA_V1";
    this.data = this.loadState();
    this.checkDailyReset();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn("Using default clean state", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {}
    renderApp();
  }

  checkDailyReset() {
    const today = new Date().toISOString().split('T')[0];
    if (this.data.lastActiveDate !== today) {
      this.performMidnightReset(today);
    }
  }

  performMidnightReset(newDateStr) {
    console.log("🌸 [BLOOM-OS] Midnight Rollover Activated:", newDateStr);

    if (this.data.prayers) {
      Object.keys(this.data.prayers).forEach(k => {
        this.data.prayers[k].completed = false;
        this.data.prayers[k].sunnah = false;
      });
    }

    if (this.data.spiritual) {
      this.data.spiritual.qiyamCompleted = false;
      this.data.spiritual.pagesReadToday = 0;
      this.data.spiritual.morningAdhkar = false;
      this.data.spiritual.eveningAdhkar = false;
      this.data.spiritual.waterGlasses = 0;
    }

    if (this.data.study) {
      this.data.study.todayHoursLogged = 0.0;
      if (Array.isArray(this.data.study.subjects)) {
        this.data.study.subjects.forEach(s => {
          s.loggedHours = 0.0;
          s.progress = 0;
        });
      }
    }

    if (Array.isArray(this.data.tasks)) {
      this.data.tasks.forEach(t => {
        const tag = (t.tag || "").toLowerCase();
        if (tag.includes("daily") || tag.includes("self-care") || t.date === "Today") {
          t.completed = false;
        }
      });
    }

    this.data.lastActiveDate = newDateStr;
    this.save();

    showToast(
      "🌙 12:00 AM MIDNIGHT PROTOCOL",
      "New day started! Prayers, hydration, and daily self-care habits have refreshed for your new day. 🌸"
    );
    AudioFX.playBell();
  }
}

const AppState = new StateManager();

// ==========================================
// 3. FAIRY SOUND EFFECTS (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime() {
    if (!AppState.data.profile.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Soft fairy sparkle chord (C6, E6, G6, B6)
      [1046.50, 1318.51, 1567.98, 1975.53].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.08, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.35);
      });
    } catch (e) {}
  }

  playClick() {
    if (!AppState.data.profile.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  playBell() {
    if (!AppState.data.profile.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [528, 792, 1056].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.1, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.6);
      });
    } catch (e) {}
  }
}

const AudioFX = new SoundFX();

// ==========================================
// 4. FAIRY DUST / SAKURA CANVAS PARTICLES
// ==========================================
class FairyDustCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.numParticles = 45;
    this.mouse = { x: null, y: null };

    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 0.4 + 0.2, // drifting softly downwards
        radius: Math.random() * 2.5 + 1,
        color: Math.random() > 0.5 ? "#f472b6" : Math.random() > 0.5 ? "#c084fc" : "#fbbf24",
        pulse: Math.random() * Math.PI
      });
    }
  }

  animate() {
    if (!AppState.data.profile.particlesEnabled) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      requestAnimationFrame(() => this.animate());
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y > this.canvas.height) p.y = 0;

      const alpha = Math.sin(p.pulse) * 0.35 + 0.65;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================
// 5. COZY POMODORO ENGINE
// ==========================================
class PomodoroEngine {
  constructor() {
    this.workMinutes = 25;
    this.shortBreakMinutes = 5;
    this.longBreakMinutes = 15;
    this.mode = "work";
    this.totalSeconds = this.workMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.isRunning = false;
    this.timerId = null;
  }

  setMode(mode) {
    this.pause();
    this.mode = mode;
    if (mode === "work") this.totalSeconds = this.workMinutes * 60;
    if (mode === "shortBreak") this.totalSeconds = this.shortBreakMinutes * 60;
    if (mode === "longBreak") this.totalSeconds = this.longBreakMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
  }

  start() {
    if (this.isRunning) return;
    AudioFX.playClick();
    this.isRunning = true;
    this.timerId = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplay();
      if (this.remainingSeconds <= 0) this.onFinish();
    }, 1000);
    this.updateControls();
  }

  pause() {
    if (!this.isRunning) return;
    AudioFX.playClick();
    this.isRunning = false;
    clearInterval(this.timerId);
    this.timerId = null;
    this.updateControls();
  }

  reset() {
    AudioFX.playClick();
    this.pause();
    this.setMode(this.mode);
  }

  onFinish() {
    this.pause();
    AudioFX.playBell();
    if (this.mode === "work") {
      AppState.data.study.todayHoursLogged += 0.42;
      AppState.save();
      showToast("🌸 Focus Session Complete!", "You did amazing! Take 5 minutes to stretch, drink water, and breathe.");
      this.setMode("shortBreak");
    } else {
      showToast("✨ Ready to Bloom?", "Break is over. Let's step back into cozy focus.");
      this.setMode("work");
    }
  }

  updateDisplay() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    const el = document.getElementById("pomoDisplay");
    if (el) el.textContent = formatted;
  }

  updateControls() {
    const startBtn = document.getElementById("pomoStartBtn");
    if (startBtn) {
      startBtn.textContent = this.isRunning ? "Pause" : "Start Focus";
      startBtn.className = this.isRunning ? "btn btn-secondary" : "btn btn-pink";
    }
  }
}

const Pomodoro = new PomodoroEngine();

// ==========================================
// 6. RENDER LOGIC
// ==========================================
function renderApp() {
  const d = AppState.data;

  // Nav Badges
  const activeTasks = d.tasks.filter(t => !t.completed).length;
  const navTasks = document.getElementById("navTasksBadge");
  if (navTasks) navTasks.textContent = activeTasks;

  const prayersDone = Object.values(d.prayers).filter(p => p.completed).length;
  const navPrayer = document.getElementById("navPrayerBadge");
  if (navPrayer) navPrayer.textContent = `${prayersDone}/5`;

  const navProjects = document.getElementById("navProjectsBadge");
  if (navProjects) navProjects.textContent = d.projects.length;

  // Render Modules
  renderDailyHQ();
  renderSpiritualHQ();
  renderContentStudio();
  renderStudyHub();
  renderProjectsMatrix();
  renderAnalytics();

  // Toggles
  const soundBtn = document.getElementById("soundToggleBtn");
  if (soundBtn) {
    soundBtn.innerHTML = d.profile.soundEnabled ? "🌸 Sound ON" : "🔇 Sound OFF";
    soundBtn.style.color = d.profile.soundEnabled ? "var(--bloom-pink)" : "var(--text-dim)";
  }
}

function renderDailyHQ() {
  const d = AppState.data;

  // Calculation
  const totalTasks = d.tasks.length;
  const doneTasks = d.tasks.filter(t => t.completed).length;
  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const prayersDone = Object.values(d.prayers).filter(p => p.completed).length;
  const prayerPct = Math.round((prayersDone / 5) * 100);

  const overall = Math.round((taskPct * 0.5) + (prayerPct * 0.3) + ((d.study.todayHoursLogged / d.study.todayHoursTarget) * 20));
  const score = Math.min(100, overall);

  const scoreEl = document.getElementById("statDailyScore");
  if (scoreEl) scoreEl.textContent = `${score}%`;

  const fillEl = document.getElementById("statDailyScoreFill");
  if (fillEl) fillEl.style.width = `${score}%`;

  const prayerEl = document.getElementById("statPrayers");
  if (prayerEl) prayerEl.textContent = `${prayersDone}/5`;

  const studyEl = document.getElementById("statStudyHours");
  if (studyEl) studyEl.textContent = `${d.study.todayHoursLogged.toFixed(1)} / ${d.study.todayHoursTarget}h`;

  // Water Cups
  const waterContainer = document.getElementById("waterCupsGrid");
  if (waterContainer) {
    waterContainer.innerHTML = "";
    for (let i = 1; i <= 8; i++) {
      const isFilled = i <= d.spiritual.waterGlasses;
      const cup = document.createElement("div");
      cup.className = `water-cup ${isFilled ? "filled" : ""}`;
      cup.innerHTML = `<span>💧</span><span style="font-size:0.65rem; color:${isFilled ? 'var(--bloom-sky)' : 'var(--text-dim)'};">${i}</span>`;
      cup.onclick = () => setWaterGlasses(i);
      waterContainer.appendChild(cup);
    }
  }

  // Tasks list
  const container = document.getElementById("dailyTasksList");
  if (container) {
    container.innerHTML = "";
    if (d.tasks.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 2.5rem 1rem; color: var(--text-dim);">
          <div style="font-size:2rem; margin-bottom:0.4rem;">🌸</div>
          <div style="font-weight:600; color:#fff; margin-bottom:0.25rem;">Your daily board is clear & calm</div>
          <div style="font-size:0.8rem; margin-bottom:1rem;">Add what matters most to your day with gentle intention.</div>
          <button class="btn btn-sm btn-pink" onclick="openModal('modalNewTask')">+ Add First Task</button>
        </div>
      `;
    } else {
      d.tasks.forEach(task => {
        const badgeClass = task.priority === "P0" ? "badge-high" : task.priority === "P1" ? "badge-standard" : "badge-selfcare";
        const div = document.createElement("div");
        div.className = `task-item ${task.completed ? "completed" : ""}`;
        div.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.8rem; flex:1;">
            <div class="custom-checkbox" onclick="toggleTask('${task.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div><div class="task-title">${escapeHtml(task.title)}</div></div>
          </div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <span class="badge ${badgeClass}">${task.priority === 'P0' ? '✨ HIGH' : task.priority === 'P1' ? '🌸 FOCUS' : '☕ SELF-CARE'}</span>
            <span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-muted);">#${escapeHtml(task.tag)}</span>
            <button class="task-del-btn" style="background:none; border:none; color:var(--text-dim); cursor:pointer; padding:0.2rem;" onclick="deleteTask('${task.id}')">✕</button>
          </div>
        `;
        container.appendChild(div);
      });
    }
  }

  // Active Projects Pulse
  const projPulse = document.getElementById("activeProjectsPulse");
  if (projPulse) {
    projPulse.innerHTML = "";
    if (d.projects.length === 0) {
      projPulse.innerHTML = `
        <div style="text-align:center; padding: 1.5rem; color: var(--text-dim); font-size:0.8rem;">
          <div style="font-size:1.5rem; margin-bottom:0.3rem;">🌷</div>
          No active projects yet.<br>
          <button class="btn btn-sm btn-secondary" style="margin-top:0.6rem;" onclick="openModal('modalNewProject')">+ Add Project</button>
        </div>
      `;
    } else {
      d.projects.slice(0, 2).forEach(p => {
        const div = document.createElement("div");
        div.style.cssText = "background:rgba(255,255,255,0.02); padding:0.75rem; border-radius:10px; border:1px solid var(--border-subtle);";
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <span style="font-weight:700; font-size:0.88rem; color:#fff;">${escapeHtml(p.title)}</span>
            <span class="badge badge-high">${p.progress}%</span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.4rem;">${escapeHtml(p.description || "Active Goal")}</div>
          <div class="progress-container"><div class="progress-bar-fill progress-fill-pink" style="width: ${p.progress}%;"></div></div>
        `;
        projPulse.appendChild(div);
      });
    }
  }

  // Creator Studio Pulse
  const creatorPulse = document.getElementById("creatorStudioPulse");
  if (creatorPulse) {
    creatorPulse.innerHTML = "";
    if (d.contentVideos.length === 0) {
      creatorPulse.innerHTML = `
        <div style="text-align:center; padding: 1.5rem; color: var(--text-dim); font-size:0.8rem;">
          <div style="font-size:1.5rem; margin-bottom:0.3rem;">🎬</div>
          No content in pipeline yet.<br>
          <button class="btn btn-sm btn-secondary" style="margin-top:0.6rem;" onclick="openModal('modalNewVideo')">+ New Video Idea</button>
        </div>
      `;
    } else {
      d.contentVideos.slice(0, 2).forEach(v => {
        const div = document.createElement("div");
        div.style.cssText = "background:rgba(255,255,255,0.02); padding:0.75rem; border-radius:10px; border:1px solid var(--border-subtle);";
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <span style="font-weight:600; font-size:0.85rem; color:#fff;">${escapeHtml(v.title)}</span>
            <span class="badge badge-standard">${v.platform}</span>
          </div>
          <div style="font-size:0.72rem; color:var(--bloom-pink); font-family:var(--font-mono); text-transform:uppercase;">Stage: ${v.stage}</div>
        `;
        creatorPulse.appendChild(div);
      });
    }
  }
}

function renderSpiritualHQ() {
  const d = AppState.data;

  // Prayers
  const prayersContainer = document.getElementById("prayersList");
  if (prayersContainer) {
    prayersContainer.innerHTML = "";
    Object.entries(d.prayers).forEach(([key, p]) => {
      const div = document.createElement("div");
      div.className = `prayer-card ${p.completed ? "completed" : ""}`;
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <div>
            <div style="font-weight:700; font-size:0.95rem; color:#fff;">${p.name}</div>
            <div style="font-size:0.78rem; color:var(--text-dim);">${p.nameAr}</div>
          </div>
          <button class="prayer-check-btn" onclick="togglePrayer('${key}')" title="Toggle Prayer">
            ${p.completed ? "✓" : ""}
          </button>
        </div>
        <div style="font-size:0.72rem; color:var(--text-dim); font-family:var(--font-mono); width:100%; text-align:left;">
          Time: ${p.time}
        </div>
      `;
      prayersContainer.appendChild(div);
    });
  }

  // Quran
  const quranPct = Math.round((d.spiritual.quranPage / d.spiritual.quranTotal) * 100);
  const pctEl = document.getElementById("quranPercent");
  if (pctEl) pctEl.textContent = `${quranPct}%`;

  const fillEl = document.getElementById("quranProgressFill");
  if (fillEl) fillEl.style.width = `${quranPct}%`;

  const pageEl = document.getElementById("quranCurrentPage");
  if (pageEl) pageEl.textContent = `${d.spiritual.quranPage} / ${d.spiritual.quranTotal}`;

  const surahEl = document.getElementById("quranSurahName");
  if (surahEl) surahEl.textContent = d.spiritual.currentSurah;

  // Adhkar Checkboxes
  const morningCheck = document.getElementById("morningAdhkarCheck");
  if (morningCheck) {
    if (d.spiritual.morningAdhkar) morningCheck.classList.add("completed");
    else morningCheck.classList.remove("completed");
  }

  const eveningCheck = document.getElementById("eveningAdhkarCheck");
  if (eveningCheck) {
    if (d.spiritual.eveningAdhkar) eveningCheck.classList.add("completed");
    else eveningCheck.classList.remove("completed");
  }

  // Qiyam
  const qiyamCheck = document.getElementById("qiyamCheckbox");
  if (qiyamCheck) {
    if (d.spiritual.qiyamCompleted) qiyamCheck.classList.add("completed");
    else qiyamCheck.classList.remove("completed");
  }
}

function renderContentStudio() {
  const d = AppState.data;
  const stages = ["scripting", "recording", "editing", "published"];

  stages.forEach(stage => {
    const col = document.getElementById(`kanbanCol_${stage}`);
    if (!col) return;
    col.innerHTML = "";

    const videos = d.contentVideos.filter(v => v.stage === stage);
    if (videos.length === 0) {
      col.innerHTML = `<div style="text-align:center; padding: 2rem 0.5rem; color: var(--text-dim); font-size:0.75rem;">No cards yet</div>`;
      return;
    }

    videos.forEach(v => {
      const card = document.createElement("div");
      card.style.cssText = "background:rgba(28,22,42,0.85); border:1px solid var(--border-subtle); border-radius:12px; padding:0.85rem; display:flex; flex-direction:column; gap:0.45rem; cursor:pointer;";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.7rem; font-weight:700; color:var(--bloom-pink); font-family:var(--font-mono);">${v.platform}</span>
          <span style="font-size:0.68rem; color:var(--text-dim);">${v.duration}</span>
        </div>
        <div style="font-size:0.88rem; font-weight:600; color:#fff;">${escapeHtml(v.title)}</div>
        <div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">"${escapeHtml(v.hook)}"</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
          <span class="badge" style="background:rgba(255,255,255,0.06); font-size:0.65rem;">#${escapeHtml(v.tags[0] || 'Aesthetic')}</span>
          <div style="display:flex; gap:0.35rem;">
            <button class="btn btn-sm btn-secondary" style="padding:0.2rem 0.45rem;" onclick="moveVideoStage('${v.id}')">➔</button>
            <button class="btn btn-sm btn-secondary" style="padding:0.2rem 0.45rem;" onclick="deleteVideo('${v.id}')">✕</button>
          </div>
        </div>
      `;
      col.appendChild(card);
    });
  });
}

function renderStudyHub() {
  const d = AppState.data;
  const container = document.getElementById("studySubjectsList");
  if (container) {
    container.innerHTML = "";
    if (d.study.subjects.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 2.5rem 1rem; background:rgba(255,255,255,0.02); border:1px dashed var(--border-subtle); border-radius:14px;">
          <div style="font-size:2rem; margin-bottom:0.4rem;">📚</div>
          <div style="font-weight:700; color:#fff; font-size:0.95rem; margin-bottom:0.25rem;">No Study Subjects Yet</div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:1rem;">Add the subjects, courses, or books you want to study.</div>
          <button class="btn btn-sm btn-lavender" onclick="openModal('modalNewSubject')">+ Add Study Subject</button>
        </div>
      `;
    } else {
      d.study.subjects.forEach(sub => {
        const div = document.createElement("div");
        div.className = "bloom-card";
        div.style.marginBottom = "0.75rem";
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span style="font-weight:700; font-size:0.9rem; color:#fff;">${escapeHtml(sub.name)}</span>
            <span style="font-size:0.78rem; font-family:var(--font-mono); color:var(--bloom-lavender);">${sub.loggedHours}h / ${sub.targetHours}h</span>
          </div>
          <div class="progress-container" style="height:6px; margin-bottom:0.6rem;">
            <div class="progress-bar-fill progress-fill-lavender" style="width: ${sub.progress}%;"></div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn btn-sm btn-secondary" onclick="addStudyHour('${sub.id}', 0.5)">+30 min</button>
            <button class="btn btn-sm btn-lavender" onclick="addStudyHour('${sub.id}', 1.0)">+1 hour</button>
            <button class="btn btn-sm btn-secondary" onclick="deleteSubject('${sub.id}')">✕</button>
          </div>
        `;
        container.appendChild(div);
      });
    }
  }

  const studyNotes = document.getElementById("studyNotesDisplay");
  if (studyNotes && document.activeElement !== studyNotes) {
    studyNotes.value = d.study.notes || "";
  }
}

function renderProjectsMatrix() {
  const d = AppState.data;
  const container = document.getElementById("projectsList");
  if (!container) return;

  container.innerHTML = "";
  if (d.projects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 3.5rem 1.5rem; background:rgba(255,255,255,0.02); border:1px dashed var(--border-subtle); border-radius:16px;">
        <div style="font-size:2.5rem; margin-bottom:0.5rem;">🌷</div>
        <div style="font-weight:700; color:#fff; font-size:1.1rem; margin-bottom:0.35rem;">Goals & Projects Board Ready</div>
        <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1.25rem;">No projects recorded yet. Click below to add your first aesthetic project or venture.</div>
        <button class="btn btn-pink" onclick="openModal('modalNewProject')">+ Initialize First Project</button>
      </div>
    `;
    return;
  }

  d.projects.forEach(proj => {
    const card = document.createElement("div");
    card.className = "bloom-card";
    card.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <span class="badge badge-high">${proj.priority} Priority</span>
          <span style="font-size:0.72rem; color:var(--bloom-gold); font-family:var(--font-mono);">${proj.status}</span>
        </div>
        <div style="font-size:1.05rem; font-weight:700; color:#fff; margin-bottom:0.25rem;">${escapeHtml(proj.title)}</div>
        <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1rem;">${escapeHtml(proj.description)}</div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-family:var(--font-mono); margin-bottom:0.35rem;">
          <span style="color:var(--text-dim);">Due: ${proj.deadline}</span>
          <span style="color:#fff; font-weight:700;">${proj.progress}%</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar-fill progress-fill-pink" style="width: ${proj.progress}%;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:0.85rem; align-items:center;">
          <button class="btn btn-sm btn-secondary" onclick="updateProjectProgress('${proj.id}', -10)">-10%</button>
          <button class="btn btn-sm btn-pink" onclick="updateProjectProgress('${proj.id}', 10)">+10%</button>
          <button class="btn btn-sm btn-secondary" onclick="deleteProject('${proj.id}')">✕</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAnalytics() {
  const d = AppState.data;
  const heatmap = document.getElementById("analyticsHeatmap");
  if (heatmap) {
    heatmap.innerHTML = "";
    d.weeklyHistory.forEach(h => {
      const cell = document.createElement("div");
      cell.style.cssText = "background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:0.72rem; font-family:var(--font-mono);";
      if (h.score > 0) {
        cell.style.background = "rgba(244,114,182,0.25)";
        cell.style.borderColor = "var(--bloom-pink)";
        cell.style.color = "#fff";
      } else {
        cell.style.color = "var(--text-dim)";
      }
      cell.innerHTML = `<span>${h.day}</span><span style="font-weight:700;">${h.score}%</span>`;
      heatmap.appendChild(cell);
    });
  }
}

// ==========================================
// 7. USER ACTIONS
// ==========================================
function switchView(viewId, element) {
  AudioFX.playClick();
  document.querySelectorAll(".view-section").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add("active");
  if (element) element.classList.add("active");

  const breadcrumb = document.getElementById("currentBreadcrumb");
  if (breadcrumb) {
    const titles = {
      "daily-hq": "Daily Bloom // Command Center",
      "deen-hq": "Spiritual Sanctuary // Prayers & Inner Peace",
      "content-studio": "Aesthetic Studio // TikTok & Reels",
      "study-hub": "Cozy Study Lounge // Lo-Fi & Pomodoro",
      "projects-matrix": "Goals Matrix // Projects & Ventures",
      "analytics-view": "Self-Care Telemetry // Habits & Analytics"
    };
    breadcrumb.textContent = titles[viewId] || "Dashboard";
  }
}

function toggleSidebar() {
  AudioFX.playClick();
  const sidebar = document.getElementById("appSidebar");
  if (sidebar) sidebar.classList.toggle("collapsed");
}

function toggleSound() {
  AppState.data.profile.soundEnabled = !AppState.data.profile.soundEnabled;
  AppState.save();
  if (AppState.data.profile.soundEnabled) AudioFX.playChime();
}

function toggleParticles() {
  AudioFX.playClick();
  AppState.data.profile.particlesEnabled = !AppState.data.profile.particlesEnabled;
  AppState.save();
}

function toggleTask(taskId) {
  const task = AppState.data.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    if (task.completed) AudioFX.playChime();
    else AudioFX.playClick();
    AppState.save();
  }
}

function deleteTask(taskId) {
  AudioFX.playClick();
  AppState.data.tasks = AppState.data.tasks.filter(t => t.id !== taskId);
  AppState.save();
}

function togglePrayer(key) {
  const p = AppState.data.prayers[key];
  if (p) {
    p.completed = !p.completed;
    if (p.completed) AudioFX.playChime();
    else AudioFX.playClick();
    AppState.save();
  }
}

function setWaterGlasses(count) {
  AudioFX.playChime();
  if (AppState.data.spiritual.waterGlasses === count) {
    AppState.data.spiritual.waterGlasses = count - 1;
  } else {
    AppState.data.spiritual.waterGlasses = count;
  }
  AppState.save();
}

function toggleAdhkar(type) {
  AudioFX.playChime();
  if (type === 'morning') AppState.data.spiritual.morningAdhkar = !AppState.data.spiritual.morningAdhkar;
  if (type === 'evening') AppState.data.spiritual.eveningAdhkar = !AppState.data.spiritual.eveningAdhkar;
  AppState.save();
}

function toggleQiyam() {
  AudioFX.playChime();
  AppState.data.spiritual.qiyamCompleted = !AppState.data.spiritual.qiyamCompleted;
  AppState.save();
}

function incrementQuran(delta) {
  AudioFX.playClick();
  AppState.data.spiritual.quranPage = Math.min(604, Math.max(1, AppState.data.spiritual.quranPage + delta));
  AppState.data.spiritual.pagesReadToday = Math.max(0, AppState.data.spiritual.pagesReadToday + delta);
  AppState.save();
}

function promptSetQuranPage() {
  const input = prompt("📖 Enter your current Quran page number (1 - 604):", AppState.data.spiritual.quranPage);
  if (input !== null) {
    const p = parseInt(input, 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      AppState.data.spiritual.quranPage = p;
      AudioFX.playChime();
      AppState.save();
    }
  }
}

function promptSetSurahName() {
  const name = prompt("📖 Enter current Surah name:", AppState.data.spiritual.currentSurah);
  if (name && name.trim()) {
    AppState.data.spiritual.currentSurah = name.trim();
    AudioFX.playClick();
    AppState.save();
  }
}

function updateStudyNotes(val) {
  AppState.data.study.notes = val;
  try {
    localStorage.setItem(AppState.storageKey, JSON.stringify(AppState.data));
  } catch (e) {}
}

function addStudyHour(id, delta) {
  AudioFX.playClick();
  const sub = AppState.data.study.subjects.find(s => s.id === id);
  if (sub) {
    sub.loggedHours = Math.round((sub.loggedHours + delta) * 10) / 10;
    sub.progress = Math.min(100, Math.round((sub.loggedHours / sub.targetHours) * 100));
    AppState.data.study.todayHoursLogged = Math.round((AppState.data.study.todayHoursLogged + delta) * 10) / 10;
    AppState.save();
  }
}

function deleteSubject(id) {
  AudioFX.playClick();
  AppState.data.study.subjects = AppState.data.study.subjects.filter(s => s.id !== id);
  AppState.save();
}

function moveVideoStage(id) {
  AudioFX.playClick();
  const stages = ["scripting", "recording", "editing", "published"];
  const v = AppState.data.contentVideos.find(x => x.id === id);
  if (v) {
    const idx = stages.indexOf(v.stage);
    v.stage = idx < stages.length - 1 ? stages[idx + 1] : stages[0];
    AppState.save();
  }
}

function deleteVideo(id) {
  AudioFX.playClick();
  AppState.data.contentVideos = AppState.data.contentVideos.filter(v => v.id !== id);
  AppState.save();
}

function updateProjectProgress(id, delta) {
  AudioFX.playClick();
  const p = AppState.data.projects.find(x => x.id === id);
  if (p) {
    p.progress = Math.min(100, Math.max(0, p.progress + delta));
    p.status = p.progress === 100 ? "Completed" : p.progress > 0 ? "In Progress" : "Planning";
    AppState.save();
  }
}

function deleteProject(id) {
  AudioFX.playClick();
  AppState.data.projects = AppState.data.projects.filter(p => p.id !== id);
  AppState.save();
}

// ==========================================
// 8. MODAL SUBMISSIONS
// ==========================================
function openModal(id) {
  AudioFX.playClick();
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function closeModal(id) {
  AudioFX.playClick();
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

function submitNewTask(e) {
  e.preventDefault();
  const title = document.getElementById("taskInputTitle").value.trim();
  const priority = document.getElementById("taskInputPriority").value;
  const tag = document.getElementById("taskInputTag").value.trim() || "Daily";

  if (!title) return;
  AppState.data.tasks.unshift({
    id: "t_" + Date.now(),
    title,
    priority,
    tag,
    completed: false,
    date: "Today"
  });

  document.getElementById("taskInputTitle").value = "";
  closeModal("modalNewTask");
  AudioFX.playChime();
  AppState.save();
}

function submitNewProject(e) {
  e.preventDefault();
  const title = document.getElementById("projInputTitle").value.trim();
  const priority = document.getElementById("projInputPriority").value;
  const desc = document.getElementById("projInputDesc").value.trim();
  const deadline = document.getElementById("projInputDeadline").value || "2026-11-15";

  if (!title) return;
  AppState.data.projects.unshift({
    id: "p_" + Date.now(),
    title,
    priority,
    status: "In Progress",
    progress: 10,
    description: desc,
    deadline
  });

  document.getElementById("projInputTitle").value = "";
  document.getElementById("projInputDesc").value = "";
  closeModal("modalNewProject");
  AudioFX.playChime();
  AppState.save();
}

function submitNewVideo(e) {
  e.preventDefault();
  const title = document.getElementById("vidInputTitle").value.trim();
  const platform = document.getElementById("vidInputPlatform").value;
  const hook = document.getElementById("vidInputHook").value.trim();
  const duration = document.getElementById("vidInputDuration").value.trim() || "60s";

  if (!title) return;
  AppState.data.contentVideos.unshift({
    id: "v_" + Date.now(),
    title,
    platform,
    stage: "scripting",
    hook,
    duration,
    tags: ["Aesthetic", "Vlog"]
  });

  document.getElementById("vidInputTitle").value = "";
  document.getElementById("vidInputHook").value = "";
  closeModal("modalNewVideo");
  AudioFX.playChime();
  AppState.save();
}

function submitNewSubject(e) {
  e.preventDefault();
  const name = document.getElementById("subInputName").value.trim();
  const target = parseFloat(document.getElementById("subInputTarget").value) || 2.0;

  if (!name) return;
  AppState.data.study.subjects.push({
    id: "s_" + Date.now(),
    name,
    targetHours: target,
    loggedHours: 0.0,
    progress: 0
  });

  document.getElementById("subInputName").value = "";
  closeModal("modalNewSubject");
  AudioFX.playChime();
  AppState.save();
}

// ==========================================
// 9. BACKUP, EXPORT & CLOCK
// ==========================================
function updateLiveClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

  const options = { weekday: "short", month: "short", day: "2-digit" };
  const formattedDate = now.toLocaleDateString("en-US", options).toUpperCase();

  const timeEl = document.getElementById("hudLiveTime");
  if (timeEl) timeEl.textContent = formattedTime;

  const dateEl = document.getElementById("hudLiveDate");
  if (dateEl) dateEl.textContent = formattedDate;

  const todayStr = now.toISOString().split("T")[0];
  if (AppState.data.lastActiveDate !== todayStr) {
    AppState.performMidnightReset(todayStr);
  }
}

function showToast(title, message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "bloom-toast";
  toast.innerHTML = `
    <div style="font-size:1.8rem; line-height:1;">🌸</div>
    <div style="flex:1;">
      <div style="font-size:0.88rem; font-weight:700; color:var(--bloom-pink); margin-bottom:0.2rem;">${title}</div>
      <div style="font-size:0.78rem; color:var(--text-main); line-height:1.4;">${message}</div>
    </div>
    <button style="background:none; border:none; color:var(--text-dim); font-size:1.1rem; cursor:pointer;" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 7000);
}

function testMidnightResetPrompt() {
  if (confirm("🌸 Test 12:00 AM Midnight Rollover?\n\nThis simulates midnight passing: it resets prayers, water glasses (0/8), adhkar, and study hours for a fresh start.")) {
    const today = new Date().toISOString().split("T")[0];
    AppState.performMidnightReset(today);
  }
}

function exportJSONBackup() {
  AudioFX.playBell();
  const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState.data, null, 2));
  const a = document.createElement("a");
  a.setAttribute("href", str);
  a.setAttribute("download", `bloom_os_backup_${new Date().toISOString().split('T')[0]}.json`);
  a.click();
  alert("🌸 Full aesthetic backup exported successfully as JSON!");
}

function importJSONBackup(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (parsed) {
        AppState.data = { ...DEFAULT_STATE, ...parsed };
        AppState.save();
        AudioFX.playChime();
        alert("🌸 Backup restored successfully!");
      }
    } catch (err) {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
}

function exportToNotionMarkdown() {
  AudioFX.playBell();
  const d = AppState.data;
  let md = `# 🌸 BLOOM // AESTHETIC LIFE OS\n\n`;
  md += `> *"You don’t have to chase what is already aligned with you. Stay calm, stay faithful, and bloom."*\n\n`;
  md += `--- \n\n`;

  md += `## 🌸 Daily Bloom Tasks\n\n`;
  d.tasks.forEach(t => {
    md += `- [${t.completed ? "x" : " "}] **[${t.priority}]** ${t.title} \`#${t.tag}\`\n`;
  });

  md += `\n## 🕌 Spiritual Sanctuary & Habits\n\n`;
  Object.values(d.prayers).forEach(p => {
    md += `- [${p.completed ? "x" : " "}] **${p.name}** (${p.nameAr}) - ${p.time}\n`;
  });
  md += `- [x] **Quran Khatma**: Page ${d.spiritual.quranPage} / ${d.spiritual.quranTotal} (${d.spiritual.currentSurah})\n`;
  md += `- [${d.spiritual.morningAdhkar ? "x" : " "}] **Morning Adhkar** (أذكار الصباح)\n`;
  md += `- [${d.spiritual.eveningAdhkar ? "x" : " "}] **Evening Adhkar** (أذكار المساء)\n`;
  md += `- [${d.spiritual.qiyamCompleted ? "x" : " "}] **Qiyam al-Layl & Tahajjud**\n`;
  md += `- **Hydration**: ${d.spiritual.waterGlasses} / 8 Glasses\n`;

  md += `\n## 🎬 Aesthetic Creator Studio\n\n`;
  md += `| Platform | Video Title | Stage | Hook | Duration |\n|---|---|---|---|---|\n`;
  d.contentVideos.forEach(v => {
    md += `| ${v.platform} | ${v.title} | ${v.stage} | ${v.hook} | ${v.duration} |\n`;
  });

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Bloom_Notion_OS_${new Date().toISOString().split("T")[0]}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function resetAllDataPrompt() {
  if (confirm("⚠️ Reset all data to clean fresh state?")) {
    AppState.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    AppState.save();
    AudioFX.playBell();
    alert("🌸 Workspace refreshed completely!");
  }
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, function(m) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
  });
}

// ==========================================
// 10. INITIALIZATION
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  new FairyDustCanvas("fairyCanvas");
  Pomodoro.updateDisplay();
  renderApp();

  updateLiveClock();
  setInterval(updateLiveClock, 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateLiveClock();
  });

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openModal("modalNewTask");
    }
  });
});
