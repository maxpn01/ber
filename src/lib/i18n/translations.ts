export type Lang = "de" | "en";

export const translations = {
  de: {
    // Header
    appTitle: "Break Even Rechner",
    appShortDesc:
      "Berechnen Sie Ihre Gewinnschwelle inklusive der Kosten für neue Mitarbeiter:innen.",
    languageLabel: "Sprache",

    // Start page
    startTitle: "Break-Even-Rechner",
    startSubtitle: "Wirtschaftskammer Österreich",
    startDescription:
      "Mit dem Break-Even-Rechner ermitteln Sie als Einzelunternehmer:in (EPU), ab welchem Umsatz sich die Anstellung neuer Mitarbeiter:innen rechnet — inklusive Lohnnebenkosten und Förderungen.",
    startCta: "Berechnung starten",

    // Sections
    allgemein: "Allgemein",
    branche: "Branche",
    umsatz: "Umsatz",
    aufwand: "Aufwand",
    verrechneteStunden: "Verrechnete Stunden",
    wareneinsatz: "Wareneinsatz",
    provision: "Provision",
    provisionPct: "Provision in %",
    erzielbarerGewinn: "Erzielbarer Gewinn",

    datenMitarbeiter: "Daten Mitarbeiter:in",
    beschaeftigungsform: "Beschäftigungsform",
    bruttogehalt: "Bruttoentgelt pro Monat",
    wochenstunden: "Anzahl Wochenstunden",
    beschaeftigungsmonate: "Anzahl Beschäftigungsmonate",
    zusatzkostenMonatlich: "Zusatzkosten monatlich",
    zusatzkostenJaehrlich: "Zusatzkosten jährlich",
    verkaufbareStunden: "Verkaufbare Stunden",
    verkaufbareStundenPct: "Verkaufbare Stunden in %",
    stundensatz: "Stundensatz",
    umsatzsteigerung: "Umsatzsteigerung in %",
    zuruecksetzen: "Zurücksetzen",
    loeschen: "Löschen",

    // Subsidies
    foerderungEpu: "EPU Lohnnebenkostenförderung",
    foerderungBonus: "Beschäftigungsbonus",
    foerderungStartUp: "aws StartUp-Förderung",
    fuerMitarbeiter: "Für Mitarbeiter:in",
    voraussetzungenTitel: "Anspruch ist gegeben, wenn nachstehende Voraussetzungen erfüllt sind:",
    hinweisLabel: "Hinweis:",
    hinweisEpu:
      "Die Förderung beträgt ein Viertel des laufenden Bruttoentgelts und wird für die Dauer von einem Jahr gewährt.",
    hinweisBonus:
      "Der Beschäftigungsbonus erstattet 50% der Lohnnebenkosten für eine Dauer von bis zu 3 Jahren.",
    hinweisStartUp:
      "Die aws-Förderung erstattet die gesamten Lohnnebenkosten für innovative Start-Ups in den ersten 5 Jahren.",
    startUpUnavailable:
      "Die Unternehmensgründung liegt länger als 5 Jahre zurück, daher steht diese Förderungsoption nicht zur Verfügung.",

    epuConditions: [
      "Maximal für den/die 1. MA anwendbar.",
      "Einzelunternehmer / Geschäftsführer seit mehr als 3 Monaten GSVG (kranken-, unfall- und pensionsversichert) versichert.",
      "Innerhalb der letzten 5 Jahre wurde kein/e Mitarbeiter/in (MA) oder freie/r Dienstnehmer/in über der Geringfügigkeitsgrenze für länger als 2 Monate beschäftigt. Der/die 1. MA ist seit mind. 2 Wochen arbeitslos gemeldet; oder hat zuvor eine Ausbildung abgeschlossen und ist arbeitssuchend vorgemerkt.",
      "Verwandtschaftsverhältnis (Eltern, Großeltern, Stiefeltern und Adoptiveltern, Kinder, Enkel-, Stief- und Adoptivkinder, Geschwister, Schwager/Schwägerinnen, Ehegatten, Lebensgefährten) bei dem/der 1. MA liegt nicht vor.",
      "Der 1. MA zählt nicht zu folgenden Gruppen: Lehrlinge, Werkvertragsnehmer, neue Selbständige, freie Dienstnehmer.",
      "Die Arbeitszeit beträgt mindestens 50% der gesetzlichen/ kollektivvertraglichen Wochenstunden.",
      "Das Arbeitsverhältnis wird länger als 2 Monate dauern.",
      "Der/die 1. MA wird in einem echten (vollversicherungspflichtigen) Arbeitsverhältnis beschäftigt.",
      "Das Arbeitsverhältnis wurde noch nicht begonnen bzw. der Beginn liegt nicht länger als 6 Wochen zurück.",
      "Es wird keine andere Lohnnebenkosten-Förderung in Anspruch genommen.",
    ],
    bonusConditions: [
      "Beschäftigungsdauer von mindestens 6 Monaten.",
      "Maximal für 3 Mitarbeiter:innen.",
      "Nur für Angestellte und Arbeiter:innen.",
      "Es wird keine andere Lohnnebenkosten-Förderung in Anspruch genommen.",
    ],
    startUpConditions: [
      "Beschäftigungsdauer von mindestens 3 Monaten.",
      "Unternehmensgründung liegt nicht länger als 5 Jahre zurück.",
      "Maximal für 3 Mitarbeiter:innen.",
      "Nur für Angestellte und Arbeiter:innen.",
      "Es wird keine andere Lohnnebenkosten-Förderung in Anspruch genommen.",
    ],

    // Results
    potenzialTitle: "Potenzial inkl. neuer Mitarbeiter",
    potenzialInkl: "inkl. zzgl Mitarbeiter",
    breakEven: "Break Even",
    gesamtumsatzpotenzial: "Gesamtumsatzpotenzial",
    gesamtstunden: "Gesamtstunden",
    umsatzInklTitle: "Umsatz Inkl. Neuer Mitarbeiter",
    monatlich: "monatlich",
    jaehrlich: "jährlich",
    breakEvenUmsatz: "Break-Even-Umsatz",
    breakEvenProvisionsumsatz: "Break-Even-Provisionsumsatz",
    gesamtumsatz: "Gesamtumsatz",
    personalkosten: "Personalkosten",
    foerderungenGesamt: "Förderungen gesamt",
    gewinn: "Gewinn",
    details: "Details",
    detailsEinblenden: "Details einblenden",
    detailsAusblenden: "Details ausblenden",
    bruttoEntgelt: "Bruttoentgelt",
    bruttoEntgeltInkl: "Bruttoentgelt inkl. Lohnnebenkosten",
    arbeitsstunden: "Arbeitsstunden",
    foerderung: "Förderung",
    ausgangssituation: "AUSGANGSSITUATION (ohne Mitarbeiter)",
    provisionsumsatz: "Provisionsumsatz",
    zusammenfassung: "Zusammenfassung",

    // Summary page
    drucken: "Drucken",
    zurueck: "Zurück",
    summaryTitle: "Zusammenfassung",
    stammdaten: "Stammdaten",
    nameUnternehmen: "Name des Unternehmens",
    gruendungsjahr: "Gründungsjahr",

    // Misc
    error: "Fehler",
    close: "Schließen",
    ok: "OK",
    sliderHint: "Bewegen Sie den Regler, um die gewünschte Gewinnhöhe einzustellen.",
    sliderLocked: "Verfügbar nach erfolgreicher Berechnung.",
    addMitarbeiter: "Mitarbeiter:in hinzufügen",
    helpAria: "Hilfe",

    // Footer
    barrierefreiheit: "Barrierefreiheitserklärung",
    datenschutz: "Datenschutzerklärung",
    cookies: "Cookie-Einstellungen",

    // Branche labels
    branche_dienstleistung: "Dienstleistung",
    branche_gastronomie: "Gastronomie",
    branche_handel: "Handel",
    branche_gewerbe: "Gewerbe-Handel-Dienstleistung/Handwerk",
    branche_provision: "Provision",

    // Dienstverhaeltnis labels
    dv_angestellter: "Angestellte:r",
    dv_arbeiter: "Arbeiter:in",
    dv_geringfuegig: "Geringfügiges Dienstverhältnis",
    dv_lehrling: "Lehrling",
    dv_dienstvertrag: "Freier Dienstvertrag",
  },
  en: {
    appTitle: "Break Even Calculator",
    appShortDesc:
      "Calculate your break-even point including the cost of hiring new employees.",
    languageLabel: "Language",

    startTitle: "Break-Even Calculator",
    startSubtitle: "Austrian Federal Economic Chamber",
    startDescription:
      "As a sole proprietor (EPU), use the break-even calculator to find out at what revenue hiring new employees becomes profitable — including labor-related costs and subsidies.",
    startCta: "Start calculation",

    allgemein: "General",
    branche: "Industry",
    umsatz: "Revenue",
    aufwand: "Expenses",
    verrechneteStunden: "Billable hours",
    wareneinsatz: "Cost of goods",
    provision: "Commission",
    provisionPct: "Commission in %",
    erzielbarerGewinn: "Desired profit",

    datenMitarbeiter: "Employee data",
    beschaeftigungsform: "Employment type",
    bruttogehalt: "Gross monthly salary",
    wochenstunden: "Weekly hours",
    beschaeftigungsmonate: "Months of employment",
    zusatzkostenMonatlich: "Additional costs monthly",
    zusatzkostenJaehrlich: "Additional costs yearly",
    verkaufbareStunden: "Billable hours",
    verkaufbareStundenPct: "Billable hours in %",
    stundensatz: "Hourly rate",
    umsatzsteigerung: "Revenue increase in %",
    zuruecksetzen: "Reset",
    loeschen: "Delete",

    foerderungEpu: "EPU labor cost subsidy",
    foerderungBonus: "Employment bonus",
    foerderungStartUp: "aws StartUp subsidy",
    fuerMitarbeiter: "For employee",
    voraussetzungenTitel: "Eligibility requires the following conditions:",
    hinweisLabel: "Note:",
    hinweisEpu:
      "The subsidy amounts to a quarter of the running gross salary and is granted for one year.",
    hinweisBonus:
      "The employment bonus refunds 50% of the labor-related costs for up to 3 years.",
    hinweisStartUp:
      "The aws subsidy refunds the entire labor-related costs for innovative start-ups for the first 5 years.",
    startUpUnavailable:
      "The company was founded more than 5 years ago, so this subsidy is not available.",

    epuConditions: [
      "Applicable for the 1st employee only.",
      "Sole proprietor / managing director GSVG-insured (health, accident, pension) for more than 3 months.",
      "Within the last 5 years, no employee or free contractor above the marginal earnings threshold has been employed for more than 2 months. The 1st employee has been registered as unemployed for at least 2 weeks, or has just completed training and is registered as job-seeking.",
      "No family relationship (parents, grandparents, step- or adoptive parents, children, grandchildren, step- and adoptive children, siblings, brothers- and sisters-in-law, spouses, partners) with the 1st employee.",
      "The 1st employee is not part of: apprentices, contract workers, new self-employed, free contractors.",
      "Working time is at least 50% of the legal / collective weekly hours.",
      "The employment relationship will last longer than 2 months.",
      "The 1st employee is fully insured.",
      "The employment relationship has not yet started or started no longer than 6 weeks ago.",
      "No other labor-cost subsidy is being claimed.",
    ],
    bonusConditions: [
      "Employment duration of at least 6 months.",
      "Maximum for 3 employees.",
      "Only for employees and workers.",
      "No other labor-cost subsidy is being claimed.",
    ],
    startUpConditions: [
      "Employment duration of at least 3 months.",
      "Company founded no longer than 5 years ago.",
      "Maximum for 3 employees.",
      "Only for employees and workers.",
      "No other labor-cost subsidy is being claimed.",
    ],

    potenzialTitle: "Potential incl. new employees",
    potenzialInkl: "incl. additional employees",
    breakEven: "Break Even",
    gesamtumsatzpotenzial: "Total revenue potential",
    gesamtstunden: "Total hours",
    umsatzInklTitle: "Revenue incl. new employees",
    monatlich: "monthly",
    jaehrlich: "yearly",
    breakEvenUmsatz: "Break-even revenue",
    breakEvenProvisionsumsatz: "Break-even commission revenue",
    gesamtumsatz: "Total revenue",
    personalkosten: "Personnel costs",
    foerderungenGesamt: "Subsidies total",
    gewinn: "Profit",
    details: "Details",
    detailsEinblenden: "Show details",
    detailsAusblenden: "Hide details",
    bruttoEntgelt: "Gross salary",
    bruttoEntgeltInkl: "Gross salary incl. labor costs",
    arbeitsstunden: "Working hours",
    foerderung: "Subsidy",
    ausgangssituation: "STARTING SITUATION (without employees)",
    provisionsumsatz: "Commission revenue",
    zusammenfassung: "Summary",

    drucken: "Print",
    zurueck: "Back",
    summaryTitle: "Summary",
    stammdaten: "Master data",
    nameUnternehmen: "Company name",
    gruendungsjahr: "Founding year",

    error: "Error",
    close: "Close",
    ok: "OK",
    sliderHint: "Move the slider to set the desired profit.",
    sliderLocked: "Available after a successful calculation.",
    addMitarbeiter: "Add employee",
    helpAria: "Help",

    barrierefreiheit: "Accessibility statement",
    datenschutz: "Privacy policy",
    cookies: "Cookie settings",

    branche_dienstleistung: "Service",
    branche_gastronomie: "Hospitality",
    branche_handel: "Trade",
    branche_gewerbe: "Trade-Service/Crafts",
    branche_provision: "Commission",

    dv_angestellter: "Employee",
    dv_arbeiter: "Worker",
    dv_geringfuegig: "Marginal employment",
    dv_lehrling: "Apprentice",
    dv_dienstvertrag: "Free service contract",
  },
} as const;

export type TranslationKey = keyof typeof translations.de;
