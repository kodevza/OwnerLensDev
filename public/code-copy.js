(() => {
  const languages = new Map([
    ['language-pwsh', 'PowerShell'],
    ['language-powershell', 'PowerShell'],
    ['language-sh', 'Shell'],
    ['language-bash', 'Shell'],
    ['language-zsh', 'Shell'],
    ['language-python', 'Python'],
    ['language-py', 'Python']
  ]);

  function labelFor(code) {
    for (const className of code.classList) {
      if (languages.has(className)) return languages.get(className);
    }
    return null;
  }

  function enhanceCodeBlocks() {
    document.querySelectorAll('pre > code').forEach((code) => {
      const label = labelFor(code);
      if (!label) return;
      const pre = code.parentElement;
      if (!pre || pre.parentElement?.dataset?.codeCopy === 'true') return;

      const wrapper = document.createElement('div');
      wrapper.className = 'code-copy';
      wrapper.dataset.codeCopy = 'true';

      const bar = document.createElement('div');
      bar.className = 'code-copy__bar';

      const language = document.createElement('span');
      language.className = 'code-copy__language';
      language.textContent = label;

      const button = document.createElement('button');
      button.className = 'code-copy__button';
      button.type = 'button';
      button.dataset.copyButton = 'true';
      button.textContent = 'Copy';

      bar.append(language, button);
      pre.replaceWith(wrapper);
      wrapper.append(bar, pre);
    });
  }

  document.addEventListener('DOMContentLoaded', enhanceCodeBlocks);

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-button]');
    if (!button) return;
    const block = button.closest('[data-code-copy]');
    const code = block && block.querySelector('code');
    if (!code) return;
    const previousText = button.textContent;
    try {
      await navigator.clipboard.writeText(code.innerText);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Failed';
    }
    window.setTimeout(() => { button.textContent = previousText; }, 1400);
  });
})();
