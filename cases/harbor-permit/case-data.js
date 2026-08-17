window.CHRONOS_CASE = {
  ...window.CHRONOS_CASE_CORE,
  sources: window.CHRONOS_CASE_SOURCES || [],
  assertions: window.CHRONOS_CASE_ASSERTIONS || [],
  events: window.CHRONOS_CASE_EVENTS || [],
  contradictions: window.CHRONOS_CASE_FLAGS?.contradictions || [],
  anomalies: window.CHRONOS_CASE_FLAGS?.anomalies || []
};
