// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
    toggle.addEventListener('click', () => {
        const open = nav.getAttribute('data-open') === 'true';
        nav.setAttribute('data-open', String(!open));
        toggle.setAttribute('aria-expanded', String(!open));
    });
}

// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Simple carousel controls
const track = document.getElementById('testimonialTrack');
const prev = document.querySelector('.carousel-btn.prev');
const next = document.querySelector('.carousel-btn.next');
function scrollBySlide(dir) {
    if (!track) return;
    const width = track.getBoundingClientRect().width;
    track.scrollBy({ left: dir * width, behavior: 'smooth' });
}
if (prev) prev.addEventListener('click', () => scrollBySlide(-1));
if (next) next.addEventListener('click', () => scrollBySlide(1));

// Enhanced form handler: client-side validation + Formspree POST via fetch
function handleForm(formId, errorsId, successId) {
    const form = document.getElementById(formId);
    const errors = document.getElementById(errorsId);
    const ok = document.getElementById(successId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errors) errors.textContent = '';
        if (ok) ok.hidden = true;

        // basic required fields check
        const invalid = [...form.elements].filter(el => el.required && !String(el.value || '').trim());
        if (invalid.length) {
            if (errors) errors.textContent = 'Please complete all required fields marked with *.';
            invalid[0].focus();
            return;
        }

        // If a Formspree endpoint is provided, submit via fetch
        const endpoint = form.dataset.endpoint;
        if (endpoint) {
            try {
                const formData = new FormData(form);
                const resp = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
                if (resp.ok) {
                    if (ok) {
                        ok.textContent = form.dataset.successMessage || 'Thank you! Your form was submitted successfully.';
                        ok.hidden = false;
                    }
                    form.reset();
                } else {
                    if (errors) errors.textContent = 'Submission failed. Please try again or email us directly.';
                }
            } catch (err) {
                if (errors) errors.textContent = 'Network error. Please check your connection and try again.';
            }
            return;
        }

        // Fallback: show success only (no network)
        if (ok) ok.hidden = false;
        form.reset();
    });
}

// Apply to enrollment & contact forms
handleForm('enrollForm', 'formErrors', 'formSuccess');
handleForm('contactForm', 'contactErrors', 'contactSuccess');
