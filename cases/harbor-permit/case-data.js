(() => {
  "use strict";
  const base = "./cases/harbor-permit/data/";
  for (const file of ["core.js", "sources.js", "assertions.js", "events.js", "flags.js"]) {
    document.write(`<script src="${base}${file}"><\/script>`);
  }
  document.write(`<script>window.CHRONOS_CASE={...window.CHRONOS_CASE_CORE,sources:window.CHRONOS_CASE_SOURCES||[],assertions:window.CHRONOS_CASE_ASSERTIONS||[],events:window.CHRONOS_CASE_EVENTS||[],contradictions:window.CHRONOS_CASE_FLAGS?.contradictions||[],anomalies:window.CHRONOS_CASE_FLAGS?.anomalies||[]};<\/script>`);
})();
