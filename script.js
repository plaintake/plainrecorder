const pageShell = document.querySelector('#site-shell');
const commandDialog = document.querySelector('#command-dialog');
const commandTrigger = document.querySelector('#command-trigger');
const commandClose = document.querySelector('#command-close');
const commandInput = document.querySelector('#command-input');
const commandField = document.querySelector('#command-field');
const commandEmpty = document.querySelector('#command-empty');
const commandStatus = document.querySelector('#command-status');
const commandItems = [...document.querySelectorAll('.command-item')];
let activeIndex = 0;
let commandOpener = null;

function visibleCommandItems() {
  return commandItems.filter((item) => !item.hidden);
}

function setActiveItem(index) {
  const items = visibleCommandItems();
  if (!items.length) return;
  activeIndex = (index + items.length) % items.length;
  commandItems.forEach((item) => {
    const active = item === items[activeIndex];
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
  });
  items[activeIndex].scrollIntoView({ block: 'nearest' });
}

function filterCommands() {
  const query = commandInput.value.trim().toLocaleLowerCase();
  commandItems.forEach((item) => {
    item.hidden = !item.dataset.label.toLocaleLowerCase().includes(query);
  });
  const count = visibleCommandItems().length;
  commandEmpty.hidden = count !== 0;
  commandField.dataset.state = query ? (count === 0 ? 'error' : 'success') : '';
  commandStatus.textContent = `${count} ${count === 1 ? 'destination' : 'destinations'}`;
  activeIndex = 0;
  setActiveItem(0);
}

function openCommands(opener = document.activeElement) {
  if (commandDialog.open) return;
  commandOpener = opener;
  commandDialog.showModal();
  pageShell.inert = true;
  commandInput.value = '';
  filterCommands();
  requestAnimationFrame(() => commandInput.focus());
}

function closeCommands() {
  if (!commandDialog.open) return;
  commandDialog.close();
}

commandTrigger?.addEventListener('click', () => openCommands(commandTrigger));
commandClose?.addEventListener('click', closeCommands);
commandInput?.addEventListener('input', filterCommands);

commandInput?.addEventListener('keydown', (event) => {
  const items = visibleCommandItems();
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setActiveItem(activeIndex + 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    setActiveItem(activeIndex - 1);
  } else if (event.key === 'Enter' && items[activeIndex]) {
    event.preventDefault();
    items[activeIndex].click();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeCommands();
  }
});

commandDialog?.addEventListener('click', (event) => {
  const bounds = commandDialog.getBoundingClientRect();
  const outside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;
  if (outside) closeCommands();
});

commandDialog?.addEventListener('close', () => {
  pageShell.inert = false;
  commandField.dataset.state = '';
  commandOpener?.focus({ preventScroll: true });
});

commandItems.forEach((item) => item.addEventListener('click', closeCommands));

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
    event.preventDefault();
    if (commandDialog.open) closeCommands();
    else openCommands();
  }
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection?.saveData === true;
const demoVideo = document.querySelector('#product-demo');

if (reduceMotion.matches || saveData) {
  demoVideo?.pause();
  demoVideo?.removeAttribute('autoplay');
}

const revealTarget = document.querySelector('[data-reveal]');
if (revealTarget) {
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealTarget.classList.add('is-in');
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        revealTarget.classList.add('is-in');
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(revealTarget);
  }
}

const typeTarget = document.querySelector('[data-type-command]');
if (typeTarget) {
  const finalText = typeTarget.dataset.typeCommand;
  if (reduceMotion.matches) {
    typeTarget.textContent = finalText;
  } else {
    let index = 0;
    const typeNext = () => {
      index += 1;
      typeTarget.textContent = finalText.slice(0, index);
      if (index < finalText.length) window.setTimeout(typeNext, 28);
    };
    window.setTimeout(typeNext, 180);
  }
}
