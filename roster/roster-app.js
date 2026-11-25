const ROSTER_I18N = {
  vi: {
    pageTitle: "CTEC Workspace - Roster Report",
    homeTitle: "Về trang chủ CTEC",
    syncTitle: "Đồng bộ dữ liệu mới nhất",
    refreshFull: "Làm mới dữ liệu",
    refreshShort: "ĐỒNG BỘ",
    copyFull: "Sao chép cho Google Sheets",
    copyMobile: "Sao chép",
    copyShort: "CHÉP",
    csvFull: "Xuất CSV",
    csvMobile: "CSV",
    csvShort: "CSV",
    quickSearchLabel: "Tìm kiếm nhanh",
    searchPlaceholder: "Tìm theo tên thành viên...",
    filterDeptLabel: "Lọc theo ban:",
    wheelHint: "Kéo hoặc cuộn",
    wheelDone: "Xong",
    chartTitle: "Phân bổ nhân sự & Thống kê theo ban",
    chartHint: "Chọn một ban để lọc",
    headcountLabel: "Quân số",
    deptExecShort: "Ban Chủ nhiệm",
    deptPrShort: "Truyền thông",
    deptDesignShort: "Thiết kế",
    deptContentShort: "Nội dung",
    deptHrShort: "Nhân sự",
    deptEventShort: "Đối ngoại",
    colNo: "STT",
    colName: "Họ và tên",
    colDept: "Ban",
    colRole: "Chức vụ",
    colStatus: "Trạng thái",
    loadingText: "Đang đồng bộ dữ liệu danh sách qua hệ thống CTEC...",
    errorTitle: "Không thể lấy dữ liệu danh sách!",
    errorDesc: "Vui lòng thử lại sau ít phút hoặc kiểm tra kết nối mạng.",
    noResultsText: "Không có thành viên nào khớp với từ khóa hoặc bộ lọc đã chọn.",
    footerText: "Báo cáo nhân sự chính thức CTEC | Thực hiện bởi Nhat Minh",
    allDeptsOption: "Tất cả các ban",
    copiedMsg: "Đã sao chép bảng danh sách! Dán (Ctrl + V) trực tiếp vào Google Sheets.",
    csvFile: "Danh_sach_thanh_vien_CTEC.csv",
    exportHeaders: ["STT", "Họ và tên", "Ban", "Chức vụ", "Trạng thái"],
    deptLabels: {
      "EXCUTIVE BOARD": "Ban Chủ nhiệm",
      "PUBLIC RELATIONS DEPARTMENT": "Ban Truyền thông",
      "DESIGN DEPARTMENT": "Ban Thiết kế",
      "CONTENT DEPARTMENT": "Ban Nội dung",
      "HUMAN RESOURCES DEPARTMENT": "Ban Nhân sự",
      "EVENT & EXTERNAL RELATIONS DEPARTMENT": "Ban Đối ngoại"
    },
    roleLabels: {
      "president": "Chủ tịch",
      "vice president": "Phó Chủ tịch",
      "head of department": "Trưởng ban",
      "deputy head of department": "Phó ban",
      "member": "Thành viên"
    },
    statusLabels: {
      "official": "Chính thức",
      "probationary": "Thử việc",
      "inactive": "Tạm nghỉ"
    }
  },
  en: {
    pageTitle: "CTEC Workspace - Roster Report",
    homeTitle: "Back to CTEC Home",
    syncTitle: "Sync latest directory records",
    refreshFull: "Refresh Data",
    refreshShort: "SYNC",
    copyFull: "Copy for Google Sheets",
    copyMobile: "Copy",
    copyShort: "COPY",
    csvFull: "Export CSV",
    csvMobile: "CSV",
    csvShort: "CSV",
    quickSearchLabel: "Quick Search",
    searchPlaceholder: "Search by member name...",
    filterDeptLabel: "Filter by Department:",
    wheelHint: "Drag or scroll",
    wheelDone: "Done",
    chartTitle: "Personnel Distribution & Dept Stats",
    chartHint: "Click a department to filter",
    headcountLabel: "Headcount",
    deptExecShort: "Executive Board",
    deptPrShort: "Public Relations",
    deptDesignShort: "Design",
    deptContentShort: "Content",
    deptHrShort: "Human Resources",
    deptEventShort: "External Relations",
    colNo: "No.",
    colName: "Full Name",
    colDept: "Department",
    colRole: "Role",
    colStatus: "Status",
    loadingText: "Synchronizing roster directory via CTEC system...",
    errorTitle: "Unable to retrieve roster data!",
    errorDesc: "Please try again in a moment or check your network connection.",
    noResultsText: "No members match your search query or selected filter.",
    footerText: "Official CTEC Personnel Report | Crafted by Nhat Minh",
    allDeptsOption: "All Departments",
    copiedMsg: "Roster table copied! Paste (Ctrl + V) directly into Google Sheets.",
    csvFile: "CTEC_Member_Roster.csv",
    exportHeaders: ["No.", "Name", "Department", "Role", "Status"],
    deptLabels: {
      "EXCUTIVE BOARD": "Executive Board",
      "PUBLIC RELATIONS DEPARTMENT": "Public Relations",
      "DESIGN DEPARTMENT": "Design",
      "CONTENT DEPARTMENT": "Content",
      "HUMAN RESOURCES DEPARTMENT": "Human Resources",
      "EVENT & EXTERNAL RELATIONS DEPARTMENT": "External Relations"
    },
    roleLabels: {
      "president": "President",
      "vice president": "Vice President",
      "head of department": "Head of Department",
      "deputy head of department": "Deputy Head of Department",
      "member": "Member"
    },
    statusLabels: {
      "official": "Official",
      "probationary": "Probationary",
      "inactive": "Inactive"
    }
  }
};

function getRosterDeptOptions(lang) {
  const t = ROSTER_I18N[lang] || ROSTER_I18N.vi;
  return [
    { value: "ALL", label: t.allDeptsOption },
    { value: "EXCUTIVE BOARD", label: t.deptLabels["EXCUTIVE BOARD"] },
    { value: "PUBLIC RELATIONS DEPARTMENT", label: t.deptLabels["PUBLIC RELATIONS DEPARTMENT"] },
    { value: "DESIGN DEPARTMENT", label: t.deptLabels["DESIGN DEPARTMENT"] },
    { value: "CONTENT DEPARTMENT", label: t.deptLabels["CONTENT DEPARTMENT"] },
    { value: "HUMAN RESOURCES DEPARTMENT", label: t.deptLabels["HUMAN RESOURCES DEPARTMENT"] },
    { value: "EVENT & EXTERNAL RELATIONS DEPARTMENT", label: t.deptLabels["EVENT & EXTERNAL RELATIONS DEPARTMENT"] }
  ];
}

function getDeptChartMeta(lang) {
  const t = ROSTER_I18N[lang] || ROSTER_I18N.vi;
  return [
    { key: "EXCUTIVE BOARD", label: t.deptLabels["EXCUTIVE BOARD"], color: "#4f46e5" },
    { key: "PUBLIC RELATIONS DEPARTMENT", label: t.deptLabels["PUBLIC RELATIONS DEPARTMENT"], color: "#0284c7" },
    { key: "DESIGN DEPARTMENT", label: t.deptLabels["DESIGN DEPARTMENT"], color: "#dc2626" },
    { key: "CONTENT DEPARTMENT", label: t.deptLabels["CONTENT DEPARTMENT"], color: "#d97706" },
    { key: "HUMAN RESOURCES DEPARTMENT", label: t.deptLabels["HUMAN RESOURCES DEPARTMENT"], color: "#059669" },
    { key: "EVENT & EXTERNAL RELATIONS DEPARTMENT", label: t.deptLabels["EVENT & EXTERNAL RELATIONS DEPARTMENT"], color: "#db2777" }
  ];
}

function translateRole(rawRole, lang) {
  const t = ROSTER_I18N[lang] || ROSTER_I18N.vi;
  const k = String(rawRole ?? "").trim().toLowerCase();
  return t.roleLabels[k] || rawRole;
}

function translateStatus(rawStatus, lang) {
  const t = ROSTER_I18N[lang] || ROSTER_I18N.vi;
  const k = String(rawStatus ?? "").trim().toLowerCase();
  return t.statusLabels[k] || rawStatus;
}

let rawMembers = [];
let currentFilter = "ALL";
let deptChartInstance = null;

function applyRosterStaticI18n(lang) {
  const t = ROSTER_I18N[lang] || ROSTER_I18N.vi;
  document.title = t.pageTitle;
  const homeLink = document.getElementById("homeLink");
  if (homeLink) homeLink.title = t.homeTitle;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (t[key] !== undefined) el.title = t[key];
  });

  CTEC.updateWheelOptions("deptWheelPicker", getRosterDeptOptions(lang), true);
}

async function loadMembers() {
  const reloadBtn = document.getElementById("reloadBtn");
  const reloadIcon = document.getElementById("reloadIcon");
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const noResults = document.getElementById("noResults");
  const tableBody = document.getElementById("tableBody");

  reloadBtn.disabled = true;
  reloadIcon.classList.add("fa-spin");
  tableBody.innerHTML = "";
  errorState.classList.add("hidden");
  noResults.classList.add("hidden");
  loadingState.classList.remove("hidden");

  try {
    const payload = await CTEC.fetchWorkerJson("/api/roster");
    const list = payload.rows || payload.members || payload.roster || payload.data;

    if (!Array.isArray(list)) {
      throw new Error(payload?.error || "Invalid D1 roster payload");
    }

    rawMembers = list.map(m => {
      const name = String(m.name ?? m.full_name ?? "").trim();
      const dept = String(m.dept || m.department || "").trim();
      const role = String(m.role ?? "").trim();
      const status = String(m.status ?? "Official").trim();
      return {
        name,
        nameLower: name.toLowerCase(),
        dept,
        deptKey: CTEC.normalizeDeptKey(dept),
        role,
        roleLower: role.toLowerCase(),
        status,
        statusLower: status.toLowerCase()
      };
    }).filter(m => m.name.length > 0);

    loadingState.classList.add("hidden");
    updateStats();
    renderTable();
  } catch (err) {
    console.error("D1 Roster synchronization error:", err);
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
  } finally {
    reloadBtn.disabled = false;
    reloadIcon.classList.remove("fa-spin");
  }
}

function updateStats() {
  const c = {
    "EXCUTIVE BOARD": 0,
    "PUBLIC RELATIONS DEPARTMENT": 0,
    "DESIGN DEPARTMENT": 0,
    "CONTENT DEPARTMENT": 0,
    "HUMAN RESOURCES DEPARTMENT": 0,
    "EVENT & EXTERNAL RELATIONS DEPARTMENT": 0
  };
  for (const m of rawMembers) if (c[m.deptKey] !== undefined) c[m.deptKey]++;

  const totalEl = document.getElementById("totalCount");
  if (totalEl) {
    // BUG-05 + Quy tắc đếm Trưởng/Phó ban kiêm nhiệm Ban Chủ nhiệm
    const count =
      window.CTEC && typeof window.CTEC.countMembersWithLeadOverlap === "function"
        ? window.CTEC.countMembersWithLeadOverlap(rawMembers)
        : rawMembers.length;
    totalEl.textContent = String(count);
  }

  document.getElementById("cntExec").textContent = c["EXCUTIVE BOARD"];
  document.getElementById("cntPr").textContent = c["PUBLIC RELATIONS DEPARTMENT"];
  document.getElementById("cntDesign").textContent = c["DESIGN DEPARTMENT"];
  document.getElementById("cntContent").textContent = c["CONTENT DEPARTMENT"];
  document.getElementById("cntHr").textContent = c["HUMAN RESOURCES DEPARTMENT"];
  document.getElementById("cntEvent").textContent = c["EVENT & EXTERNAL RELATIONS DEPARTMENT"];

  renderDeptChart(c);
}

function renderDeptChart(counts) {
  const canvas = document.getElementById("deptChart");
  if (!canvas || typeof Chart === "undefined") return;

  const lang = CTEC.getSavedLang();
  const meta = getDeptChartMeta(lang);
  const dataValues = meta.map(item => counts[item.key] || 0);
  const labels = meta.map(item => item.label);
  const colors = meta.map(item => item.color);
  const isDark = document.documentElement.classList.contains("dark");
  const borderColor = isDark ? "#0f172a" : "#ffffff";

  if (deptChartInstance) {
    deptChartInstance.data.labels = labels;
    deptChartInstance.data.datasets[0].data = dataValues;
    deptChartInstance.data.datasets[0].borderColor = borderColor;
    deptChartInstance.update();
    return;
  }

  deptChartInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: dataValues,
        backgroundColor: colors,
        borderColor,
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "66%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label(ctx) {
              const val = ctx.parsed || 0;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return lang === "en" ? ` ${val} members (${pct}%)` : ` ${val} thành viên (${pct}%)`;
            }
          }
        }
      },
      onClick(_, elements) {
        if (!elements || !elements.length) return;
        const clickedMeta = getDeptChartMeta(CTEC.getSavedLang())[elements[0].index];
        if (clickedMeta) {
          setFilter(currentFilter === clickedMeta.key ? "ALL" : clickedMeta.key);
        }
      }
    }
  });
}

function setFilter(dept) {
  currentFilter = dept;
  CTEC.setWheelValue("deptWheelPicker", dept);
  renderTable();
}

const getRoleHtml = (m, lang) => {
  const label = CTEC.escapeHtml(translateRole(m.role, lang));
  if (m.roleLower.includes("president") || m.roleLower.includes("chủ tịch")) {
    return `<span class="font-bold text-indigo-700">${label}</span>`;
  }
  if (m.roleLower.includes("head") || m.roleLower.includes("trưởng ban")) {
    return `<span class="font-semibold text-slate-900">${label}</span>`;
  }
  return `<span class="text-slate-600">${label}</span>`;
};

const getStatusHtml = (m, lang) => {
  const label = CTEC.escapeHtml(translateStatus(m.status, lang));
  const ok = m.statusLower.includes("official") || m.statusLower.includes("chính thức");
  const cls = ok
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}">${label}</span>`;
};

function renderTable() {
  const lang = CTEC.getSavedLang();
  const t = ROSTER_I18N[lang] || ROSTER_I18N.vi;
  const searchVal = document.getElementById("searchInput").value.toLowerCase().trim();
  const rows = [];
  let idx = 0;

  for (const m of rawMembers) {
    if (currentFilter !== "ALL" && m.deptKey !== currentFilter) continue;
    if (searchVal && !m.nameLower.includes(searchVal)) continue;

    idx++;
    const deptDisplay = t.deptLabels[m.deptKey] || m.dept;
    rows.push(
      `<tr class="hover:bg-slate-50 transition duration-150">` +
        `<td class="py-3.5 px-4 text-center text-xs font-semibold text-slate-400 border-r border-slate-100">${idx}</td>` +
        `<td class="py-3.5 px-6 font-semibold text-slate-800 border-r border-slate-100 whitespace-nowrap">${CTEC.escapeHtml(m.name)}</td>` +
        `<td class="py-3.5 px-6 border-r border-slate-100 whitespace-nowrap">${CTEC.renderDeptBadge(m.deptKey, deptDisplay)}</td>` +
        `<td class="py-3.5 px-6 text-center border-r border-slate-100 whitespace-nowrap">${getRoleHtml(m, lang)}</td>` +
        `<td class="py-3.5 px-6 text-center whitespace-nowrap">${getStatusHtml(m, lang)}</td>` +
      `</tr>`
    );
  }

  document.getElementById("noResults").classList.toggle("hidden", rows.length > 0);
  document.getElementById("tableBody").innerHTML = rows.join("");
}

const getExportRows = () => {
  const lang = CTEC.getSavedLang();
  const t = ROSTER_I18N[lang] || ROSTER_I18N.vi;
  return rawMembers.map((m, i) => [
    i + 1,
    m.name,
    t.deptLabels[m.deptKey] || m.dept,
    translateRole(m.role, lang),
    translateStatus(m.status, lang)
  ]);
};

const copySheet = () => {
  const t = ROSTER_I18N[CTEC.getSavedLang()] || ROSTER_I18N.vi;
  CTEC.copyTSV(t.exportHeaders, getExportRows(), t.copiedMsg);
};

const downloadCsv = () => {
  const t = ROSTER_I18N[CTEC.getSavedLang()] || ROSTER_I18N.vi;
  CTEC.downloadCSV(t.exportHeaders, getExportRows(), t.csvFile);
};

document.addEventListener("DOMContentLoaded", () => {
  const initLang = CTEC.getSavedLang();
  CTEC.createWheelPicker({
    id: "deptWheelPicker",
    listId: "deptDrumList",
    labelId: "deptWheelLabel",
    options: getRosterDeptOptions(initLang),
    onSelect: val => { currentFilter = val; renderTable(); }
  });

  applyRosterStaticI18n(initLang);

  window.addEventListener("ctec:langchange", e => {
    applyRosterStaticI18n(e.detail.lang);
    updateStats();
    renderTable();
  });

  window.addEventListener("ctec:themechange", () => {
    if (rawMembers.length > 0) updateStats();
  });

  loadMembers();
});
