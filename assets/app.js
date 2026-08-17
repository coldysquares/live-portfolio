(() => {
  "use strict";

  const caseData = window.CHRONOS_CASE;
  if (!caseData) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const maps = {
    events: new Map(caseData.events.map((item) => [item.id, item])),
    assertions: new Map(caseData.assertions.map((item) => [item.id, item])),
    sources: new Map(caseData.sources.map((item) => [item.id, item])),
    contradictions: new Map(caseData.contradictions.map((item) => [item.id, item])),
    anomalies: new Map(caseData.anomalies.map((item) => [item.id, item]))
  };

  const state = {
    selectedEventId: readHashEvent() || caseData.events[0]?.id || null,
    selectedAssertionId: null,
    filter: "all",
    query: ""
  };

  const els = {
    timeline: $("#timelineList"),
    timelineCount: $("#timelineCount"),
    eventPane: $("#eventContent"),
    evidencePane: $("#evidenceContent"),
    search: $("#caseSearch"),
    filters: $("#filterGroup"),
    downloadManifest: $("#downloadManifest"),
    printReport: $("#printReport"),
    openCase: $("#openCaseButton")
  };

  function readHashEvent() {
    const match = window.location.hash.match(/^#event=(E\d+)$/);
    return match && maps.events.has(match[1]) ? match[1] : null;
  }

  function writeHash(eventId) {
    const next = `#event=${eventId}`;
    if (window.location.hash !== next) history.replaceState(null, "", next);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function labelKind(kind) {
    return ({
      explicit_text: "Explicit text",
      embedded_metadata: "Embedded metadata",
      relative_reference: "Relative date",
      unresolved: "Unresolved"
    })[kind] || kind.replaceAll("_", " ");
  }

  function laneLabel(lane) {
    return ({
      observed: "Observed",
      conflict: "Conflict",
      relative: "Relative",
      metadata: "Metadata",
      unresolved: "Unresolved"
    })[lane] || lane;
  }

  function formatDate(value) {
    if (!value) return "Date unresolved";
    const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  }

  function visibleEvents() {
    const q = state.query.toLowerCase().trim();
    return caseData.events.filter((event) => {
      const matchesFilter =
        state.filter === "all" ||
        (state.filter === "flags" && (event.contradictionIds.length || event.anomalyIds.length)) ||
        event.lane === state.filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      const assertions = event.assertionIds.map((id) => maps.assertions.get(id)).filter(Boolean);
      const sources = assertions.map((item) => maps.sources.get(item.sourceId)).filter(Boolean);
      const haystack = [
        event.title,
        event.summary,
        event.displayDate,
        ...assertions.map((item) => item.claim),
        ...sources.flatMap((source) => [source.label, source.filename])
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => {
      if (!a.date && !b.date) return a.id.localeCompare(b.id);
      if (!a.date) return 1;
      if (!b.date) return -1;
      const byDate = a.date.localeCompare(b.date);
      return byDate || a.id.localeCompare(b.id);
    });
  }

  function renderTimeline() {
    const events = visibleEvents();
    els.timelineCount.textContent = `${events.length} shown`;
    if (!events.length) {
      els.timeline.innerHTML = '<li class="timeline-empty">No events match that view.</li>';
      return;
    }
    els.timeline.innerHTML = events.map((event) => {
      const badges = [
        event.lane !== "observed" ? `<span class="badge ${escapeHtml(event.lane)}">${escapeHtml(laneLabel(event.lane))}</span>` : "",
        event.contradictionIds.length ? `<span class="badge conflict">${event.contradictionIds.length} conflict${event.contradictionIds.length === 1 ? "" : "s"}</span>` : "",
        event.anomalyIds.length ? `<span class="badge anomaly">${event.anomalyIds.length} anomaly</span>` : ""
      ].filter(Boolean).join("");
      return `
        <li>
          <button
            class="event-row"
            type="button"
            data-event-id="${escapeHtml(event.id)}"
            data-lane="${escapeHtml(event.lane)}"
            aria-current="${String(event.id === state.selectedEventId)}"
          >
            <time datetime="${escapeHtml(event.date || "")}">${escapeHtml(event.displayDate)}</time>
            <span class="event-dot" aria-hidden="true"></span>
            <span class="event-copy">
              <strong>${escapeHtml(event.title)}</strong>
              <small>${escapeHtml(event.summary)}</small>
              ${badges ? `<span class="event-badges">${badges}</span>` : ""}
            </span>
          </button>
        </li>`;
    }).join("");
  }

  function selectEvent(eventId, { focus = false } = {}) {
    const event = maps.events.get(eventId);
    if (!event) return;
    state.selectedEventId = eventId;
    if (!event.assertionIds.includes(state.selectedAssertionId)) {
      state.selectedAssertionId = event.assertionIds[0] || null;
    }
    writeHash(eventId);
    renderTimeline();
    renderEvent();
    renderEvidence();
    if (focus) {
      const target = $("#eventContent");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderEvent() {
    const event = maps.events.get(state.selectedEventId);
    if (!event) return;
    const assertions = event.assertionIds.map((id) => maps.assertions.get(id)).filter(Boolean);
    const contradictionCards = event.contradictionIds.map((id) => renderFlag(maps.contradictions.get(id), "conflict")).join("");
    const anomalyCards = event.anomalyIds.map((id) => renderFlag(maps.anomalies.get(id), "anomaly")).join("");

    els.eventPane.innerHTML = `
      <p class="event-date">${escapeHtml(event.displayDate)} · ${escapeHtml(laneLabel(event.lane))} evidence</p>
      <h3>${escapeHtml(event.title)}</h3>
      <p class="event-summary">${escapeHtml(event.summary)}</p>
      <div class="authority-chain" aria-label="Evidence authority chain">
        <span>event</span><span>assertion</span><span>exact lines</span><span>original file</span><span>provenance</span>
      </div>
      <p class="subhead">Supporting assertions</p>
      <div class="assertion-list">
        ${assertions.map((assertion) => renderAssertion(assertion)).join("")}
      </div>
      ${(contradictionCards || anomalyCards) ? `
        <p class="subhead">Flags that remain visible</p>
        <div class="flag-stack">${contradictionCards}${anomalyCards}</div>
      ` : ""}
    `;
  }

  function renderAssertion(assertion) {
    const source = maps.sources.get(assertion.sourceId);
    return `
      <button
        class="assertion-card"
        type="button"
        data-assertion-id="${escapeHtml(assertion.id)}"
        data-kind="${escapeHtml(assertion.evidenceKind)}"
        aria-current="${String(assertion.id === state.selectedAssertionId)}"
      >
        <span class="assertion-kind" aria-hidden="true"></span>
        <span>
          <strong>${escapeHtml(assertion.claim)}</strong>
          <small>${escapeHtml(source?.label || "Unknown source")} · lines ${assertion.lineStart}-${assertion.lineEnd} · ${escapeHtml(labelKind(assertion.evidenceKind))}</small>
        </span>
        <span class="confidence">${Math.round(assertion.confidence * 100)}%</span>
      </button>`;
  }

  function renderFlag(flag, kind) {
    if (!flag) return "";
    const claims = flag.assertionIds
      .map((id) => maps.assertions.get(id))
      .filter(Boolean)
      .slice(0, 3)
      .map((assertion) => {
        const source = maps.sources.get(assertion.sourceId);
        return `<article class="compare-claim"><b>${escapeHtml(source?.label || assertion.sourceId)}</b><p>${escapeHtml(assertion.claim)}</p></article>`;
      }).join("");
    return `
      <article class="flag-card ${kind}">
        <div class="flag-meta">${escapeHtml(kind)} · ${escapeHtml(flag.severity)} · ${escapeHtml(flag.status.replaceAll("_", " "))}</div>
        <strong>${escapeHtml(flag.title)}</strong>
        <p>${escapeHtml(flag.summary)}</p>
        ${claims ? `<div class="compare-grid">${claims}</div>` : ""}
      </article>`;
  }

  function renderEvidence() {
    const assertion = maps.assertions.get(state.selectedAssertionId);
    if (!assertion) {
      els.evidencePane.innerHTML = '<p class="timeline-empty">Select an assertion to inspect its evidence.</p>';
      return;
    }
    const source = maps.sources.get(assertion.sourceId);
    const event = maps.events.get(assertion.eventId);
    if (!source || !event) return;

    const lines = source.contentLines.map((line, index) => {
      const lineNumber = index + 1;
      const highlighted = lineNumber >= assertion.lineStart && lineNumber <= assertion.lineEnd;
      return `<li class="source-line${highlighted ? " highlight" : ""}"><span class="line-number">${String(lineNumber).padStart(2, "0")}</span><code>${line ? escapeHtml(line) : "&nbsp;"}</code></li>`;
    }).join("");

    els.evidencePane.innerHTML = `
      <div class="evidence-meta-column">
        <p class="source-label">Exact supporting evidence</p>
        <h3 class="source-title">${escapeHtml(source.label)}</h3>
        <p class="source-meta">${escapeHtml(source.filename)} · ${escapeHtml(source.fileType)} · ${source.byteLength.toLocaleString()} bytes</p>
        <div class="claim-box">
          <p>${escapeHtml(assertion.claim)}</p>
          <small>${escapeHtml(labelKind(assertion.evidenceKind))} · ${escapeHtml(assertion.extractionMethod)} · review: ${escapeHtml(assertion.reviewStatus.replaceAll("_", " "))}</small>
        </div>
        <div class="evidence-actions">
          <button class="button small" type="button" data-open-source="${escapeHtml(source.id)}">Open readable source</button>
          <button class="button quiet small" type="button" data-copy-claim>Copy claim</button>
        </div>
        <details class="provenance-details">
          <summary>File and processing provenance</summary>
          <dl class="provenance-grid">
            <div class="provenance-row"><dt>Event</dt><dd>${escapeHtml(event.id)} · ${escapeHtml(event.title)}</dd></div>
            <div class="provenance-row"><dt>Assertion</dt><dd>${escapeHtml(assertion.id)}</dd></div>
            <div class="provenance-row"><dt>Source location</dt><dd>lines ${assertion.lineStart}-${assertion.lineEnd}</dd></div>
            <div class="provenance-row"><dt>SHA-256</dt><dd>${escapeHtml(source.sha256)}</dd></div>
            <div class="provenance-row"><dt>File modified</dt><dd>${escapeHtml(source.filesystemModifiedAt || "not recorded")}</dd></div>
            <div class="provenance-row"><dt>Embedded modified</dt><dd>${escapeHtml(source.embeddedModifiedAt || "not recorded")}</dd></div>
            <div class="provenance-row"><dt>Imported</dt><dd>${escapeHtml(source.importedAt)}</dd></div>
            <div class="provenance-row"><dt>Processing run</dt><dd>${escapeHtml(caseData.processingRun.id)} · deterministic fixture · no model call</dd></div>
          </dl>
        </details>
      </div>
      <div class="evidence-main">
        <div class="source-viewer">
          <div class="source-viewer-head"><span>${escapeHtml(source.filename)}</span><span>lines ${assertion.lineStart}-${assertion.lineEnd} highlighted</span></div>
          <ol class="source-lines">${lines}</ol>
        </div>
      </div>
    `;
    requestAnimationFrame(() => {
      const first = $(".source-line.highlight", els.evidencePane);
      first?.scrollIntoView({ block: "center" });
    });
  }

  function setAssertion(assertionId, { focus = false } = {}) {
    if (!maps.assertions.has(assertionId)) return;
    state.selectedAssertionId = assertionId;
    renderEvent();
    renderEvidence();
    if (focus) $("#evidencePane")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openReadableSource(sourceId) {
    const source = maps.sources.get(sourceId);
    if (!source) return;
    const lines = source.contentLines.map((line, index) =>
      `<li><span>${String(index + 1).padStart(2, "0")}</span><code>${line ? escapeHtml(line) : "&nbsp;"}</code></li>`
    ).join("");
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(source.label)} - ChronosAudit sample</title><style>body{margin:0;background:#f6f1e7;color:#182126;font-family:system-ui,sans-serif}main{width:min(960px,calc(100% - 32px));margin:0 auto;padding:32px 0 64px}h1{font-family:Georgia,serif}.meta{color:#6d716b;font-size:13px}.hash{overflow-wrap:anywhere}ol{list-style:none;padding:0;border:1px solid #c9c2b5;background:#fff}li{display:grid;grid-template-columns:52px 1fr;border-bottom:1px solid #e4ded3}li:last-child{border-bottom:0}li span{padding:8px 10px;color:#8b857a;text-align:right;background:#f3eee4}code{padding:8px 12px;white-space:pre-wrap;font:13px/1.5 ui-monospace,monospace}</style></head><body><main><h1>${escapeHtml(source.label)}</h1><p class="meta">${escapeHtml(source.filename)} · ${escapeHtml(source.fileType)} · ${source.byteLength.toLocaleString()} bytes</p><p class="meta hash">SHA-256 ${escapeHtml(source.sha256)}</p><ol>${lines}</ol></main></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function downloadJson(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  document.addEventListener("click", (event) => {
    const eventButton = event.target.closest("[data-event-id]");
    if (eventButton) {
      selectEvent(eventButton.dataset.eventId, { focus: window.innerWidth < 861 });
      return;
    }
    const assertionButton = event.target.closest("[data-assertion-id]");
    if (assertionButton) {
      setAssertion(assertionButton.dataset.assertionId, { focus: window.innerWidth < 861 });
      return;
    }
    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) {
      state.filter = filterButton.dataset.filter;
      $$('[data-filter]', els.filters).forEach((button) => button.setAttribute("aria-pressed", String(button === filterButton)));
      renderTimeline();
      const visible = visibleEvents();
      if (visible.length && !visible.some((item) => item.id === state.selectedEventId)) selectEvent(visible[0].id);
      return;
    }
    const openSourceButton = event.target.closest("[data-open-source]");
    if (openSourceButton) {
      openReadableSource(openSourceButton.dataset.openSource);
      return;
    }
    if (event.target.closest("[data-copy-claim]")) {
      const assertion = maps.assertions.get(state.selectedAssertionId);
      if (!assertion) return;
      navigator.clipboard?.writeText(assertion.claim).then(() => {
        const button = event.target.closest("[data-copy-claim]");
        const prior = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = prior; }, 1200);
      }).catch(() => {});
    }
  });

  els.search?.addEventListener("input", () => {
    state.query = els.search.value;
    renderTimeline();
  });
  els.downloadManifest?.addEventListener("click", () => {
    downloadJson("chronosaudit-harbor-permit-case.json", caseData);
  });
  els.printReport?.addEventListener("click", () => window.print());
  els.openCase?.addEventListener("click", () => {
    $("#case")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  window.addEventListener("hashchange", () => {
    const id = readHashEvent();
    if (id && id !== state.selectedEventId) selectEvent(id);
  });

  // Load from the checked-in fixture only. No file is requested from the visitor.
  state.selectedAssertionId = maps.events.get(state.selectedEventId)?.assertionIds[0] || null;
  renderTimeline();
  renderEvent();
  renderEvidence();
})();
