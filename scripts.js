/* ============================================
   Clarissa Ankrah — Portfolio
   Shared JS: nav + reading page (filters, shelf, web)
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Mobile nav toggle
     ============================================ */
  function initNav() {
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav__toggle");
    if (!nav || !toggle) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll(".nav__link").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ============================================
     Active nav state
     ============================================ */
  function initActiveNav() {
    var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      var match = a.getAttribute("data-nav");
      if (!match) return;
      var targets = match.split(",").map(function (s) { return s.trim().toLowerCase(); });
      if (targets.indexOf(path) !== -1) a.classList.add("is-active");
    });
  }

  /* ============================================
     Reading page data
     ============================================ */

  var SHELF = [
    {
      key: "surveillance",
      title: "The Age of Surveillance Capitalism",
      short: "The Age of Surveillance Capitalism",
      author: "Shoshana Zuboff",
      authorShort: "Zuboff",
      year: "2019",
      format: "Trade Paperback",
      area: "general",
      type: "Book",
      spine: "slate",
      featured: true,
      coverVariant: "zuboff",
      cover: "uploads/zuboff.jpg",
      desc: "The defining account of how 'behavioural surplus' became the most valuable commodity of the digital economy. Long, dense, and worth every page.",
      annot: "Anyone doing data protection work without an opinion on Zuboff is missing the deepest argument about why this profession exists.",
      find: "https://www.hive.co.uk/Product/Shoshana-Zuboff/The-Age-of-Surveillance-Capitalism/22863487"
    },
    {
      key: "carey",
      title: "Data Protection: A Practical Guide to UK Law",
      short: "DP — A Practical Guide to UK Law",
      author: "Peter Carey",
      authorShort: "Carey",
      year: "2024",
      format: "Hardback (OUP)",
      area: "dp",
      type: "Book",
      spine: "warm",
      featured: true,
      coverVariant: "book-cream",
      cover: "uploads/carey.jpg",
      desc: "Oxford's standard UK DP textbook. Encyclopaedic but readable; covers UK GDPR, DPA 2018, PECR, and the law of confidence in one place.",
      annot: "The book to keep on your desk. When you need to know what the law actually says — not what the ICO blog says about what the law might mean — this is the reference.",
      find: "https://global.oup.com/academic/product/data-protection-9780198862611"
    },
    {
      key: "itgp",
      title: "EU GDPR — An Implementation and Compliance Guide",
      short: "GDPR Implementation & Co…",
      author: "IT Governance Publishing",
      authorShort: "ITGP",
      year: "2023",
      format: "Paperback",
      area: "dp",
      type: "Book",
      spine: "sage",
      coverVariant: "book-cream",
      desc: "Procedural workbook for operational GDPR compliance. Strong on documentation, weaker on legal nuance — exactly the trade-off it should make.",
      annot: "For when the question is \"what do we actually do on Monday\" rather than \"what does the law mean\".",
      find: "https://www.itgovernancepublishing.co.uk"
    },
    {
      key: "snake-oil",
      title: "AI Snake Oil",
      short: "AI Snake Oil",
      author: "Arvind Narayanan & Sayash Kapoor",
      authorShort: "Narayan…",
      year: "2024",
      format: "Hardback",
      area: "ai",
      type: "Book",
      spine: "lav-light",
      featured: true,
      coverVariant: "snake-oil",
      cover: "uploads/ai%20snake%20oil.jpg",
      desc: "A taxonomy of what AI can actually do, what it cannot, and how to tell the difference under marketing pressure.",
      annot: "Required reading before writing an AI governance policy. Cuts through vendor noise.",
      find: "https://press.princeton.edu/books/hardcover/9780691249131/ai-snake-oil"
    },
    {
      key: "red-notice",
      title: "Red Notice",
      short: "Red Notice",
      author: "Bill Browder",
      authorShort: "Browder",
      year: "2015",
      format: "Paperback",
      area: "fc",
      type: "Book",
      spine: "warm",
      featured: true,
      coverVariant: "book-cream",
      cover: "uploads/red%20notice.jpg",
      desc: "Memoir of the Magnitsky case — a vivid account of how cross-border financial crime actually plays out, and how modern sanctions regimes came to be.",
      annot: "Turns financial-crime compliance from an abstract rulebook into something you can feel the stakes of.",
      find: "https://www.hive.co.uk/Product/Bill-Browder/Red-Notice/16873472"
    }
  ];

  var WEB = [
    {
      title: "ICO Guide to UK GDPR",
      cat: "Reference",
      area: "dp",
      url: "ico.org.uk",
      href: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/",
      desc: "If you cite this and you're wrong, the regulator was wrong with you."
    },
    {
      title: "EU AI Act Explorer",
      cat: "Reference",
      area: "ai",
      url: "artificialintelligenceact.eu",
      href: "https://artificialintelligenceact.eu/ai-act-explorer/",
      desc: "The fastest way to navigate the Act without losing your mind."
    },
    {
      title: "Import AI",
      cat: "Newsletter",
      area: "ai",
      url: "importai.substack.com",
      href: "https://importai.substack.com/",
      desc: "Best single signal for keeping current on the global AI industry."
    },
    {
      title: "FCA Handbook",
      cat: "Reference",
      area: "fin",
      url: "handbook.fca.org.uk",
      href: "https://www.handbook.fca.org.uk/",
      desc: "The financial services rulebook. Dense but essential."
    },
    {
      title: "Fintech Brainfood",
      cat: "Newsletter",
      area: "fin",
      url: "fintechbrainfood.com",
      href: "https://www.fintechbrainfood.com/",
      desc: "Operator-view insight on where financial services regulation is heading."
    },
    {
      title: "NCSC Cyber Assessment Framework",
      cat: "Reference",
      area: "sec",
      url: "ncsc.gov.uk",
      href: "https://www.ncsc.gov.uk/collection/cyber-assessment-framework",
      desc: "If NIS2 is the question, the NCSC's CAF is most of the UK answer."
    },
    {
      title: "FATF Standards & Guidance",
      cat: "AML Reference",
      area: "fc",
      url: "fatf-gafi.org",
      href: "https://www.fatf-gafi.org/",
      desc: "The international standard-setter. Where national AML rules ultimately come from."
    },
    {
      title: "Privacy by Design — The 7 Foundational Principles",
      cat: "Paper",
      area: "dp",
      url: "privacysecurityacademy.com",
      href: "https://privacysecurityacademy.com/wp-content/uploads/2020/08/PbD-Principles-and-Mapping.pdf",
      desc: "Ann Cavoukian, 2011. The intellectual root of UK GDPR Article 25 — if you only read one short paper this year, this is it."
    },
    {
      title: "AI Risk Management Framework (AI RMF 1.0)",
      cat: "Standard",
      area: "ai",
      url: "nist.gov",
      href: "https://www.nist.gov/itl/ai-risk-management-framework",
      desc: "NIST, 2023. The closest thing to a vendor-neutral common vocabulary for AI risk that anyone has agreed on."
    },
    {
      title: "ISO/IEC 27001:2022 — Information Security Management",
      cat: "Standard",
      area: "sec",
      url: "iso.org",
      href: "https://www.iso.org/standard/27001",
      desc: "The international standard for ISMS. Annex A controls form the spine of most enterprise security programmes."
    },
    {
      title: "FATF UK Mutual Evaluation Report",
      cat: "Report",
      area: "fc",
      url: "fatf-gafi.org",
      href: "https://www.fatf-gafi.org/en/publications/Mutualevaluations/Mer-united-kingdom-2018.html",
      desc: "FATF, 2018. The international assessment of the UK's anti-money-laundering regime — where the assessors put the UK relative to global standards."
    }
  ];

  /* ============================================
     Journal — entries
     ============================================
     Edit this list to add a new entry. Drop the PDF
     into uploads/journal/ and reference it via pdf: */
  var JOURNAL = [
    {
      kind: "made",
      title: "EU AI Act — Article 6 high-risk quick-reference",
      date: "2026-02",
      source: "Own work",
      area: "ai",
      note: "A one-pager I built for myself: the Annex III categories, the carve-outs, and the documentation duties that flow from each. Useful when triaging a new use case.",
      pdf: "uploads/journal/ai-act-art-6-quickref.pdf"
    },
    {
      kind: "studied",
      title: "CIPP/E renewal — Schrems II and the SCCs",
      date: "2026-01",
      source: "IAPP",
      area: "dp",
      note: "Refresher module on what changed for international transfers after Schrems II — the new SCCs, transfer impact assessments, and where supplementary measures actually bite.",
      link: "https://iapp.org/certify/cippe/"
    },
    {
      kind: "read",
      title: "On the Opportunities and Risks of Foundation Models",
      date: "2025-12",
      source: "Bommasani et al. · Stanford CRFM",
      area: "ai",
      note: "Long, but the closest thing to a shared vocabulary the AI governance field has. The chapters on misuse and accountability are the ones I keep returning to.",
      pdf: "uploads/journal/bommasani-foundation-models.pdf",
      link: "https://arxiv.org/abs/2108.07258"
    },
    {
      kind: "attended",
      title: "ICO Tech Lab — Privacy-enhancing technologies in practice",
      date: "2025-11",
      source: "Information Commissioner's Office",
      area: "dp",
      note: "Useful framing of PETs as compliance-by-design rather than a bolt-on. The case studies on synthetic data and federated analytics were the most actionable parts.",
      link: "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/"
    },
    {
      kind: "made",
      title: "FinTech onboarding — KYC decision tree",
      date: "2025-10",
      source: "Own work",
      area: "fin",
      note: "A working decision tree I drew up for reviewing onboarding flows: where SCA bites, where EDD is triggered, and how to evidence both without slowing the funnel.",
      pdf: "uploads/journal/kyc-decision-tree.pdf"
    },
    {
      kind: "read",
      title: "Preparing for NIS2 — gap-analysis worked example",
      date: "2025-09",
      source: "ENISA",
      area: "sec",
      note: "ENISA's worked example. The mapping from NIS2 articles to control families is what I had been looking for — saved me a lot of by-hand cross-referencing.",
      link: "https://www.enisa.europa.eu/"
    }
  ];

  /* ============================================
     Reading — Featured covers
     ============================================ */
  var coverResolved = {}; // cache: key -> resolved URL (or null if exhausted)

  function coverInnerHTML(b) {
    var fallback =
      '<div class="r-cover__fallback r-cover--' + (b.coverVariant || "book-cream") + '" aria-hidden="true">' +
        '<div class="r-cover__kind">' + b.type + '</div>' +
        '<h3 class="r-cover__title">' + b.short + '</h3>' +
        '<p class="r-cover__author">' + b.author + '</p>' +
        '<p class="r-cover__meta">' + b.year + ' · ' + b.format + '</p>' +
      '</div>';
    return fallback + '<img class="r-cover__img" data-cover-key="' + b.key + '" alt="" />';
  }

  function attachCovers(root) {
    (root || document).querySelectorAll(".r-cover__img[data-cover-key]").forEach(function (img) {
      var key = img.getAttribute("data-cover-key");
      var b = SHELF.find(function (x) { return x.key === key; });
      if (!b) return;
      img.addEventListener("load", function () {
        if (img.naturalWidth > 5) img.classList.add("is-loaded");
        else img.remove();
      });
      img.addEventListener("error", function () { resolveCoverFallback(img, b); });
      // Local file beats async lookups; otherwise resolve via OL/Google search.
      if (b.cover) { img.src = b.cover; }
      else if (coverResolved[key]) { img.src = coverResolved[key]; }
      else { resolveCoverFallback(img, b); }
    });
  }

  function resolveCoverFallback(img, b) {
    var tries = (img.dataset.tries || "").split(",").filter(Boolean);
    var next = pickNextCoverStrategy(b, tries);
    if (!next) { img.remove(); return; }
    img.dataset.tries = tries.concat([next.name]).join(",");
    next.run()
      .then(function (url) {
        if (url) { coverResolved[b.key] = url; img.src = url; }
        else { resolveCoverFallback(img, b); }
      })
      .catch(function () { resolveCoverFallback(img, b); });
  }

  function pickNextCoverStrategy(b, tried) {
    var strategies = [
      { name: "ol-title-author", run: function () {
          return olSearch(b.title.replace(/—/g, " ") + " " + b.author);
      }},
      { name: "ol-short-title", run: function () {
          var t = b.title.split(/[—:·]/)[0].split(/\s+/).slice(0, 5).join(" ");
          return olSearch(t + " " + b.authorShort);
      }},
      { name: "google", run: function () { return googleBooks(b); } }
    ];
    for (var i = 0; i < strategies.length; i++) {
      if (tried.indexOf(strategies[i].name) === -1) return strategies[i];
    }
    return null;
  }

  function olSearch(q) {
    return fetch("https://openlibrary.org/search.json?limit=5&q=" + encodeURIComponent(q))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var doc = (data.docs || []).find(function (d) { return d && d.cover_i; });
        return doc ? "https://covers.openlibrary.org/b/id/" + doc.cover_i + "-L.jpg" : null;
      });
  }

  function googleBooks(b) {
    var q = encodeURIComponent("intitle:" + b.title.split(/[—:·]/)[0] + " inauthor:" + b.authorShort);
    return fetch("https://www.googleapis.com/books/v1/volumes?maxResults=3&q=" + q)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var items = data.items || [];
        for (var i = 0; i < items.length; i++) {
          var info = items[i].volumeInfo || {};
          var links = info.imageLinks;
          if (links && (links.thumbnail || links.smallThumbnail)) {
            // upgrade to higher-res by stripping zoom=, and bump to https
            var url = (links.thumbnail || links.smallThumbnail).replace(/^http:/, "https:");
            url = url.replace(/&edge=curl/, "").replace(/&zoom=\d+/, "");
            return url;
          }
        }
        return null;
      });
  }

  function renderFeatured(state) {
    var row = document.querySelector("[data-featured]");
    if (!row) return;
    row.innerHTML = "";
    SHELF.filter(function (b) { return b.featured; }).forEach(function (b) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "r-cover r-cover--photo" + (b.cover ? "" : " r-cover--" + (b.coverVariant || "book-cream"));
      d.setAttribute("data-key", b.key);
      d.setAttribute("data-area", b.area);
      d.setAttribute("aria-label", "Open " + b.title);
      d.innerHTML = coverInnerHTML(b);
      d.addEventListener("click", function () { state.select(b.key); });
      row.appendChild(d);
    });
    attachCovers(row);
  }

  /* ============================================
     Reading — Shelf spines
     ============================================ */
  function renderShelf(state) {
    var shelf = document.querySelector("[data-shelf-row]");
    if (!shelf) return;
    shelf.innerHTML = "";
    SHELF.forEach(function (b, i) {
      var s = document.createElement("button");
      s.type = "button";
      s.className = "r-spine r-spine--" + (b.spine || "warmgrey");
      s.setAttribute("data-key", b.key);
      s.setAttribute("data-area", b.area);
      s.setAttribute("role", "listitem");
      s.setAttribute("aria-label", b.title);
      // vary heights gently based on index
      var h = 200 + ((i * 13) % 56); // 200..256
      s.style.height = h + "px";
      s.innerHTML =
        '<span class="r-spine__top" aria-hidden="true"></span>' +
        '<span class="r-spine__label">' + b.short + '</span>' +
        '<span class="r-spine__foot">' + b.authorShort.toUpperCase() + '</span>';
      s.addEventListener("click", function () { state.select(b.key, { scroll: false }); });
      shelf.appendChild(s);
    });
  }

  /* ============================================
     Reading — Detail card
     ============================================ */
  function renderDetail(b) {
    var host = document.querySelector("[data-detail]");
    if (!host) return;
    if (!b) { host.innerHTML = ""; host.classList.add("is-hidden"); return; }

    var coverHTML =
      '<div class="r-cover r-cover--photo r-detail__cover">' +
        coverInnerHTML(b) +
      '</div>';

    var badges =
      '<span class="r-badge">' + b.type + '</span>' +
      '<span class="r-badge">' + areaLabel(b.area) + '</span>' +
      (b.featured ? '<span class="r-badge r-badge--featured">★ Featured</span>' : '');

    host.innerHTML =
      coverHTML +
      '<div class="r-detail__body">' +
        '<div class="r-detail__badges">' + badges + '</div>' +
        '<h3 class="r-detail__title">' + b.title + '</h3>' +
        '<p class="r-detail__meta">' + b.author + ' · <em>' + b.year + '</em> · ' + b.format + '</p>' +
        '<p class="r-detail__desc">' + b.desc + '</p>' +
        '<div class="r-detail__callout">' +
          '<p class="r-detail__callout-label">Why I keep it on the shelf</p>' +
          '<p class="r-detail__callout-body">' + b.annot + '</p>' +
        '</div>' +
        '<a class="r-detail__cta" href="' + b.find + '" target="_blank" rel="noopener">Find this book <span aria-hidden="true">↗</span></a>' +
      '</div>';

    // reveal
    host.classList.remove("is-hidden");
    attachCovers(host);
  }

  function areaLabel(a) {
    return {
      general: "Foundational",
      dp: "Data Protection",
      ai: "AI Governance",
      fin: "FinTech",
      sec: "Cybersecurity",
      fc: "Financial Crime"
    }[a] || "—";
  }

  /* ============================================
     Reading — Web cards
     ============================================ */
  function renderWeb() {
    var host = document.querySelector("[data-web]");
    if (!host) return;
    host.innerHTML = "";
    WEB.forEach(function (w) {
      var a = document.createElement("a");
      a.className = "r-web-card";
      a.href = w.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("data-area", w.area);
      a.innerHTML =
        '<div class="r-web-card__chrome">' +
          '<span class="r-web-card__dots" aria-hidden="true"><span></span><span></span><span></span></span>' +
          '<span class="r-web-card__url">' + w.url + '</span>' +
          '<span class="r-web-card__cat">' + w.cat + '</span>' +
        '</div>' +
        '<div class="r-web-card__body">' +
          '<h3 class="r-web-card__title">' + w.title + '</h3>' +
          '<p class="r-web-card__desc">' + w.desc + '</p>' +
          '<span class="r-web-card__visit">Visit ↗</span>' +
        '</div>';
      host.appendChild(a);
    });
  }

  /* ============================================
     Reading — Journal
     ============================================ */
  var JOURNAL_KIND = {
    made:     { label: "Made",     verb: "I made this" },
    studied:  { label: "Studied",  verb: "I studied this" },
    read:     { label: "Read",     verb: "I read this" },
    attended: { label: "Attended", verb: "I attended this" }
  };

  function formatJournalDate(s) {
    // "2026-02" -> "Feb 2026"
    var parts = (s || "").split("-");
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    if (parts.length >= 2) {
      var mi = parseInt(parts[1], 10) - 1;
      return (months[mi] || "") + " " + parts[0];
    }
    return s || "";
  }

  // Object URLs created for user-uploaded PDFs — revoked on re-render.
  var jrnObjectUrls = [];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Merge baseline + user entries (from IndexedDB).
  var USER_JOURNAL = [];

  function renderJournal() {
    var host = document.querySelector("[data-journal]");
    if (!host) return;

    // Free any object URLs from a previous render.
    jrnObjectUrls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (_) {} });
    jrnObjectUrls = [];

    host.innerHTML = "";

    var combined = JOURNAL.concat(USER_JOURNAL.map(function (u) {
      // Resolve a Blob into a temporary URL for this render.
      var pdfUrl = null, pdfName = null;
      if (u.pdfBlob) {
        try {
          pdfUrl = URL.createObjectURL(u.pdfBlob);
          jrnObjectUrls.push(pdfUrl);
          pdfName = u.pdfName || "attachment.pdf";
        } catch (_) {}
      }
      return {
        id: u.id,
        kind: u.kind,
        title: u.title,
        date: u.date,
        source: u.source,
        area: u.area,
        note: u.note,
        link: u.link,
        pdf: pdfUrl,
        pdfName: pdfName,
        userAdded: true
      };
    }));

    // newest first by ISO date string
    var items = combined.slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    items.forEach(function (e) {
      var li = document.createElement("li");
      li.className = "r-jrn r-jrn--" + e.kind + (e.userAdded ? " is-user" : "");
      li.setAttribute("data-area", e.area);
      li.setAttribute("data-jtype", e.kind);
      if (e.id) li.setAttribute("data-jid", e.id);

      var actions = "";
      if (e.pdf) {
        var dl = e.userAdded ? ' download="' + esc(e.pdfName || "attachment.pdf") + '"' : "";
        actions += '<a class="r-jrn__action r-jrn__action--pdf" href="' + esc(e.pdf) + '" target="_blank" rel="noopener"' + dl + '>' +
                     '<span class="r-jrn__pdf-tag" aria-hidden="true">PDF</span>' +
                     '<span>' + (e.userAdded ? "Open attachment" : "Read attachment") + '</span>' +
                     '<span aria-hidden="true">↗</span>' +
                   '</a>';
      }
      if (e.link) {
        actions += '<a class="r-jrn__action" href="' + esc(e.link) + '" target="_blank" rel="noopener">' +
                     '<span>Source</span><span aria-hidden="true">↗</span>' +
                   '</a>';
      }

      var kind = JOURNAL_KIND[e.kind] || { label: e.kind };

      var youChip = e.userAdded
        ? '<span class="r-jrn__you" title="Added from this browser">Yours</span>'
        : "";
      var delBtn = e.userAdded
        ? '<button type="button" class="r-jrn__del" data-jrn-del="' + esc(e.id) + '" aria-label="Delete this entry" title="Delete entry">×</button>'
        : "";

      li.innerHTML =
        '<div class="r-jrn__date">' +
          '<span class="r-jrn__dot" aria-hidden="true"></span>' +
          '<time datetime="' + esc(e.date || "") + '">' + esc(formatJournalDate(e.date)) + '</time>' +
        '</div>' +
        '<div class="r-jrn__card">' +
          delBtn +
          '<div class="r-jrn__chips">' +
            '<span class="r-jrn__kind r-jrn__kind--' + e.kind + '">' + kind.label + '</span>' +
            '<span class="r-jrn__area">' + areaLabel(e.area) + '</span>' +
            youChip +
          '</div>' +
          '<h3 class="r-jrn__title">' + esc(e.title) + '</h3>' +
          (e.source ? '<p class="r-jrn__source">' + esc(e.source) + '</p>' : "") +
          (e.note ? '<p class="r-jrn__note">' + esc(e.note).replace(/\n/g, "<br />") + '</p>' : "") +
          (actions ? '<div class="r-jrn__actions">' + actions + '</div>' : "") +
        '</div>';
      host.appendChild(li);
    });

    // Wire delete buttons.
    host.querySelectorAll("[data-jrn-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-jrn-del");
        if (!id) return;
        if (!confirm("Delete this journal entry? This cannot be undone.")) return;
        deleteJournalEntry(id).then(function () {
          return loadUserJournal();
        }).then(function () {
          renderJournal();
          // Re-apply the current area filter so counts/visibility match.
          var active = document.querySelector("[data-filters] .r-pill.is-active");
          applyFilter(active ? active.getAttribute("data-area") : "all");
          // Re-apply current type filter.
          var activeType = document.querySelector("[data-journal-filters] .r-pill.is-active");
          var t = activeType ? activeType.getAttribute("data-jtype") : "all";
          document.querySelectorAll("[data-journal] .r-jrn").forEach(function (li) {
            var match = t === "all" || li.getAttribute("data-jtype") === t;
            li.classList.toggle("is-filtered-type", !match);
          });
        });
      });
    });
  }

  /* ============================================
     Journal — IndexedDB persistence
     ============================================ */
  var JRN_DB_NAME = "ca-journal";
  var JRN_DB_STORE = "entries";

  function openJournalDB() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error("IndexedDB unavailable")); return; }
      var req = indexedDB.open(JRN_DB_NAME, 1);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(JRN_DB_STORE)) {
          db.createObjectStore(JRN_DB_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function loadUserJournal() {
    return openJournalDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(JRN_DB_STORE, "readonly");
        var req = tx.objectStore(JRN_DB_STORE).getAll();
        req.onsuccess = function () {
          USER_JOURNAL = req.result || [];
          resolve(USER_JOURNAL);
        };
        req.onerror = function () { reject(req.error); };
      });
    }).catch(function () { USER_JOURNAL = []; return USER_JOURNAL; });
  }

  function saveJournalEntry(entry) {
    return openJournalDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(JRN_DB_STORE, "readwrite");
        tx.objectStore(JRN_DB_STORE).put(entry);
        tx.oncomplete = function () { resolve(entry); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function deleteJournalEntry(id) {
    return openJournalDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(JRN_DB_STORE, "readwrite");
        tx.objectStore(JRN_DB_STORE).delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  /* ============================================
     Journal — Add-entry form
     ============================================ */
  function initJournalForm() {
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
      // Pre-fill date with this month if empty.
      var dateEl = form.querySelector('input[name="date"]');
      if (dateEl && !dateEl.value) {
        var d = new Date();
        var mm = String(d.getMonth() + 1).padStart(2, "0");
        dateEl.value = d.getFullYear() + "-" + mm;
      }
      // Focus title for fast entry.
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

    // ---- File handling (click + drag/drop) ----
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
        alert("Please attach a PDF file.");
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        if (!confirm("That PDF is over 25 MB. Browsers can be slow with large files in local storage — attach anyway?")) return;
      }
      // Sync to <input type="file"> via DataTransfer where supported (for form semantics).
      if (fileInput && window.DataTransfer) {
        try {
          var dt = new DataTransfer();
          dt.items.add(file);
          fileInput.files = dt.files;
        } catch (_) {}
      }
      updateFileUI(file);
    }
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var f = fileInput.files && fileInput.files[0];
        setFile(f || null);
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", function (ev) {
        ev.preventDefault();
        setFile(null);
      });
    }
    if (drop) {
      ["dragenter", "dragover"].forEach(function (evt) {
        drop.addEventListener(evt, function (e) {
          e.preventDefault(); e.stopPropagation();
          drop.classList.add("is-drag");
        });
      });
      ["dragleave", "dragend", "drop"].forEach(function (evt) {
        drop.addEventListener(evt, function (e) {
          e.preventDefault(); e.stopPropagation();
          drop.classList.remove("is-drag");
        });
      });
      drop.addEventListener("drop", function (e) {
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) setFile(f);
      });
    }

    // ---- Submit ----
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var fd = new FormData(form);
      var kind = (fd.get("kind") || "").toString();
      var title = (fd.get("title") || "").toString().trim();
      var date = (fd.get("date") || "").toString();
      var area = (fd.get("area") || "").toString();
      var source = (fd.get("source") || "").toString().trim();
      var note = (fd.get("note") || "").toString().trim();
      var link = (fd.get("link") || "").toString().trim();
      var pdfFile = fileInput && fileInput.files && fileInput.files[0];

      if (!kind) { alert("Pick a type — Made, Studied, Read, or Attended."); return; }
      if (!title) { alert("Add a title."); return; }
      if (!date)  { alert("Pick a date."); return; }
      if (!area)  { alert("Pick an area."); return; }

      var entry = {
        id: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        kind: kind,
        title: title,
        date: date,
        area: area,
        source: source,
        note: note,
        link: link,
        createdAt: new Date().toISOString()
      };
      if (pdfFile) {
        entry.pdfBlob = pdfFile;
        entry.pdfName = pdfFile.name;
        entry.pdfSize = pdfFile.size;
      }

      saveJournalEntry(entry).then(function () {
        return loadUserJournal();
      }).then(function () {
        renderJournal();
        // Re-apply active filters so the new entry obeys them.
        var active = document.querySelector("[data-filters] .r-pill.is-active");
        applyFilter(active ? active.getAttribute("data-area") : "all");
        var activeType = document.querySelector("[data-journal-filters] .r-pill.is-active");
        var t = activeType ? activeType.getAttribute("data-jtype") : "all";
        document.querySelectorAll("[data-journal] .r-jrn").forEach(function (li) {
          var match = t === "all" || li.getAttribute("data-jtype") === t;
          li.classList.toggle("is-filtered-type", !match);
        });
        resetForm();
        closeForm();
        // Pulse the newly-added card.
        var added = document.querySelector('[data-jid="' + entry.id + '"]');
        if (added) {
          added.classList.add("is-new");
          setTimeout(function () { added.classList.remove("is-new"); }, 1600);
        }
      }).catch(function (err) {
        console.error(err);
        alert("Couldn't save the entry. " + (err && err.message ? err.message : ""));
      });
    });
  }

  function formatBytes(n) {
    if (!n && n !== 0) return "";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }

  /* ============================================
     Reading — Filters
     ============================================ */
  function applyFilter(area) {
    var visibleShelf = 0;
    document.querySelectorAll("[data-shelf-row] .r-spine").forEach(function (s) {
      var match = area === "all" || s.getAttribute("data-area") === area;
      s.classList.toggle("is-filtered-out", !match);
      if (match) visibleShelf++;
    });
    document.querySelectorAll("[data-featured] .r-cover").forEach(function (c) {
      var match = area === "all" || c.getAttribute("data-area") === area;
      c.style.display = match ? "" : "none";
    });
    var visibleWeb = 0;
    document.querySelectorAll("[data-web] .r-web-card").forEach(function (c) {
      var match = area === "all" || c.getAttribute("data-area") === area;
      c.classList.toggle("is-filtered-out", !match);
      if (match) visibleWeb++;
    });

    // Journal entries respect both area + journal type filter.
    document.querySelectorAll("[data-journal] .r-jrn").forEach(function (li) {
      var areaOk = area === "all" || li.getAttribute("data-area") === area;
      li.classList.toggle("is-filtered-area", !areaOk);
    });

    var s = document.querySelector("[data-count-shelf]");
    var w = document.querySelector("[data-count-web]");
    if (s) s.textContent = visibleShelf;
    if (w) w.textContent = visibleWeb;
  }

  function initFilters(state) {
    var box = document.querySelector("[data-filters]");
    if (!box) return;
    box.querySelectorAll(".r-pill").forEach(function (p) {
      p.addEventListener("click", function () {
        box.querySelectorAll(".r-pill").forEach(function (x) { x.classList.remove("is-active"); });
        p.classList.add("is-active");
        var area = p.getAttribute("data-area");
        applyFilter(area);
        state.currentArea = area;
      });
    });
  }

  function initJournalFilters() {
    var box = document.querySelector("[data-journal-filters]");
    if (!box) return;
    box.querySelectorAll(".r-pill").forEach(function (p) {
      p.addEventListener("click", function () {
        box.querySelectorAll(".r-pill").forEach(function (x) { x.classList.remove("is-active"); });
        p.classList.add("is-active");
        var t = p.getAttribute("data-jtype");
        document.querySelectorAll("[data-journal] .r-jrn").forEach(function (li) {
          var match = t === "all" || li.getAttribute("data-jtype") === t;
          li.classList.toggle("is-filtered-type", !match);
        });
      });
    });
  }

  /* ============================================
     Reading — Shelf scrolling + keyboard
     ============================================ */
  function initShelfNav() {
    var row = document.querySelector("[data-shelf-row]");
    var prev = document.querySelector("[data-shelf-prev]");
    var next = document.querySelector("[data-shelf-next]");
    if (!row) return;

    var step = 240;
    if (prev) prev.addEventListener("click", function () { row.scrollBy({ left: -step, behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { row.scrollBy({ left:  step, behavior: "smooth" }); });
  }

  function initShelfKeyboard(state) {
    document.addEventListener("keydown", function (e) {
      // only when on reading page
      if (!document.querySelector("[data-shelf-row]")) return;
      // ignore inside inputs
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      var keys = SHELF.map(function (b) { return b.key; });
      var idx = keys.indexOf(state.currentKey);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        idx = (idx + 1 + keys.length) % keys.length;
        state.select(keys[idx]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        idx = (idx - 1 + keys.length) % keys.length;
        state.select(keys[idx]);
      }
    });
  }

  /* ============================================
     Reading — init
     ============================================ */
  function initReading() {
    if (!document.querySelector("[data-shelf-row]")) return;

    var state = {
      currentKey: null,
      currentArea: "all",
      select: function (key, opts) {
        var b = SHELF.find(function (x) { return x.key === key; });
        if (!b) return;
        this.currentKey = key;
        // highlight spine
        document.querySelectorAll("[data-shelf-row] .r-spine").forEach(function (s) {
          s.classList.toggle("is-active", s.getAttribute("data-key") === key);
        });
        // highlight matching featured cover (if any)
        document.querySelectorAll("[data-featured] .r-cover").forEach(function (c) {
          c.classList.toggle("is-active", c.getAttribute("data-key") === key);
        });
        renderDetail(b);
        // scroll active spine into view within the shelf row (no scrollIntoView)
        if (!opts || opts.scroll !== false) {
          var row = document.querySelector("[data-shelf-row]");
          var active = row && row.querySelector('.r-spine[data-key="' + key + '"]');
          if (row && active) {
            var target = active.offsetLeft - (row.clientWidth / 2) + (active.offsetWidth / 2);
            row.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
          }
        }
      }
    };

    renderFeatured(state);
    renderShelf(state);
    renderWeb();
    // Load any user-added entries from IndexedDB before first render.
    loadUserJournal().then(function () { renderJournal(); });
    initFilters(state);
    initJournalFilters();
    initJournalForm();
    initShelfNav();
    initShelfKeyboard(state);

    // initial counts
    applyFilter("all");

    // initial selection — first book on the shelf
    state.select(SHELF[0].key, { scroll: false });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initActiveNav();
    initReading();
  });
})();
