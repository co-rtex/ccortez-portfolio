// Standardized resource schema with bilingual fields and category slugs
// cats: ["food","housing","health","mental","substance","legal","financial","immigrant","seniors","community","government","hotlines","safety","crisis"]

window.RESOURCES = [
    {
        name_en: "Food For Greater Elgin",
        name_es: "Food For Greater Elgin",
        cats: ["food"],
        phone: "(847) 931-9330",
        url: "https://www.foodforgreaterelgin.org/",
        address: "1553 Commerce Dr, Elgin, IL 60123",
        notes_en: "Large client-choice food pantry. Seniors can ask about delivery options.",
        notes_es: "Despensa grande con elección de clientes. Personas mayores pueden preguntar por opciones de entrega.",
        tags: ["food", "pantry", "groceries", "hunger", "spanish", "families", "comida", "despensa"]
    },
    {
        name_en: "Community Crisis Center (24/7 Hotlines)",
        name_es: "Community Crisis Center (Líneas 24/7)",
        cats: ["crisis", "housing", "safety"],
        phone: "(847) 697-2380",
        alt: "En Español: (847) 697-9740",
        url: "https://www.crisiscenter.org/",
        address: "Elgin, IL (call first)",
        notes_en: "24/7 crisis hotline, emergency shelter for survivors of domestic violence and their children, counseling, advocacy. Call first—location not public.",
        notes_es: "Línea de crisis 24/7, refugio de emergencia para sobrevivientes de violencia doméstica y sus hijos, consejería y apoyo. Llama primero—ubicación no pública.",
        tags: ["domestic violence", "shelter", "sexual assault", "crisis", "spanish", "24/7", "violencia", "refugio"]
    },
    {
        name_en: "Ecker Center for Behavioral Health",
        name_es: "Ecker Center (Salud conductual)",
        cats: ["mental"],
        phone: "(847) 695-0484",
        alt: "24/7 Crisis: (888) 325-3750",
        url: "https://www.eckercenter.org/",
        address: "1845 Grandstand Pl, Elgin, IL 60123",
        notes_en: "Counseling, psychiatry, and crisis support for adults. 24/7 crisis line.",
        notes_es: "Consejería, psiquiatría y apoyo en crisis para adultos. Línea de crisis 24/7.",
        tags: ["mental health", "counseling", "psychiatry", "crisis", "salud mental", "consejería"]
    },
    {
        name_en: "Renz Addiction Counseling Center",
        name_es: "Renz (Tratamiento de adicciones)",
        cats: ["substance"],
        phone: "(847) 742-3545",
        url: "https://www.renzcenter.org/",
        address: "2 American Way, Elgin, IL 60120",
        notes_en: "Outpatient substance use treatment, groups, recovery supports.",
        notes_es: "Tratamiento ambulatorio por uso de sustancias, grupos y apoyo a la recuperación.",
        tags: ["addiction", "substance use", "recovery", "MAT", "adicciones", "rehabilitación"]
    },
    {
        name_en: "Greater Family Health (Community Health Center)",
        name_es: "Greater Family Health (Centro de salud comunitario)",
        cats: ["health"],
        phone: "(844) 599-3700",
        url: "https://greaterfamilyhealth.org/locations/",
        address: "Elgin sites incl. 373 Summit St & 450 Dundee Ave",
        notes_en: "Primary care, dental, OB/GYN, behavioral health. Sliding fee; multilingual.",
        notes_es: "Atención primaria, dental, gineco-obstetricia y salud conductual. Tarifas ajustadas; multilingüe.",
        tags: ["clinic", "dental", "primary care", "pediatrics", "OBGYN", "spanish", "clínica", "español"]
    },
    {
        name_en: "VNA Health Care – Elgin",
        name_es: "VNA Health Care – Elgin",
        cats: ["health"],
        phone: "(630) 892-4355",
        url: "https://vnahealth.com/locations/",
        address: "801 Villa St & 620 Wing St, Elgin, IL",
        notes_en: "Primary care, pharmacy (Villa St), women’s health; accepts Medicaid/Medicare; sliding fee.",
        notes_es: "Atención primaria, farmacia (Villa St), salud de la mujer; acepta Medicaid/Medicare; tarifa ajustada.",
        tags: ["clinic", "primary care", "pharmacy", "OBGYN", "spanish", "clínica", "farmacia"]
    },
    {
        name_en: "Open Door Health Center of Illinois (Elgin)",
        name_es: "Open Door Health Center of Illinois (Elgin)",
        cats: ["health"],
        phone: "(847) 695-1093",
        url: "https://odhcil.org/",
        address: "1665 Larkin Ave, Elgin, IL 60123",
        notes_en: "Free/low-cost HIV & STI testing, prevention, and linkage to care.",
        notes_es: "Pruebas de VIH e ITS gratuitas o económicas, prevención y enlace a atención médica.",
        tags: ["HIV", "STI", "testing", "sexual health", "LGBTQ", "pruebas", "salud sexual"]
    },
    {
        name_en: "Kane County Health Department (Elgin/Aurora)",
        name_es: "Departamento de Salud del Condado de Kane",
        cats: ["health", "government"],
        phone: "(630) 208-3801",
        url: "https://www.kanehealth.com/",
        address: "Elgin: 1750 Grandstand Pl; Aurora HQ: 1240 N Highland Ave",
        notes_en: "Immunizations, public health programs, naloxone info, WIC, and more.",
        notes_es: "Vacunas, programas de salud pública, información de naloxona, WIC y más.",
        tags: ["vaccines", "public health", "naloxone", "WIC", "programs", "vacunas", "salud pública"]
    },
    {
        name_en: "PADS of Elgin (Homeless Services)",
        name_es: "PADS de Elgin (Servicios para personas sin hogar)",
        cats: ["housing"],
        phone: "(847) 608-9744",
        url: "https://elginil.gov/1170/Homeless-Resources",
        address: "1730 Berkley St, Elgin, IL 60123",
        notes_en: "Emergency shelter & services. Call to check availability and intake steps.",
        notes_es: "Refugio de emergencia y servicios. Llama para disponibilidad y pasos de admisión.",
        tags: ["shelter", "homeless", "housing", "refugio", "vivienda"]
    },
    {
        name_en: "Housing Authority of Elgin (HAE)",
        name_es: "Autoridad de Vivienda de Elgin (HAE)",
        cats: ["housing"],
        phone: "(847) 742-3853",
        url: "https://haelgin.org/",
        address: "130 S State St, Elgin, IL 60123",
        notes_en: "Public housing & Housing Choice Voucher (Section 8). Check site for waitlist updates.",
        notes_es: "Vivienda pública y vales (Sección 8). Revisa el sitio para listas de espera.",
        tags: ["section 8", "rent", "voucher", "public housing", "renta", "vivienda"]
    },
    {
        name_en: "Elgin Township – General & Emergency Assistance",
        name_es: "Elgin Township – Asistencia general y de emergencia",
        cats: ["financial"],
        phone: "(847) 741-2045",
        url: "https://elgintownship.com/general-assistance/",
        address: "729 S McLean Blvd, Ste 200, Elgin, IL 60123",
        notes_en: "Helps eligible residents with basic needs and rent/utility emergencies.",
        notes_es: "Ayuda a residentes elegibles con necesidades básicas y emergencias de renta/servicios.",
        tags: ["financial", "utilities", "rent", "assistance", "financiera", "renta", "servicios"]
    },
    {
        name_en: "Prairie State Legal Services",
        name_es: "Prairie State Legal Services",
        cats: ["legal"],
        phone: "(630) 690-2130",
        url: "https://pslegal.org/how-to-get-started",
        address: "Serving Kane County (West Suburban Office)",
        notes_en: "Free civil legal help for eligible clients (housing, safety, benefits, more).",
        notes_es: "Ayuda legal civil gratuita para clientes elegibles (vivienda, seguridad, beneficios, etc.).",
        tags: ["legal aid", "eviction", "orders of protection", "benefits", "legal", "desalojo"]
    },
    {
        name_en: "Centro de Información (Elgin Office)",
        name_es: "Centro de Información (Oficina de Elgin)",
        cats: ["immigrant"],
        phone: "(847) 695-9050",
        url: "https://www.centrodeinformacion.org/",
        address: "1885 Lin Lor Ln, Ste 103, Elgin, IL 60123",
        notes_en: "Immigrant & family services; Spanish-speaking; advocacy and referrals.",
        notes_es: "Servicios para inmigrantes y familias; atención en español; abogacía y referencias.",
        tags: ["immigrant", "spanish", "documents", "citizenship", "inmigrante", "español"]
    },
    {
        name_en: "Senior Services Associates – Elgin",
        name_es: "Senior Services Associates – Elgin",
        cats: ["seniors"],
        phone: "(847) 741-0404",
        url: "https://seniorservicesassoc.org/locations-overview/elgin-kane-county/",
        address: "205 Fulton St, Elgin, IL 60120",
        notes_en: "Aging & disability resource center: benefits counseling, caregiver supports, activities.",
        notes_es: "Centro de recursos para mayores y discapacidades: beneficios, apoyo a cuidadores, actividades.",
        tags: ["seniors", "aging", "caregiver", "benefits", "mayores", "cuidadores"]
    },
    {
        name_en: "Salvation Army – Elgin Corps",
        name_es: "Ejército de Salvación – Elgin",
        cats: ["financial", "food"],
        phone: "(847) 741-2304",
        url: "https://centralusa.salvationarmy.org/elgin/",
        address: "316 Douglas Ave, Elgin, IL 60120",
        notes_en: "Food & emergency assistance programs; call for intake.",
        notes_es: "Alimentos y asistencia de emergencia; llama para evaluación.",
        tags: ["food", "utilities", "rent", "assistance", "comida", "servicios"]
    },
    {
        name_en: "Gail Borden Public Library (Main & Rakow)",
        name_es: "Biblioteca Pública Gail Borden (Sede y Rakow)",
        cats: ["community"],
        phone: "(847) 742-2411",
        url: "https://www.gailborden.info/",
        address: "Main: 270 N Grove Ave; Rakow: 2751 W Bowes Rd, Elgin, IL",
        notes_en: "Computers, printing, study rooms, events; great first stop for referrals.",
        notes_es: "Computadoras, impresión, salas de estudio, eventos; buen primer punto para referencias.",
        tags: ["library", "wifi", "printing", "community", "biblioteca", "impresión"]
    },
    {
        name_en: "City of Elgin 311 (Non-Emergency City Services)",
        name_es: "Ciudad de Elgin 311 (Servicios no emergentes)",
        cats: ["government"],
        phone: "311 (in city) / (847) 931-6001",
        url: "https://311-contact-center-cityofelgin.hub.arcgis.com/",
        address: "150 Dexter Ct, Elgin, IL 60120",
        notes_en: "Report issues, ask about permits, trash/recycling, snow, etc. Email: elgin311@elginil.gov",
        notes_es: "Reporta problemas, permisos, basura/reciclaje, nieve, etc. Correo: elgin311@elginil.gov",
        tags: ["city", "permit", "trash", "snow", "roads", "ciudad", "permisos"]
    },
    {
        name_en: "Elgin Police – Non-Emergency",
        name_es: "Policía de Elgin – No emergencias",
        cats: ["safety", "government"],
        phone: "(847) 289-2700",
        url: "https://elginil.gov/2540/Police",
        address: "151 Douglas Ave, Elgin, IL 60120",
        notes_en: "Use for non-emergencies, reports, and tips. (Emergency? Call 911.)",
        notes_es: "Para situaciones no emergentes, reportes y avisos. (¿Emergencia? Llama al 911.)",
        tags: ["police", "safety", "non-emergency", "policía", "seguridad"]
    },
    {
        name_en: "Fox Valley United Way 211 (Kane County)",
        name_es: "United Way 211 del Valle Fox (Condado de Kane)",
        cats: ["hotlines", "community"],
        phone: "Dial 211 (Alt: 888-865-9903)",
        url: "https://www.foxvalleyunitedway.org/211",
        address: "Kane County (phone/text/web)",
        notes_en: "24/7 help finding food, housing, utilities, health, and more. Text your ZIP to 898-211.",
        notes_es: "Ayuda 24/7 para encontrar alimentos, vivienda, servicios, salud y más. Envía tu ZIP al 898-211.",
        tags: ["211", "referrals", "spanish", "24/7", "español", "referencias"]
    }
];
