// Production manual JS module in scripts directory
module.exports = `
document.addEventListener('DOMContentLoaded', () => {
  // Theme Manager
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('terminal_v7_theme') || (prefersDark ? 'dark' : 'light');
  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('terminal_v7_theme', theme);
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' 
        ? '<span style="font-size:1rem;">☀️</span> Light Mode' 
        : '<span style="font-size:1rem;">🌙</span> Dark Mode';
    }
  }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Toast Functionality
  const toast = document.getElementById('toast');
  window.showToast = function(msg) {
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  };

  // Copy-to-Clipboard
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const textToCopy = targetId 
        ? document.getElementById(targetId)?.innerText 
        : btn.parentElement.innerText.replace('Copy Prompt', '').replace('Copied!', '').trim();
      
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const original = btn.innerText;
          btn.innerText = '✓ Copied!';
          window.showToast('Copied to clipboard!');
          setTimeout(() => btn.innerText = original, 1800);
        });
      }
    });
  });

  // Accordion Expand / Collapse All
  const expandAllBtn = document.getElementById('expand-all-btn');
  let allExpanded = false;
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      allExpanded = !allExpanded;
      document.querySelectorAll('details.prompt-accordion').forEach(d => {
        d.open = allExpanded;
      });
      expandAllBtn.innerText = allExpanded ? 'Collapse All' : 'Expand All';
    });
  }

  // Search Filter
  const searchInput = document.getElementById('manual-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.nav-link').forEach(link => {
        const text = link.innerText.toLowerCase();
        link.style.display = text.includes(q) ? 'block' : 'none';
      });
      document.querySelectorAll('details.prompt-accordion').forEach(acc => {
        const title = acc.querySelector('summary')?.innerText.toLowerCase() || '';
        acc.style.display = title.includes(q) ? 'block' : 'none';
      });
    });
  }

  // Scrollspy via IntersectionObserver
  const sections = document.querySelectorAll('section[id], details.prompt-accordion[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));
});
`;
