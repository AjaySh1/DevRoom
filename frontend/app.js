let editor;
const languageSelect = document.getElementById('language-select');
const convertBtn = document.getElementById('convert-btn');
const debugBtn = document.getElementById('debug-btn');
const qualityBtn = document.getElementById('quality-btn');
let copyBtn = document.getElementById('copy-btn'); // Button for copying code
const output = document.getElementById('output');

// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.27.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'javascript',
    theme: 'vs-dark'
  });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true
  });
});

// Handle code conversion
convertBtn.addEventListener('click', async () => {
  const code = editor.getValue();
  const selectedLanguage = languageSelect.value;

  try {
    toggleOutputLoader(true);
    const response = await fetch('http://localhost:3000/convert-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, targetLanguage: selectedLanguage }),
    });
    const data = await response.json();
    output.innerHTML = `
      <div class="opt1" style="margin-top:-40px;"><button class="copy-btn" id="copy-btn">Copy Code</button></div>
      ${data.convertedCode}
    `;
    copyBtn = document.getElementById('copy-btn');
    copyBtn.addEventListener('click', copyCodeToClipboard);
  } catch (error) {
    output.textContent = 'Error converting code.';
    console.error('Error generating code conversion:', error.message);
  } finally {
    toggleOutputLoader(false);
  }
});

// Handle code debugging
debugBtn.addEventListener('click', async () => {
  const code = editor.getValue();

  try {
    toggleOutputLoader(true);
    const response = await fetch('http://localhost:3000/debug-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    output.innerHTML = `
      <div class="opt1" style="margin-top:-30px;"><button class ="copy-btn" id="copy-btn2" style="margin-top:-500px;">Copy Code</button></div>
      ${data.debuggedCode}
    `;
    copyBtn = document.getElementById('copy-btn2');
    copyBtn.addEventListener('click', copyCodeToClipboard);
  } catch (error) {
    output.textContent = 'Error debugging code.';
    console.error('Error debugging code:', error.message);
  } finally {
    toggleOutputLoader(false);
  }
});

// Handle code quality check
qualityBtn.addEventListener('click', async () => {
  const code = editor.getValue();

  try {
    toggleOutputLoader(true);
    const response = await fetch('http://localhost:3000/check-code-quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    output.textContent = `Checking code quality...:\n${data.qualityReport}`;
  } catch (error) {
    output.textContent = 'Error checking code Complexity.';
    console.error('Error checking code Complexity:', error.message);
  } finally {
    toggleOutputLoader(false);
  }
});

// Copies cleaned code from output to clipboard
function copyCodeToClipboard() {
  let codeToCopy = output.textContent;
  let lines = codeToCopy.split('\n');
  let lastBacktickIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('```')) {
      lastBacktickIndex = i;
    }
  }
  if (lastBacktickIndex !== -1) {
    lines = lines.slice(0, lastBacktickIndex + 1);
  }
  if (lines.length > 2) {
    lines = lines.slice(2, -1);
  } else {
    lines = [];
  }
  lines = lines.filter(line => !line.includes('```') && line !== "Copy Code");
  codeToCopy = lines.join('\n');
  if (codeToCopy) {
    navigator.clipboard.writeText(codeToCopy).then(() => {
      alert('Code copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  } else {
    alert('No code found to copy.');
  }
}

// Show or hide the output loader
function toggleOutputLoader(show) {
  const outputLoader = document.getElementById('output-loader');
  outputLoader.style.display = show ? 'block' : 'none';
}