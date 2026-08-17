window.CHRONOS_CASE_FLAGS = {
  "contradictions": [
    {
      "id": "C01",
      "title": "Retain vote vs claimed removal authorization",
      "type": "authority_conflict",
      "severity": "high",
      "status": "unresolved",
      "assertionIds": ["A03", "A04", "A10"],
      "summary": "The committee record says retain; counsel says removal was authorized the same day; records staff later says no signed authorization was found."
    },
    {
      "id": "C02",
      "title": "Public 'no material change' statement vs documented deletion",
      "type": "public_statement_conflict",
      "severity": "high",
      "status": "unresolved",
      "assertionIds": ["A06", "A07", "A08"],
      "summary": "The revision evidence records removal on February 8, while the February 12 notice says no material environmental condition changed."
    },
    {
      "id": "C03",
      "title": "'Never contained' claim vs Draft V1",
      "type": "historical_claim_conflict",
      "severity": "high",
      "status": "confirmed",
      "assertionIds": ["A01", "A13"],
      "summary": "The March 1 press release denies the existence of a requirement that is visible in the January 12 draft."
    }
  ],
  "anomalies": [
    {
      "id": "M01",
      "title": "Final file predates formal approval",
      "type": "metadata_sequence",
      "severity": "medium",
      "status": "needs_review",
      "assertionIds": ["A09", "A11", "A12"],
      "summary": "The final permit's embedded modification date is February 9, four days before board approval and six days before the issued date printed on the document."
    }
  ]
};
