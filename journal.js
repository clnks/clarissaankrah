/* ============================================
   Clarissa Ankrah — Journal page
   ============================================
   - Reads entries from Supabase (public read).
   - Falls back to hardcoded SEED entries if Supabase isn't configured.
   - Admin sign-in unlocks Add / Delete.
   - PDFs upload to Supabase Storage (bucket: journal-pdfs).
   - Three layouts: timeline, grid, changelog (persisted in localStorage).
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Seed data — used until Supabase has its own entries
     ============================================ */
  var SEED = [
    {
      kind: "made",
      title: "EU AI Act — Article 6 high-risk quick-reference",
      entry_date: "2026-02",
      source: "Own work",
      area: "ai",
      note: "A one-pager I built for myself: the Annex III categories, the carve-outs, and the documentation duties that flow from each. Useful when triaging a new use case.",
      link: ""
    },
    {
      kind: "studied",
      title: "CIPP/E renewal — Schrems II and the SCCs",
      entry_date: "2026-01",
      source: "IAPP",
      area: "dp",
      note: "Refresher module on what changed for international transfers after Schrems II — the new SCCs, transfer impact assessments, and where supplementary measures actually bite.",
      link: "https://iapp.org/certify/cippe/"
    },
    {
      kind: "read",
      title: "On the Opportunities and Risks of Foundation Models",
      entry_date: "2025-12",
      source: "Bommasani et al. · Stanford CRFM",
      area: "ai",
      note: "Long, but the closest thing to a shared vocabulary the AI governance field has. The chapters on misuse and accountability are the ones I keep returning to.",
      link: "https://arxiv.org/abs/2108.07258"
    },
    {
      kind: "attended",
      title: "ICO Tech Lab — Privacy-enhancing technologies in practice",
      entry_date: "2025-11",
      source: "Information Commissioner's Office",
      area: "dp",
      note: "Useful framing of PETs as compliance-by-design rather than a bolt-on. The case studies on synthetic data and federated analytics were the most actionable parts.",
      link: "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/"
    },
    {
      kind: "made",
      title: "FinTech onboarding — KYC decision tree",
      entry_date: "2025-10",
      source: "Own work",
      area: "fin",
      note: "A working decision tree I drew up for reviewing onboarding flows: where SCA bites, where EDD is triggered, and how to evidence both without slowing the funnel.",
      link: ""
    },
    {
      kind: "read",
      title: "Preparing for NIS2 — gap-analysis worked example",
      entry_date: "2025-09",
      source: "ENISA",
      area: "sec",
      note: "ENISA's worked example. The mapping from NIS2 articles to control families is what I had been looking for — saved me a lot of by-hand cross-referencing.",
      link: "https://www.enisa.europa.eu/"
    }
  ];

  /* ============================================
     Static labels
     ============================================ */
  var JOURNAL_KIND = {
    made:     { label: "Made" },
    studied:  { label: "Studied" },
    read:     { label: "Read" },
    attended: { label: "Attended" }
  };

  function areaLabel(a) {
    return {
      general: "Foundational",
      dp:      "Data Protection",
      ai:      "AI Governance",
      fin:     "FinTech",
      sec:     "Cybersecurity",
      fc:      "Financial Crime"
    }[a] || "—";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatJournalDate(s) {
    var parts = (s || "").split("-");
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    if (parts.length >= 2) {
      var mi = parseInt(parts[1], 10) - 1;
      return (months[mi] || "") + " " + parts[0];
    }
    return s || "";
  }

  function formatBytes(n) {
    if (!n && n !== 0) return "";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }

  /* ============================================
     Supabase init
     ============================================ */
  var sb = null;
  var sbConfigured = false;
  var currentUser = null;

  function initSupabase() {
    var cfg = window.JOURNAL_CONFIG || {};
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      console.info("[journal] Supabase not configured — using seed entries only. See SETUP-SUPABASE.md.");
      return false;
    }
    if (!window.supabase || !window.supabase.createClient) {
      console.warn("[journal] Supabase JS not loaded.");
      return false;
    }
    try {
      sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      sbConfigured = true;
      return true;
    } catch (e) {
      console.error("[journal] Supabase init failed:", e);
      return false;
    }
  }

  function isAdmin() {
    var cfg = window.JOURNAL_CONFIG || {};
    return !!(currentUser && cfg.adminEmail && currentUser.email &&
              currentUser.email.toLowerCase() === cfg.adminEmail.toLowerCase());
  }

  /* ============================================
     Data fetch
     ============================================ */
  var STATE = {
    entries: [],
    layout: localStorage.getItem("journal:layout") || "timeline",
    area: "all",
    type: "all",
    source: "seed"   // "seed" or "live"
  };

  function fetchEntries() {
    if (!sbConfigured) {
      STATE.entries = SEED.slice();
      STATE.source = "seed";
      return Promise.resolve();
    }
    return sb
      .from("journal_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .then(function (res) {
        if (res.error) throw res.error;
        var rows = res.data || [];
        // Connection succeeded — we're "Live" regardless of row count.
        STATE.source = "live";
        if (rows.length === 0) {
          // Show seed entries as visual filler until the user adds their own.
          STATE.entries = SEED.slice();
          STATE.sourceNote = "empty";
        } else {
          STATE.entries = rows;
          STATE.sourceNote = "";
        }
      })
      .catch(function (err) {
        var msg = (err && err.message) || String(err);
        console.warn("[journal] Falling back to seed entries — Supabase fetch failed:", err);
        STATE.entries = SEED.slice();
        STATE.source = "seed";
        STATE.sourceNote = "error";
        STATE.sourceError = msg;
        flashStatus("Couldn't load entries: " + msg, "warn");
      });
  }

  /* ============================================
     Rendering — three layouts
     ============================================ */
  function renderAll() {
    var host = document.querySelector("[data-journal]");
    if (!host) return;

    // Build a sorted, filtered list
    var entries = STATE.entries.slice().sort(function (a, b) {
      return (b.entry_date || "").localeCompare(a.entry_date || "");
    }).filter(function (e) {
      if (STATE.area !== "all" && e.area !== STATE.area) return false;
      if (STATE.type !== "all" && e.kind !== STATE.type) return false;
      return true;
    });

    // Set layout class on the host's wrapper, so CSS picks up the right styles
    var wrap = document.querySelector("[data-journal-wrap]");
    if (wrap) {
      wrap.classList.remove("is-timeline", "is-grid", "is-changelog");
      wrap.classList.add("is-" + STATE.layout);
    }

    host.className = "j-list j-list--" + STATE.layout;
    host.innerHTML = "";

    if (entries.length === 0) {
      host.innerHTML = '<li class="j-empty">No entries match this filter.</li>';
      updateCounts();
      return;
    }

    entries.forEach(function (e) {
      var li = document.createElement("li");
      var renderer = STATE.layout === "grid" ? renderGridCard
                   : STATE.layout === "changelog" ? renderChangelogRow
                   : renderTimelineRow;
      renderer(li, e);
      host.appendChild(li);
    });

    // Wire delete buttons (admin only)
    host.querySelectorAll("[data-jrn-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-jrn-del");
        deleteEntry(id);
      });
    });

    updateCounts();
  }

  function updateCounts() {
    var n = STATE.entries.length;
    var el = document.querySelector("[data-journal-count]");
    if (el) el.textContent = n + (n === 1 ? " entry" : " entries");
    var src = document.querySelector("[data-journal-source]");
    if (src) {
      if (STATE.source === "live") {
        src.textContent = STATE.sourceNote === "empty"
          ? "Live · Supabase (no entries yet — sign in to add your first)"
          : "Live · Supabase";
      } else {
        src.textContent = "Seed · Local (Supabase not configured)";
      }
      src.classList.toggle("is-live", STATE.source === "live");
    }
  }

  function entryCommon(e) {
    var kind = JOURNAL_KIND[e.kind] || { label: e.kind };
    var pdfHref = e.pdf_url || e.pdf;
    return {
      kind: kind,
      pdfHref: pdfHref,
      pdfName: e.pdf_name || ""
    };
  }

  function entryActionsHTML(e) {
    var html = "";
    var pdfHref = e.pdf_url || e.pdf;
    if (pdfHref) {
      html += '<a class="j-action j-action--pdf" href="' + esc(pdfHref) + '" target="_blank" rel="noopener">' +
                '<span class="j-pdf-tag" aria-hidden="true">PDF</span>' +
                '<span>Read attachment</span>' +
                '<span aria-hidden="true">↗</span>' +
              '</a>';
    }
    if (e.link) {
      html += '<a class="j-action" href="' + esc(e.link) + '" target="_blank" rel="noopener">' +
                '<span>Source</span><span aria-hidden="true">↗</span>' +
              '</a>';
    }
    return html;
  }

  function adminDelBtn(e) {
    if (!isAdmin() || !e.id) return "";
    return '<button type="button" class="j-del" data-jrn-del="' + esc(e.id) + '" aria-label="Delete entry" title="Delete entry"></button>';
  }

  /* ---- Layout: timeline ---- */
  function renderTimelineRow(li, e) {
    var c = entryCommon(e);
    li.className = "j-row j-row--timeline j-kind-" + e.kind;
    li.setAttribute("data-area", e.area);
    li.setAttribute("data-jtype", e.kind);
    li.innerHTML =
      '<div class="j-tl__date">' +
        '<span class="j-tl__dot" aria-hidden="true"></span>' +
        '<time datetime="' + esc(e.entry_date) + '">' + esc(formatJournalDate(e.entry_date)) + '</time>' +
      '</div>' +
      '<div class="j-card j-card--timeline">' +
        adminDelBtn(e) +
        '<div class="j-chips">' +
          '<span class="j-kind j-kind--' + e.kind + '">' + c.kind.label + '</span>' +
          '<span class="j-area">' + areaLabel(e.area) + '</span>' +
        '</div>' +
        '<h3 class="j-title">' + esc(e.title) + '</h3>' +
        (e.source ? '<p class="j-source">' + esc(e.source) + '</p>' : "") +
        (e.note ? '<p class="j-note">' + esc(e.note).replace(/\n/g, "<br />") + '</p>' : "") +
        (entryActionsHTML(e) ? '<div class="j-actions">' + entryActionsHTML(e) + '</div>' : "") +
      '</div>';
  }

  /* ---- Layout: grid (index-card style) ---- */
  function renderGridCard(li, e) {
    var c = entryCommon(e);
    li.className = "j-row j-row--grid j-kind-" + e.kind;
    li.setAttribute("data-area", e.area);
    li.setAttribute("data-jtype", e.kind);
    li.innerHTML =
      '<article class="j-card j-card--grid">' +
        adminDelBtn(e) +
        '<header class="j-card__top">' +
          '<span class="j-kind j-kind--' + e.kind + '">' + c.kind.label + '</span>' +
          '<time class="j-card__date" datetime="' + esc(e.entry_date) + '">' + esc(formatJournalDate(e.entry_date)) + '</time>' +
        '</header>' +
        '<h3 class="j-title">' + esc(e.title) + '</h3>' +
        (e.source ? '<p class="j-source">' + esc(e.source) + '</p>' : "") +
        (e.note ? '<p class="j-note">' + esc(e.note).replace(/\n/g, "<br />") + '</p>' : "") +
        '<footer class="j-card__bottom">' +
          '<span class="j-area">' + areaLabel(e.area) + '</span>' +
          (entryActionsHTML(e) ? '<div class="j-actions">' + entryActionsHTML(e) + '</div>' : "") +
        '</footer>' +
      '</article>';
  }

  /* ---- Layout: changelog (dense rows) ---- */
  function renderChangelogRow(li, e) {
    var c = entryCommon(e);
    li.className = "j-row j-row--cl j-kind-" + e.kind;
    li.setAttribute("data-area", e.area);
    li.setAttribute("data-jtype", e.kind);

    var pdfHref = e.pdf_url || e.pdf;
    var quickLinks = "";
    if (pdfHref) {
      quickLinks += '<a class="j-cl__link" href="' + esc(pdfHref) + '" target="_blank" rel="noopener" title="Read PDF">' +
                      '<span class="j-pdf-tag" aria-hidden="true">PDF</span>' +
                    '</a>';
    }
    if (e.link) {
      quickLinks += '<a class="j-cl__link" href="' + esc(e.link) + '" target="_blank" rel="noopener" title="Source">' +
                      '<span aria-hidden="true">↗</span>' +
                    '</a>';
    }

    li.innerHTML =
      '<time class="j-cl__date" datetime="' + esc(e.entry_date) + '">' + esc(formatJournalDate(e.entry_date)) + '</time>' +
      '<span class="j-kind j-kind--' + e.kind + ' j-cl__kind">' + c.kind.label + '</span>' +
      '<div class="j-cl__body">' +
        adminDelBtn(e) +
        '<h3 class="j-cl__title">' + esc(e.title) + '</h3>' +
        '<p class="j-cl__meta">' +
          '<span class="j-area j-area--inline">' + areaLabel(e.area) + '</span>' +
          (e.source ? '<span class="j-cl__sep">·</span><span class="j-cl__source">' + esc(e.source) + '</span>' : "") +
        '</p>' +
        (e.note ? '<p class="j-cl__note">' + esc(e.note) + '</p>' : "") +
      '</div>' +
      (quickLinks ? '<div class="j-cl__links">' + quickLinks + '</div>' : '<div></div>');
  }

  /* ============================================
     Filters & layout toggle
     ============================================ */
  function initFilters() {
    var areas = document.querySelector("[data-area-filters]");
    if (areas) {
      areas.querySelectorAll(".j-pill").forEach(function (p) {
        p.addEventListener("click", function () {
          areas.querySelectorAll(".j-pill").forEach(function (x) { x.classList.remove("is-active"); });
          p.classList.add("is-active");
          STATE.area = p.getAttribute("data-area");
          renderAll();
        });
      });
    }
    var types = document.querySelector("[data-type-filters]");
    if (types) {
      types.querySelectorAll(".j-pill").forEach(function (p) {
        p.addEventListener("click", function () {
          types.querySelectorAll(".j-pill").forEach(function (x) { x.classList.remove("is-active"); });
          p.classList.add("is-active");
          STATE.type = p.getAttribute("data-jtype");
          renderAll();
        });
      });
    }
  }

  function initLayoutToggle() {
    var toggle = document.querySelector("[data-layout-toggle]");
    if (!toggle) return;
    toggle.querySelectorAll("button").forEach(function (b) {
      if (b.getAttribute("data-layout") === STATE.layout) b.classList.add("is-active");
      b.addEventListener("click", function () {
        toggle.querySelectorAll("button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        STATE.layout = b.getAttribute("data-layout");
        localStorage.setItem("journal:layout", STATE.layout);
        renderAll();
      });
    });
  }

  /* ============================================
     Admin sign in / out
     ============================================ */
  function refreshAdminUI() {
    var admin = isAdmin();
    var pill = document.querySelector("[data-admin-pill]");
    var addBtn = document.querySelector("[data-jrn-add-toggle]");
    var statusLine = document.querySelector("[data-admin-status]");

    if (pill) {
      pill.textContent = admin ? "Signed in" : "Admin";
      pill.classList.toggle("is-signed-in", admin);
    }
    if (addBtn) addBtn.hidden = !admin;
    if (statusLine) {
      statusLine.textContent = admin
        ? "Signed in as " + (currentUser && currentUser.email ? currentUser.email : "admin")
        : "";
    }
  }

  function openAdminModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("j-modal-open");

    var content = modal.querySelector(".j-modal__content");
    content.innerHTML = "";

    if (!sbConfigured) {
      content.innerHTML =
        '<h3 class="j-modal__title">Admin sign in</h3>' +
        '<p class="j-modal__hint">Supabase isn\'t configured yet. Follow the steps in <code>SETUP-SUPABASE.md</code>, paste your credentials into <code>journal-config.js</code>, then come back here to sign in.</p>' +
        '<div class="j-modal__actions"><button class="j-btn j-btn--ghost" type="button" data-admin-close>Close</button></div>';
    } else if (currentUser) {
      content.innerHTML =
        '<h3 class="j-modal__title">Signed in</h3>' +
        '<p class="j-modal__hint">You\'re signed in as <strong>' + esc(currentUser.email || "admin") + '</strong>.</p>' +
        '<div class="j-modal__actions">' +
          '<button class="j-btn j-btn--ghost" type="button" data-admin-close>Close</button>' +
          '<button class="j-btn" type="button" data-admin-signout>Sign out</button>' +
        '</div>';
    } else {
      content.innerHTML =
        '<h3 class="j-modal__title">Admin sign in</h3>' +
        '<p class="j-modal__hint">Only the admin can add or delete entries. Visitors can read everything without signing in.</p>' +
        '<form class="j-modal__form" data-admin-form>' +
          '<label class="j-field"><span class="j-field__label">Email</span><input type="email" name="email" required autocomplete="email" /></label>' +
          '<label class="j-field"><span class="j-field__label">Password</span><input type="password" name="password" required autocomplete="current-password" /></label>' +
          '<p class="j-modal__err" data-admin-err hidden></p>' +
          '<div class="j-modal__actions">' +
            '<button class="j-btn j-btn--ghost" type="button" data-admin-close>Cancel</button>' +
            '<button class="j-btn" type="submit">Sign in</button>' +
          '</div>' +
        '</form>';
      var form = content.querySelector("[data-admin-form]");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        signIn(fd.get("email"), fd.get("password"));
      });
      setTimeout(function () {
        var f = content.querySelector('input[name="email"]');
        if (f) f.focus();
      }, 80);
    }

    var close = modal.querySelector("[data-admin-close]");
    if (close) close.addEventListener("click", closeAdminModal);
    var signout = modal.querySelector("[data-admin-signout]");
    if (signout) signout.addEventListener("click", signOut);
  }

  function closeAdminModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (modal) modal.hidden = true;
    document.body.classList.remove("j-modal-open");
  }

  function signIn(email, password) {
    if (!sb) return;
    var err = document.querySelector("[data-admin-err]");
    if (err) err.hidden = true;
    sb.auth.signInWithPassword({ email: email, password: password })
      .then(function (res) {
        if (res.error) throw res.error;
        currentUser = res.data && res.data.user;
        closeAdminModal();
        refreshAdminUI();
        renderAll();
        flashStatus("Signed in. You can add and delete entries.", "ok");
      })
      .catch(function (e) {
        if (err) { err.hidden = false; err.textContent = e.message || "Sign-in failed."; }
      });
  }

  function signOut() {
    if (!sb) return;
    sb.auth.signOut().then(function () {
      currentUser = null;
      closeAdminModal();
      refreshAdminUI();
      renderAll();
      flashStatus("Signed out.", "ok");
    });
  }

  function initAuth() {
    if (!sbConfigured) { refreshAdminUI(); return Promise.resolve(); }
    return sb.auth.getSession().then(function (res) {
      currentUser = res.data && res.data.session && res.data.session.user;
      refreshAdminUI();
    }).catch(function () { refreshAdminUI(); });
  }

  function initAdminPill() {
    var pill = document.querySelector("[data-admin-pill]");
    if (pill) pill.addEventListener("click", openAdminModal);
  }

  /* ============================================
     Add / Delete entry
     ============================================ */
  function initAddForm() {
    var toggle = document.querySelector("[data-jrn-add-toggle]");
    var form   = document.querySelector("[data-jrn-form]");
    if (!toggle || !form) return;

    var cancel    = form.querySelector("[data-jrn-cancel]");
    var fileInput = form.querySelector("[data-jrn-file]");
    var drop      = form.querySelector("[data-jrn-drop]");
    var prompt    = form.querySelector("[data-jrn-drop-prompt]");
    var chip      = form.querySelector("[data-jrn-file-chip]");
    var fname     = form.querySelector("[data-jrn-file-name]");
    var clearBtn  = form.querySelector("[data-jrn-file-clear]");

    function openForm() {
      form.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.classList.add("is-open");
      var dateEl = form.querySelector('input[name="date"]');
      if (dateEl && !dateEl.value) {
        var d = new Date();
        var mm = String(d.getMonth() + 1).padStart(2, "0");
        dateEl.value = d.getFullYear() + "-" + mm;
      }
      setTimeout(function () {
        var t = form.querySelector('input[name="title"]');
        if (t) t.focus();
      }, 80);
    }
    function closeForm() {
      form.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.classList.remove("is-open");
    }
    function resetForm() {
      form.reset();
      if (fileInput) fileInput.value = "";
      updateFileUI(null);
    }

    toggle.addEventListener("click", function () {
      if (form.hidden) openForm();
      else closeForm();
    });
    if (cancel) cancel.addEventListener("click", function () { resetForm(); closeForm(); });

    function updateFileUI(file) {
      if (file) {
        if (prompt) prompt.hidden = true;
        if (chip)   chip.hidden = false;
        if (fname)  fname.textContent = file.name + "  · " + formatBytes(file.size);
      } else {
        if (prompt) prompt.hidden = false;
        if (chip)   chip.hidden = true;
        if (fname)  fname.textContent = "";
      }
    }
    function setFile(file) {
      if (!file) { if (fileInput) fileInput.value = ""; updateFileUI(null); return; }
      if (file.type && file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
        alert("Please attach a PDF file."); return;
      }
      if (file.size > 25 * 1024 * 1024) {
        if (!confirm("That PDF is over 25 MB. Upload anyway?")) return;
      }
      if (fileInput && window.DataTransfer) {
        try { var dt = new DataTransfer(); dt.items.add(file); fileInput.files = dt.files; } catch (_) {}
      }
      updateFileUI(file);
    }
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var f = fileInput.files && fileInput.files[0];
        setFile(f || null);
      });
    }
    if (clearBtn) clearBtn.addEventListener("click", function (ev) { ev.preventDefault(); setFile(null); });

    if (drop) {
      ["dragenter", "dragover"].forEach(function (evt) {
        drop.addEventListener(evt, function (e) { e.preventDefault(); e.stopPropagation(); drop.classList.add("is-drag"); });
      });
      ["dragleave", "dragend", "drop"].forEach(function (evt) {
        drop.addEventListener(evt, function (e) { e.preventDefault(); e.stopPropagation(); drop.classList.remove("is-drag"); });
      });
      drop.addEventListener("drop", function (e) {
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) setFile(f);
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!isAdmin()) { alert("Sign in as admin first."); return; }

      var fd = new FormData(form);
      var entry = {
        kind:       (fd.get("kind") || "").toString(),
        title:      (fd.get("title") || "").toString().trim(),
        entry_date: (fd.get("date") || "").toString(),
        area:       (fd.get("area") || "").toString(),
        source:     (fd.get("source") || "").toString().trim() || null,
        note:       (fd.get("note") || "").toString().trim() || null,
        link:       (fd.get("link") || "").toString().trim() || null
      };
      if (!entry.kind || !entry.title || !entry.entry_date || !entry.area) {
        alert("Type, title, date and area are required."); return;
      }

      var pdfFile = fileInput && fileInput.files && fileInput.files[0];
      var submitBtn = form.querySelector(".j-form__submit");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = pdfFile ? "Uploading…" : "Saving…"; }

      var pipeline = Promise.resolve();
      if (pdfFile) {
        pipeline = uploadPdf(pdfFile).then(function (uploaded) {
          entry.pdf_path = uploaded.path;
          entry.pdf_name = uploaded.name;
        });
      }
      pipeline.then(function () {
        return sb.from("journal_entries").insert(entry).select().single();
      }).then(function (res) {
        if (res.error) throw res.error;
        // Re-fetch to get fresh data with the public PDF URL stitched in
        return fetchEntries();
      }).then(function () {
        renderAll();
        resetForm();
        closeForm();
        flashStatus("Entry saved — visible to everyone now.", "ok");
      }).catch(function (err) {
        console.error(err);
        alert("Couldn't save entry: " + (err.message || err));
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Save entry"; }
      });
    });
  }

  function uploadPdf(file) {
    var cfg = window.JOURNAL_CONFIG || {};
    var bucket = cfg.storageBucket || "journal-pdfs";
    var safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
    var path = Date.now() + "_" + Math.random().toString(36).slice(2, 8) + "_" + safe;
    return sb.storage.from(bucket).upload(path, file, { contentType: "application/pdf", upsert: false })
      .then(function (res) {
        if (res.error) throw res.error;
        return { path: path, name: file.name };
      });
  }

  /* When we read entries back, we don't have a public URL stitched in yet.
     Add a step after fetch to resolve pdf_path -> public URL. */
  var originalFetch = fetchEntries;
  fetchEntries = function () {
    return originalFetch().then(function () {
      if (!sb) return;
      var cfg = window.JOURNAL_CONFIG || {};
      var bucket = cfg.storageBucket || "journal-pdfs";
      STATE.entries.forEach(function (e) {
        if (e.pdf_path && !e.pdf_url) {
          try {
            var res = sb.storage.from(bucket).getPublicUrl(e.pdf_path);
            if (res && res.data && res.data.publicUrl) e.pdf_url = res.data.publicUrl;
          } catch (_) {}
        }
      });
    });
  };

  function deleteEntry(id) {
    if (!isAdmin()) return;
    if (!confirm("Delete this journal entry? This cannot be undone.")) return;
    // Find the entry to delete its PDF too
    var entry = STATE.entries.find(function (e) { return String(e.id) === String(id); });
    var pipeline = Promise.resolve();
    if (entry && entry.pdf_path && sb) {
      var cfg = window.JOURNAL_CONFIG || {};
      var bucket = cfg.storageBucket || "journal-pdfs";
      pipeline = sb.storage.from(bucket).remove([entry.pdf_path]).then(function () {}, function () {});
    }
    pipeline.then(function () {
      return sb.from("journal_entries").delete().eq("id", id);
    }).then(function (res) {
      if (res.error) throw res.error;
      return fetchEntries();
    }).then(function () {
      renderAll();
      flashStatus("Entry deleted.", "ok");
    }).catch(function (err) {
      console.error(err);
      alert("Couldn't delete: " + (err.message || err));
    });
  }

  /* ============================================
     Toast / status flash
     ============================================ */
  var flashTimer = null;
  function flashStatus(msg, tone) {
    var el = document.querySelector("[data-flash]");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("is-ok", "is-warn", "is-show");
    el.classList.add("is-show", "is-" + (tone || "ok"));
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { el.classList.remove("is-show"); }, 3500);
  }

  /* ============================================
     Init
     ============================================ */
  function init() {
    if (!document.querySelector("[data-journal]")) return;

    initSupabase();
    initLayoutToggle();
    initFilters();
    initAddForm();
    initAdminPill();

    initAuth()
      .then(fetchEntries)
      .then(function () { renderAll(); refreshAdminUI(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
