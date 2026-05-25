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
      desc: "The defining account of how 'behavioural surplus' became the most valuable commodity of the digital economy. Long, dense, and worth every page.",
      annot: "Anyone doing data protection work without an opinion on Zuboff is missing the deepest argument about why this profession exists.",
      find: "https://www.hive.co.uk/Product/Shoshana-Zuboff/The-Age-of-Surveillance-Capitalism/22863487"
    },
    {
      key: "privacy-design",
      title: "Privacy by Design — The 7 Foundational Principles",
      short: "Privacy by Design · 7 Pri…",
      author: "Ann Cavoukian",
      authorShort: "Cavouk…",
      year: "2011",
      format: "Free PDF",
      area: "dp",
      type: "Paper",
      spine: "lavender",
      featured: true,
      coverVariant: "paper",
      desc: "The original framework arguing that privacy must be embedded into systems by default, not bolted on after the fact.",
      annot: "The intellectual root of UK GDPR Article 25. If you only read one short paper this year, this is it.",
      find: "https://privacysecurityacademy.com/wp-content/uploads/2020/08/PbD-Principles-and-Mapping.pdf"
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
      desc: "A taxonomy of what AI can actually do, what it cannot, and how to tell the difference under marketing pressure.",
      annot: "Required reading before writing an AI governance policy. Cuts through vendor noise.",
      find: "https://press.princeton.edu/books/hardcover/9780691249131/ai-snake-oil"
    },
    {
      key: "nist-rmf",
      title: "AI Risk Management Framework (AI RMF 1.0)",
      short: "NIST AI Risk Management Fra…",
      author: "NIST",
      authorShort: "NIST",
      year: "2023",
      format: "Free PDF",
      area: "ai",
      type: "Standard",
      spine: "lavender",
      desc: "Voluntary framework for governing, mapping, measuring, and managing AI risk. Useful counterpart to the EU AI Act for organisations operating in both jurisdictions.",
      annot: "The closest thing to a vendor-neutral common vocabulary for AI risk that anyone has agreed on.",
      find: "https://www.nist.gov/itl/ai-risk-management-framework"
    },
    {
      key: "iso-27001",
      title: "ISO/IEC 27001:2022 — Information Security Management",
      short: "ISO/IEC 27001:2022",
      author: "ISO/IEC",
      authorShort: "ISO",
      year: "2022",
      format: "Standard",
      area: "sec",
      type: "Standard",
      spine: "lavender",
      desc: "The international standard for information security management systems. Annex A controls form the spine of most enterprise security programmes.",
      annot: "Knowing 27001 well makes data protection conversations easier. It's the language security speaks.",
      find: "https://www.iso.org/standard/27001"
    },
    {
      key: "fatf",
      title: "UK Mutual Evaluation Report",
      short: "FATF UK Mutual Evaluation",
      author: "Financial Action Task Force",
      authorShort: "FATF",
      year: "2018",
      format: "Free PDF",
      area: "fc",
      type: "Report",
      spine: "slate-blue",
      featured: true,
      coverVariant: "report",
      desc: "The international assessment of the UK's anti-money-laundering regime. Reads as the assessors' view of where the UK sits relative to global standards.",
      annot: "If you want to understand financial-crime regulation in the UK, start where the international assessors did.",
      find: "https://www.fatf-gafi.org/en/publications/Mutualevaluations/Mer-united-kingdom-2018.html"
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
    }
  ];

  /* ============================================
     Reading — Featured covers
     ============================================ */
  function renderFeatured(state) {
    var row = document.querySelector("[data-featured]");
    if (!row) return;
    row.innerHTML = "";
    SHELF.filter(function (b) { return b.featured; }).forEach(function (b) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "r-cover r-cover--" + (b.coverVariant || "book-cream");
      d.setAttribute("data-key", b.key);
      d.setAttribute("data-area", b.area);
      d.setAttribute("aria-label", "Open " + b.title);
      d.innerHTML =
        '<div class="r-cover__kind">' + b.type + '</div>' +
        '<h3 class="r-cover__title">' + b.short + '</h3>' +
        '<p class="r-cover__author">' + b.author + '</p>' +
        '<p class="r-cover__meta">' + b.year + ' · ' + b.format + '</p>';
      d.addEventListener("click", function () { state.select(b.key); });
      row.appendChild(d);

      // caption block under each cover
      var cap = document.createElement("div");
      cap.className = "r-cover__caption";
      cap.innerHTML =
        '<p class="r-cover__caption-title">' + b.short + '</p>' +
        '<p class="r-cover__caption-author">' + b.author + '</p>';
      // attach caption inside the cover-container's wrapper? Simpler: put it visually under each cover by appending after.
    });
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
      '<div class="r-cover r-cover--' + (b.coverVariant || "book-cream") + ' r-detail__cover" aria-hidden="true">' +
        '<div class="r-cover__kind">' + b.type + '</div>' +
        '<h3 class="r-cover__title">' + b.short + '</h3>' +
        '<p class="r-cover__author">' + b.author + '</p>' +
        '<p class="r-cover__meta">' + b.year + ' · ' + b.format + '</p>' +
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
    initFilters(state);
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
