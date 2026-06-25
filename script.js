// ===== Ano no rodapé =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Menu mobile =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function closeMenu() {
  navLinks.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', closeMenu)
);

// Fecha o menu ao clicar fora
document.addEventListener('click', (e) => {
  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !navToggle.contains(e.target)
  ) {
    closeMenu();
  }
});

// ===== Sombra na navbar ao rolar =====
const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Reveal on scroll =====
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('visible'));
}

// ===== Formulário de contato =====
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

const setStatus = (msg, type) => {
  status.textContent = msg;
  status.className = 'form-status ' + (type || '');
};

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// E-mail de destino (usado no fallback caso o Formspree não esteja configurado)
const CONTACT_EMAIL = 'michaelprimom@gmail.com';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = form.name;
  const email = form.email;
  const message = form.message;
  let ok = true;

  [name, email, message].forEach((field) => {
    const empty = !field.value.trim();
    const badEmail = field === email && field.value.trim() && !isEmail(field.value.trim());
    field.classList.toggle('invalid', empty || badEmail);
    if (empty || badEmail) ok = false;
  });

  if (!ok) {
    setStatus('Por favor, preencha todos os campos com um e-mail válido.', 'error');
    return;
  }

  const action = form.getAttribute('action') || '';
  const configured = action.includes('formspree.io') && !action.includes('SEU_FORM_ID');

  // Fallback: enquanto o Formspree não estiver configurado, abre o app de e-mail.
  if (!configured) {
    const subject = encodeURIComponent(`Contato pelo portfólio — ${name.value.trim()}`);
    const body = encodeURIComponent(
      `Nome: ${name.value.trim()}\nE-mail: ${email.value.trim()}\n\n${message.value.trim()}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus('Abrindo seu app de e-mail para concluir o envio...', 'success');
    return;
  }

  // Envia direto para o seu e-mail via Formspree, sem sair da página.
  const submitBtn = form.querySelector('button[type="submit"]');
  const original = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  setStatus('Enviando sua mensagem...', '');

  try {
    const res = await fetch(action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });

    if (res.ok) {
      setStatus('Mensagem enviada com sucesso! Responderei em breve. 🚀', 'success');
      form.reset();
    } else {
      setStatus('Não foi possível enviar agora. Tente novamente ou me chame nas redes.', 'error');
    }
  } catch (err) {
    setStatus('Erro de conexão. Verifique sua internet e tente de novo.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = original;
  }
});

// Remove o estado de erro ao digitar
form.querySelectorAll('input, textarea').forEach((field) =>
  field.addEventListener('input', () => field.classList.remove('invalid'))
);
