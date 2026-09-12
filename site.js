/* Progressive enhancement only. Content, download links and legal pages remain static. */
(() => {
  const company = document.getElementById('company-details');
  const companyLinks = [...document.querySelectorAll('[data-company-link]')];
  const openCompany = () => {
    if (company) company.open = true;
  };
  if (company) {
    const syncCompany = () => companyLinks.forEach(link => link.setAttribute('aria-expanded', String(company.open)));
    company.addEventListener('toggle', syncCompany);
    companyLinks.forEach(link => link.addEventListener('click', event => {
      if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) openCompany();
    }));
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#company') openCompany();
    });
    if (window.location.hash === '#company') openCompany();
    syncCompany();
  }

  document.querySelectorAll('[role="tablist"]').forEach(list => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (selected, focus = false) => {
      tabs.forEach(tab => {
        const active = tab === selected;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        tab.toggleAttribute('data-active', active);
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = !active;
      });
      if (focus) selected.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(tabs[next], true);
      });
    });
  });

  const dialogTriggers = new WeakMap();
  document.querySelectorAll('[data-film-open]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      const dialog = document.getElementById(trigger.dataset.filmOpen);
      if (!dialog || typeof dialog.showModal !== 'function' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      dialogTriggers.set(dialog, trigger);
      dialog.showModal();
      document.body.classList.add('film-open');
    });
  });
  document.querySelectorAll('dialog.product-film-dialog').forEach(dialog => {
    dialog.querySelector('[data-film-close]')?.addEventListener('click', () => dialog.close());
    let backdropPress = false;
    const isOutside = event => {
      const box = dialog.getBoundingClientRect();
      return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    };
    dialog.addEventListener('pointerdown', event => { backdropPress = event.target === dialog && isOutside(event); });
    dialog.addEventListener('click', event => {
      if (backdropPress && event.target === dialog && isOutside(event)) dialog.close();
      backdropPress = false;
    });
    dialog.addEventListener('close', () => {
      dialog.querySelector('video')?.pause();
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('film-open');
      dialogTriggers.get(dialog)?.focus({preventScroll:true});
    });
  });

  document.querySelectorAll('video').forEach(video => {
    const reportError = () => {
      if (video.nextElementSibling?.classList.contains('media-error')) return;
      const output = document.createElement('output');
      output.className = 'media-error';
      output.setAttribute('role', 'status');
      output.append('動画を読み込めませんでした。');
      const link = document.createElement('a');
      link.href = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src') || '';
      link.textContent = '動画を直接開く';
      link.target = '_blank';
      link.rel = 'noreferrer';
      output.append(link);
      video.after(output);
    };
    video.addEventListener('error', reportError);
    video.querySelectorAll('source').forEach(source => source.addEventListener('error', reportError));
    if (video.error) reportError();
  });
})();
