// Simple bilingual dictionary + helpers
const I18N = {
    en: {
        title: "Elgin Help Hub",
        subtitle: "Fast local help for food, housing, health, legal, and city services in <strong>Elgin, IL</strong>.",
        emergency: "Emergencies",
        mental_health: "Mental Health / Suicide",
        social_services: "Social services",
        search_placeholder: "Search resources (try: food, rent, Spanish, clinic, legal, shelter)…",
        clear: "Clear",
        reset_filters: "Reset filters",
        print_list: "Print list",
        no_matches: "No matches. Try different words (e.g., food, rent, legal, clinic) or clear filters.",
        results: "result(s)",
        disclaimer: "Data may change—call ahead.",
        last_updated: "Last updated",
        call: "Call",
        website: "Website",
        map: "Map",
        share: "Share",
        copied: "Copied details to clipboard.",
        categories: {
            food: "Food",
            crisis: "Crisis",
            housing: "Housing & Shelter",
            safety: "Safety",
            mental: "Mental Health",
            substance: "Substance Use",
            health: "Health",
            legal: "Legal",
            financial: "Financial Help",
            immigrant: "Immigrant Services",
            seniors: "Seniors",
            community: "Community",
            government: "Government & City",
            hotlines: "Hotlines"
        }
    },
    es: {
        title: "Centro de Ayuda de Elgin",
        subtitle: "Ayuda local rápida para alimentos, vivienda, salud, asuntos legales y servicios de la ciudad en <strong>Elgin, IL</strong>.",
        emergency: "Emergencias",
        mental_health: "Salud mental / Suicidio",
        social_services: "Servicios sociales",
        search_placeholder: "Busca recursos (ej.: comida, renta, español, clínica, legal, refugio)…",
        clear: "Limpiar",
        reset_filters: "Reiniciar filtros",
        print_list: "Imprimir lista",
        no_matches: "Sin coincidencias. Prueba otras palabras (p. ej., comida, renta, legal, clínica) o limpia filtros.",
        results: "resultado(s)",
        disclaimer: "La información puede cambiar—llama antes.",
        last_updated: "Última actualización",
        call: "Llamar",
        website: "Sitio web",
        map: "Mapa",
        share: "Compartir",
        copied: "Detalles copiados al portapapeles.",
        categories: {
            food: "Alimentos",
            crisis: "Crisis",
            housing: "Vivienda y Refugio",
            safety: "Seguridad",
            mental: "Salud mental",
            substance: "Uso de sustancias",
            health: "Salud",
            legal: "Legal",
            financial: "Ayuda financiera",
            immigrant: "Servicios para inmigrantes",
            seniors: "Personas mayores",
            community: "Comunidad",
            government: "Gobierno y Ciudad",
            hotlines: "Líneas directas"
        }
    }
};

const Lang = {
    current: localStorage.getItem('ehh_lang') || (navigator.language?.startsWith('es') ? 'es' : 'en'),
    set(lang) {
        this.current = lang;
        localStorage.setItem('ehh_lang', lang);
        document.documentElement.lang = lang === 'es' ? 'es' : 'en';
        this.apply();
    },
    t(key) {
        const dict = I18N[this.current] || I18N.en;
        const parts = key.split('.');
        let cur = dict;
        for (const p of parts) cur = (cur || {})[p];
        return cur || key;
    },
    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const html = Lang.t(el.getAttribute('data-i18n'));
            el.innerHTML = html;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.setAttribute('placeholder', Lang.t(el.getAttribute('data-i18n-placeholder')));
        });
        // Update category chip labels
        if (window.renderChips) window.renderChips();
        if (window.renderList) window.renderList();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Lang.apply();
    const btnEN = document.getElementById('btnEN');
    const btnES = document.getElementById('btnES');
    const setPressed = (enPressed) => {
        btnEN.setAttribute('aria-pressed', enPressed ? 'true' : 'false');
        btnES.setAttribute('aria-pressed', enPressed ? 'false' : 'true');
    };
    setPressed(Lang.current === 'en');
    btnEN.addEventListener('click', () => { Lang.set('en'); setPressed(true); });
    btnES.addEventListener('click', () => { Lang.set('es'); setPressed(false); });
});
