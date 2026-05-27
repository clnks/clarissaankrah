/* ============================================
   Clarissa Ankrah — Site-wide text editor
   ============================================
   - Lets the admin edit any element tagged with data-edit="<field-id>"
     on any page, with changes stored in Supabase (table: site_content).
   - The HTML defaults stay in place as fallback / seed — when no row
     exists for a field, the original text shows. So your source files
     are never overwritten.
   - Re-uses the journal's Supabase config + auth session, so signing
     in once on any page unlocks editing everywhere.
   ============================================ */
(function () {
  "use strict";

  /* ============================================
     Don't run on the Journal page — it already has its own
     admin pill + modal + edit UI for its entries.
     ============================================ */
  if (document.querySelector("[data-journal]")) return;

  var cfg = window.JOURNAL_CONFIG || {};
  var sb = null;
  var sbConfigured = false;
  var currentUser = null;
  var overrides = Object.create(null);   // field_id -> value
  var pageId = derivePageId();

  function derivePageId() {
    var name = (window.location.pathname || "").split("/").pop() || "index.html";
    return name.replace(/\.html?$/i, "") || "index";
  }

  function isAdmin() {
    return !!(currentUser && cfg.adminEmail && currentUser.email &&
              currentUser.email.toLowerCase() === cfg.adminEmail.toLowerCase());
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ============================================
     Supabase init — share the journal's client if it
     happened to load on this page; otherwise make our own.
     ============================================ */
  function initSupabase() {
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      console.info("[site-edit] Supabase not configured — edit UI disabled.");
      return false;
    }
    if (!window.supabase || !window.supabase.createClient) {
      console.warn("[site-edit] Supabase JS not loaded.");
      return false;
    }
    try {
      sb = window.__sharedSb || window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      window.__sharedSb = sb;
      sbConfigured = true;
      return true;
    } catch (e) {
      console.error("[site-edit] Supabase init failed:", e);
      return false;
    }
  }

  /* ============================================
     Fetch + apply overrides
     ============================================ */
  function fetchOverrides() {
    if (!sbConfigured) return Promise.resolve();
    return sb.from("site_content")
      .select("field_id, value")
      .eq("page_id", pageId)
      .then(function (res) {
        if (res.error) throw res.error;
        (res.data || []).forEach(function (row) {
          overrides[row.field_id] = row.value;
        });
      })
      .catch(function (err) {
        console.warn("[site-edit] fetch failed:", err);
      });
  }

  function applyOverrides() {
    document.querySelectorAll("[data-edit]").forEach(function (el) {
      var fid = el.getAttribute("data-edit");
      if (!fid) return;
      if (Object.prototype.hasOwnProperty.call(overrides, fid)) {
        writeValue(el, overrides[fid]);
      }
    });
  }

  function writeValue(el, val) {
    // Remember the original HTML once, so we can revert to it cleanly.
    if (el.getAttribute("data-edit-default") == null) {
      el.setAttribute("data-edit-default", el.innerHTML);
    }
    if (el.hasAttribute("data-edit-html")) {
      el.innerHTML = val == null ? "" : String(val);
    } else {
      el.textContent = val == null ? "" : String(val);
    }
  }

  function restoreDefault(el) {
    var def = el.getAttribute("data-edit-default");
    if (def != null) el.innerHTML = def;
  }

  function currentValueOf(el) {
    var fid = el.getAttribute("data-edit");
    if (Object.prototype.hasOwnProperty.call(overrides, fid)) return overrides[fid];
    // Strip any injected pencil before reading the default value
    var clone = el.cloneNode(true);
    var p = clone.querySelector(".se-pencil");
    if (p) p.remove();
    return el.hasAttribute("data-edit-html") ? clone.innerHTML.trim() : clone.textContent.trim();
  }

  /* ============================================
     Auth
     ============================================ */
  function initAuth() {
    if (!sbConfigured) return Promise.resolve();
    return sb.auth.getSession().then(function (res) {
      currentUser = (res.data && res.data.session && res.data.session.user) || null;
      // Stay in sync if the session changes on another tab / page
      sb.auth.onAuthStateChange(function (_evt, session) {
        currentUser = (session && session.user) || null;
        refreshAdminUI();
      });
    }).catch(function () {});
  }

  function signIn(email, password) {
    return sb.auth.signInWithPassword({ email: email, password: password })
      .then(function (res) {
        if (res.error) throw res.error;
        currentUser = res.data && res.data.user;
      });
  }

  function signOut() {
    return sb.auth.signOut().then(function () { currentUser = null; });
  }

  /* ============================================
     Pill / modal / flash — DOM scaffolding
     ============================================ */
  function ensureScaffold() {
    if (!document.querySelector("[data-admin-pill]")) {
      var pill = document.createElement("button");
      pill.className = "j-admin-pill";
      pill.type = "button";
      pill.setAttribute("data-admin-pill", "");
      pill.setAttribute("aria-label", "Admin sign in");
      pill.textContent = "Admin";
      document.body.appendChild(pill);
      pill.addEventListener("click", openAdminModal);
    }
    if (!document.querySelector("[data-admin-modal]")) {
      var modal = document.createElement("div");
      modal.className = "j-modal";
      modal.setAttribute("data-admin-modal", "");
      modal.hidden = true;
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML =
        '<div class="j-modal__backdrop" data-admin-close></div>' +
        '<div class="j-modal__panel"><div class="j-modal__content"></div></div>';
      document.body.appendChild(modal);
    }
    if (!document.querySelector("[data-flash]")) {
      var flash = document.createElement("div");
      flash.className = "j-flash";
      flash.setAttribute("data-flash", "");
      document.body.appendChild(flash);
    }
  }

  function refreshAdminUI() {
    var admin = isAdmin();
    var pill = document.querySelector("[data-admin-pill]");
    if (pill) {
      pill.textContent = admin ? "Signed in" : "Admin";
      pill.classList.toggle("is-signed-in", admin);
    }
    document.body.classList.toggle("se-admin", admin);
    renderPencils();
  }

  function openAdminModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (!modal) return;
    var content = modal.querySelector(".j-modal__content");
    modal.hidden = false;
    document.body.classList.add("j-modal-open");

    if (!sbConfigured) {
      content.innerHTML =
        '<h3 class="j-modal__title">Admin sign in</h3>' +
        '<p class="j-modal__hint">Supabase isn\'t configured yet. Follow <code>SETUP-SUPABASE.md</code>.</p>' +
        '<div class="j-modal__actions"><button class="j-btn j-btn--ghost" type="button" data-admin-close>Close</button></div>';
    } else if (currentUser) {
      content.innerHTML =
        '<h3 class="j-modal__title">Signed in</h3>' +
        '<p class="j-modal__hint">Signed in as <strong>' + esc(currentUser.email || "admin") +
          '</strong>. Hover any block of text on the page — a ✎ pencil appears. Click it to edit.</p>' +
        '<div class="j-modal__actions">' +
          '<button class="j-btn j-btn--ghost" type="button" data-admin-close>Close</button>' +
          '<button class="j-btn" type="button" data-admin-signout>Sign out</button>' +
        '</div>';
    } else {
      content.innerHTML =
        '<h3 class="j-modal__title">Admin sign in</h3>' +
        '<p class="j-modal__hint">Only the admin can edit. Visitors can read everything without signing in.</p>' +
        '<form class="j-modal__form" data-admin-form>' +
          '<label class="j-field"><span class="j-field__label">Email</span>' +
            '<input type="email" name="email" required autocomplete="email" /></label>' +
          '<label class="j-field"><span class="j-field__label">Password</span>' +
            '<input type="password" name="password" required autocomplete="current-password" /></label>' +
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
        var err = content.querySelector("[data-admin-err]");
        err.hidden = true;
        signIn(fd.get("email"), fd.get("password"))
          .then(function () { closeAdminModal(); refreshAdminUI(); flash("Signed in.", "ok"); })
          .catch(function (e2) { err.hidden = false; err.textContent = e2.message || "Sign-in failed."; });
      });
      setTimeout(function () {
        var f = content.querySelector('input[name="email"]');
        if (f) f.focus();
      }, 80);
    }

    wireCloseHandlers(modal);
    var so = modal.querySelector("[data-admin-signout]");
    if (so) so.addEventListener("click", function () {
      signOut().then(function () { closeAdminModal(); refreshAdminUI(); flash("Signed out.", "ok"); });
    });
  }

  function closeAdminModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (modal) modal.hidden = true;
    document.body.classList.remove("j-modal-open");
  }

  function wireCloseHandlers(modal) {
    modal.querySelectorAll("[data-admin-close]").forEach(function (b) {
      b.addEventListener("click", closeAdminModal);
    });
  }

  /* ============================================
     Pencils — one per [data-edit] element when admin
     ============================================ */
  function renderPencils() {
    // Always strip stale pencils first
    document.querySelectorAll(".se-pencil").forEach(function (p) { p.remove(); });
    document.querySelectorAll("[data-edit]").forEach(function (el) {
      el.classList.toggle("se-editable", isAdmin());
    });
    if (!isAdmin()) return;
    document.querySelectorAll("[data-edit]").forEach(function (el) {
      attachPencil(el);
    });
  }

  function attachPencil(el) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "se-pencil";
    btn.setAttribute("aria-label", "Edit text");
    btn.setAttribute("data-se-for", el.getAttribute("data-edit"));
    btn.title = "Edit";
    btn.textContent = "✎";
    btn.style.position = "absolute";
    btn.style.zIndex = "9999";

    function positionPencil() {
      var r = el.getBoundingClientRect();
      btn.style.top  = (r.top  + window.scrollY - 12) + "px";
      btn.style.left = (r.right + window.scrollX - 16) + "px";
    }

    document.body.appendChild(btn);
    positionPencil();

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openEditor(el);
    });

    window.addEventListener("scroll", positionPencil, { passive: true });
    window.addEventListener("resize", positionPencil, { passive: true });
  }

  /* ============================================
     Editor modal
     ============================================ */
  function openEditor(el) {
    var fid = el.getAttribute("data-edit");
    var isHtml = el.hasAttribute("data-edit-html");
    var current = currentValueOf(el);
    var hasOverride = Object.prototype.hasOwnProperty.call(overrides, fid);

    var modal = document.querySelector("[data-admin-modal]");
    var content = modal.querySelector(".j-modal__content");
    modal.hidden = false;
    document.body.classList.add("j-modal-open");

    content.innerHTML =
      '<h3 class="j-modal__title">Edit text</h3>' +
      '<p class="j-modal__hint">' +
        '<code>' + esc(pageId) + '</code> · <code>' + esc(fid) + '</code>' +
        (isHtml ? ' · HTML allowed (e.g. <code>&lt;em&gt;</code>, <code>&lt;strong&gt;</code>)' : '') +
      '</p>' +
      '<form class="j-modal__form" data-se-form>' +
        '<label class="j-field">' +
          '<span class="j-field__label">Value</span>' +
          '<textarea name="value" rows="5"></textarea>' +
        '</label>' +
        '<p class="j-modal__err" data-se-err hidden></p>' +
        '<div class="j-modal__actions" data-se-actions>' +
          (hasOverride
            ? '<button class="j-btn j-btn--ghost" type="button" data-se-reset>Revert to default</button>'
            : '<span></span>') +
          '<span style="display:inline-flex; gap:10px;">' +
            '<button class="j-btn j-btn--ghost" type="button" data-admin-close>Cancel</button>' +
            '<button class="j-btn" type="submit">Save</button>' +
          '</span>' +
        '</div>' +
      '</form>';

    var ta = content.querySelector('textarea[name="value"]');
    ta.value = current || "";
    setTimeout(function () { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 60);

    var form = content.querySelector("[data-se-form]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = ta.value;
      var btn = form.querySelector('[type="submit"]');
      var errEl = content.querySelector("[data-se-err]");
      btn.disabled = true; btn.textContent = "Saving…"; errEl.hidden = true;

      sb.from("site_content").upsert({
        page_id: pageId,
        field_id: fid,
        value: val,
        updated_at: new Date().toISOString()
      }).then(function (res) {
        if (res.error) throw res.error;
        overrides[fid] = val;
        writeValue(el, val);
        attachPencil(el);   // writeValue replaced inner content, so re-add pencil
        closeAdminModal();
        flash("Saved.", "ok");
      }).catch(function (err) {
        errEl.hidden = false; errEl.textContent = err.message || "Save failed.";
      }).then(function () {
        btn.disabled = false; btn.textContent = "Save";
      });
    });

    var reset = content.querySelector("[data-se-reset]");
    if (reset) {
      reset.addEventListener("click", function () {
        if (!confirm("Revert this field to its built-in default? The saved value will be deleted.")) return;
        sb.from("site_content").delete()
          .eq("page_id", pageId).eq("field_id", fid)
          .then(function (res) {
            if (res.error) throw res.error;
            delete overrides[fid];
            restoreDefault(el);
            attachPencil(el);
            closeAdminModal();
            flash("Reverted to default.", "ok");
          }).catch(function (err) {
            alert("Couldn't revert: " + (err.message || err));
          });
      });
    }

    wireCloseHandlers(modal);
  }

  /* ============================================
     Flash toast
     ============================================ */
  var flashTimer = null;
  function flash(msg, tone) {
    var el = document.querySelector("[data-flash]");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("is-ok", "is-warn", "is-show");
    el.classList.add("is-show", "is-" + (tone || "ok"));
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { el.classList.remove("is-show"); }, 3000);
  }

  /* ============================================
     Local styles — pencils + editable hover ring
     ============================================ */
  function injectStyles() {
    if (document.getElementById("__site_edit_styles")) return;
    var st = document.createElement("style");
    st.id = "__site_edit_styles";
    st.textContent =
      ".se-pencil{" +
        "position:absolute; top:-12px; right:-12px;" +
        "width:28px; height:28px; padding:0; margin:0;" +
        "border:1px solid var(--border, #d8d2c5); border-radius:50%;" +
        "background:#fff; color:#3A2F6A;" +
        "font-size:14px; line-height:1; cursor:pointer;" +
        "display:inline-flex; align-items:center; justify-content:center;" +
        "box-shadow:0 2px 6px rgba(40,30,10,.10);" +
        "opacity:0; transform:translateY(-2px);" +
        "transition:opacity 140ms ease, transform 140ms ease, background 140ms ease, color 140ms ease, border-color 140ms ease;" +
        "z-index:30;" +
      "}" +
      "body.se-admin .se-editable:hover > .se-pencil," +
      "body.se-admin .se-editable:focus-within > .se-pencil," +
      "body.se-admin .se-pencil:focus { opacity:1; transform:translateY(0); }" +
      ".se-pencil:hover { background:#3A2F6A; color:#fff; border-color:#3A2F6A; }" +
      "body.se-admin .se-editable { outline: 1px dashed transparent; outline-offset: 6px; border-radius: 2px; transition: outline-color 140ms ease; }" +
      "body.se-admin .se-editable:hover { outline-color: rgba(58,47,106,.35); }";
    document.head.appendChild(st);
  }

  /* ============================================
     Init
     ============================================ */
  function init() {
    injectStyles();
    ensureScaffold();
    if (!initSupabase()) { refreshAdminUI(); return; }
    initAuth()
      .then(fetchOverrides)
      .then(function () {
        applyOverrides();
        refreshAdminUI();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
