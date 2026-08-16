from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')
original = text


def replace_once(old: str, new: str, label: str) -> None:
    global text
    if old not in text:
        raise RuntimeError(f'Missing anchor: {label}')
    text = text.replace(old, new, 1)
    print(f'[ok] {label}')


# Repair the manifest-controls insertion. A previous literal replacement left
# the regex backreferences "\\1" and "\\2" in the document, dropping the
# closing table/card markup and nesting every later view inside the home view.
replace_once(
    '''                            </tbody>\\1
                    <div class="tool-actions">''',
    '''                            </tbody>
                        </table>
                    </div>
                    <div class="tool-actions">''',
    'restore table wrapper close',
)
replace_once(
    '''                    </div>
\\2
                <div class="span-5"''',
    '''                    </div>
                </div>

                <!-- Right Parameters Configuration Sidebar -->
                <div class="span-5"''',
    'restore ChronosAudit left-card close',
)

# Navigation and visible labels: plain language, still recognizably the same site.
copy_changes = {
    '>AI Playgrounds</button>': '>Interaction Labs</button>',
    '>Data Geometry</button>': '>Canvas Lab</button>',
    '>About Me</button>': '>Work With Nick</button>',
    'Live Ingestion Sandbox': 'Local Hash &amp; Manifest Demo',
    'Drag &amp; drop file packages here or <span': 'Drag &amp; drop files here or <span',
    '>browse directories</span>': '>browse files</span>',
    '>File Descriptor</th>': '>File</th>',
    '>Allocation</th>': '>Size</th>',
    '>WebCrypto SHA-256 Manifest String</th>': '>SHA-256</th>',
    'Forensic Pitch Oscillator': 'Reference Tone Generator',
    'Target Signal Format': 'Waveform',
    'Target BPM Space:': 'Tempo:',
    '>PCM Pad</span>': '>Audio / synth</span>',
    '>Sub Pulsar</span>': '>Audio / synth</span>',
    '>Sequencer</span>': '>Audio / synth</span>',
    '>Arpeggiator</span>': '>Audio / synth</span>',
    'FFT Frequency Graph': 'Spectrum',
    'Biquad Cutoff:': 'Low-pass cutoff:',
    'Agent Identity Name': 'Agent name',
    'Core Profession Profile': 'Role or profession',
    'Behavior Quirks &amp; Traits': 'Behavior notes',
    'Compiled Instruction State Directive': 'Compiled instruction preview',
    '⏸ Pause Pings': 'Reset Preview',
    'Transmit direct messages into the AIM loop client...': 'Type a short test message...',
    'style="max-w: 48rem;': 'style="max-width: 48rem;',
}
for old, new in copy_changes.items():
    replace_once(old, new, f'copy polish: {old[:38]}')

replace_once(
    '''<button onclick="AudioStemMixer.runPipelineStep('flush')" class="btn-sub" style="font-size: 10px; padding: 4px 8px; margin-top: auto; align-self: flex-start;">Export WAV</button>''',
    '''<button onclick="AudioStemMixer.runPipelineStep('flush')" class="btn-sub" style="font-size: 10px; padding: 4px 8px; margin-top: auto; align-self: flex-start;">Render WAV</button>''',
    'distinguish secondary WAV action',
)

# The mixer toggle stops and restarts sources; call that action what it does.
replace_once(
    "if (btn) btn.textContent = this.active ? 'Pause Mix' : 'Play Mix';",
    "if (btn) btn.textContent = this.active ? 'Stop Mix' : 'Play Mix';",
    'honest mixer transport label',
)

# Reset the deterministic preview instead of exposing a fake pause control.
replace_once(
    "togglePause() { BillingManager.showToast('Ambient pings are disabled in this honest demo.'); },",
    "togglePause() { this.clearFeed(); BillingManager.showToast('Preview reset.'); },",
    'reset-preview behavior',
)

# Make routing explicit and accessible after the malformed nesting repair.
replace_once(
    "document.querySelectorAll('.view-page').forEach(p => p.classList.add('hidden'));\n                targetPage.classList.remove('hidden');",
    "document.querySelectorAll('.view-page').forEach(p => { p.classList.add('hidden'); p.setAttribute('aria-hidden', 'true'); });\n                targetPage.classList.remove('hidden');\n                targetPage.setAttribute('aria-hidden', 'false');",
    'explicit view visibility state',
)

# Avoid the small IndexedDB-open race when someone drops a file immediately.
replace_once(
    "db: null,\n            MAX_FILES: 20,",
    "db: null, dbReady: null,\n            MAX_FILES: 20,",
    'database readiness state',
)
replace_once(
    '''            initDB() {
                const req = indexedDB.open('NickPortfolioForensicDB', 1);
                req.onupgradeneeded = e => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('hashes')) db.createObjectStore('hashes', { keyPath: 'id', autoIncrement: true });
                };
                req.onsuccess = e => { this.db = e.target.result; this.loadSavedRecords(); };
                req.onerror = () => BillingManager.showToast('Local vault could not be opened in this browser.');
            },''',
    '''            initDB() {
                this.dbReady = new Promise((resolve, reject) => {
                    const req = indexedDB.open('NickPortfolioForensicDB', 1);
                    req.onupgradeneeded = e => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains('hashes')) db.createObjectStore('hashes', { keyPath: 'id', autoIncrement: true });
                    };
                    req.onsuccess = e => { this.db = e.target.result; this.loadSavedRecords(); resolve(this.db); };
                    req.onerror = () => { BillingManager.showToast('Local vault could not be opened in this browser.'); reject(req.error); };
                });
                return this.dbReady;
            },''',
    'database readiness promise',
)
replace_once(
    '''                const files = [...fileList];
                if (!files.length) return;
                const available = Math.max(0, this.MAX_FILES - AppState.uploadedFiles.length);''',
    '''                const files = [...fileList];
                if (!files.length) return;
                if (!this.db) {
                    try { await this.dbReady; }
                    catch (_) { return; }
                }
                const available = Math.max(0, this.MAX_FILES - AppState.uploadedFiles.length);''',
    'await local vault before hashing',
)

# Validate the structural bug is actually gone.
if '\\1' in text or '\\2' in text:
    raise RuntimeError('Literal regex backreference remains in HTML')
if text.count('id="page-home"') != 1 or text.count('id="page-mixer"') != 1:
    raise RuntimeError('View IDs are not unique')
if text.index('id="page-mixer"') < text.index('id="page-home"'):
    raise RuntimeError('Unexpected view order')
if text == original:
    raise RuntimeError('No changes made')

path.write_text(text, encoding='utf-8')
print(f'Final polish: {len(original):,} -> {len(text):,} characters')

# Self-clean the one-shot patch files from the review branch.
for helper in (Path('scripts/final_polish.py'), Path('.github/workflows/final-polish.yml')):
    if helper.exists():
        helper.unlink()
        print(f'Removed helper: {helper}')
