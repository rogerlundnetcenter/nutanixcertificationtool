// Placeholder — quiz app entry point (Sprint 2)
console.log('CertStudy quiz-app loaded');

async function init() {
  const version = await window.certStudy.app.getVersion();
  const label = document.getElementById('version-label');
  if (label) {
    label.textContent = `v${version.version} (${version.platform})`;
  }
}

document.addEventListener('DOMContentLoaded', init);
