import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "@/App";
import { tStr } from "@/lib/text";

describe("Calculator page", () => {
  it("opens the full general help modal from the title icon", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Allgemeine Hilfe öffnen" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Kostencheck Allgemeine Hilfe",
    });

    expect(within(dialog).getByText("Einführung")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Beschäftigungsformen"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Freier Dienstvertrag:")).toHaveClass(
      "font-bold",
    );
    expect(
      within(dialog).getByText(/Ein freier Dienstvertrag liegt vor/),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole("slider")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Branche" }),
    ).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("combobox", { name: "Branche" }),
    ).toBeInTheDocument();
  });

  it("has original-site help text for branch and dynamic general fields", () => {
    expect(tStr("brancheHelp")).toContain(
      "Die Ermittlung des Mindestumsatzes erfolgt je nach angegebener Kategorie unterschiedlich",
    );
    expect(tStr("brancheHelp")).toContain(
      "(z.B. Textileinzelhandel, Möbelhandel)",
    );
    expect(tStr("brancheHelp")).toContain(
      "(z.B. ein/e Friseur:in mit angeschlossenem Friseurbedarfshandel oder ein/e EDV-Dienstleister:in mit Computerhandel)",
    );
    expect(tStr("brancheHelp")).toContain(
      "(z.B. Tischler:in oder Spengler:in)",
    );
    expect(tStr("brancheHelp")).toContain(
      "(z.B. Handelsagent:in, Direktvertrieb)",
    );
    expect(tStr("umsatzHelp")).toBe(
      "Dieses Feld ist für die Höhe Ihres Jahresumsatzes vorgesehen.",
    );
    expect(tStr("aufwandHelp")).toBe(
      "In diesem Feld ist die Höhe Ihres derzeitigen Aufwands als Jahressumme anzuführen.",
    );
    expect(tStr("verrechneteStundenHelp")).toBe(
      "In diesem Feld ist die Anzahl der Stunden, die Sie zur Erzielung des angeführten Umsatzes in einem Jahr verrechenbar leisten, angeführt.",
    );
    expect(tStr("provisionPctHelp")).toBe(
      "Geben Sie hier die Höhe der Provision in % an, die Sie für vermittelte Umsätze erhalten.",
    );
    expect(tStr("wareneinsatzHelp")).toBe(
      "Dieses Feld ist für den Wareneinsatz, den Sie für die Erzielung des angeführten Umsatzes in einem Jahr benötigen, vorgesehen.",
    );
    expect(tStr("potenzialInputUmsatzsteigerungHelp")).toContain(
      "Potenzielle Umsatzsteigerung",
    );
  });

  it("opens field help on click and closes from the close button or outside click", async () => {
    const user = userEvent.setup();
    render(<App />);

    const branchHelp = screen.getAllByRole("button", { name: "Hilfe" })[0];
    const branchHelpText =
      /Die Ermittlung des Mindestumsatzes erfolgt je nach angegebener Kategorie unterschiedlich/;

    await user.hover(branchHelp);
    expect(screen.queryByText(branchHelpText)).not.toBeInTheDocument();

    await user.click(branchHelp);
    expect(screen.getByText(branchHelpText)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hilfe schließen" }));
    expect(screen.queryByText(branchHelpText)).not.toBeInTheDocument();

    await user.click(branchHelp);
    expect(screen.getByText(branchHelpText)).toBeInTheDocument();

    await user.click(screen.getByRole("textbox", { name: "Umsatz" }));
    await waitFor(() => {
      expect(screen.queryByText(branchHelpText)).not.toBeInTheDocument();
    });
  });

  it("preselects Dienstleistung and shows all branch options", async () => {
    const user = userEvent.setup();
    render(<App />);

    const branch = screen.getByRole("combobox", { name: "Branche" });
    expect(branch).toHaveTextContent("Dienstleistung");
    expect(branch).not.toHaveClass("border-wko-red");

    await user.click(branch);

    expect(
      await screen.findByRole("option", { name: "Dienstleistung" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Gastronomie" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Handel" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", {
        name: "Gewerbe-Handel-Dienstleistung/Handwerk",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Provision" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Gastronomie" }));

    await waitFor(() => {
      expect(branch).not.toHaveClass("border-wko-red");
      expect(branch).not.toHaveFocus();
    });
  });

  it("shows results and enables desired profit slider after valid base inputs", async () => {
    const user = userEvent.setup();
    render(<App />);

    const [umsatz, aufwand, stunden] = screen.getAllByRole("textbox");

    await user.click(umsatz);
    await user.keyboard("100000");

    await user.click(aufwand);
    await user.keyboard("20000");

    await user.click(stunden);
    await user.keyboard("1000");

    expect(
      screen.getByText(/Was kosten Ihre ersten\s+Mitarbeiter:innen/),
    ).toBeInTheDocument();

    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("Potenzial inkl. neuer Mitarbeiter"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Was kosten Ihre ersten\s+Mitarbeiter:innen/),
      ).not.toBeInTheDocument();
      const slider = screen.getByRole("slider", { name: "Erzielbarer Gewinn" });
      expect(slider).toHaveAttribute("aria-valuenow", "80000");
      expect(slider).not.toHaveAttribute("aria-disabled", "true");
    });
  });

  it("waits for Wareneinsatz before calculating Gewerbe-Handel-Dienstleistung/Handwerk", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("combobox", { name: "Branche" }));
    await user.click(
      await screen.findByRole("option", {
        name: "Gewerbe-Handel-Dienstleistung/Handwerk",
      }),
    );

    await user.click(screen.getByRole("textbox", { name: "Umsatz" }));
    await user.keyboard("100000");

    await user.click(screen.getByRole("textbox", { name: "Aufwand" }));
    await user.keyboard("20000");

    await user.click(
      screen.getByRole("textbox", { name: "Verrechnete Stunden" }),
    );
    await user.keyboard("1000");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/Was kosten Ihre ersten\s+Mitarbeiter:innen/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("slider", { name: "Erzielbarer Gewinn" }),
      ).toHaveAttribute("data-disabled", "");
    });

    await user.click(screen.getByRole("textbox", { name: "Wareneinsatz" }));
    await user.keyboard("10000");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("Potenzial inkl. neuer Mitarbeiter"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("slider", { name: "Erzielbarer Gewinn" }),
      ).not.toHaveAttribute("data-disabled");
    });
  });

  it("does not offer personnel cost details when no employee data is included", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Löschen" }));

    await user.click(screen.getByRole("textbox", { name: "Umsatz" }));
    await user.keyboard("100000");

    await user.click(screen.getByRole("textbox", { name: "Aufwand" }));
    await user.keyboard("20000");

    await user.click(
      screen.getByRole("textbox", { name: "Verrechnete Stunden" }),
    );
    await user.keyboard("1000");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText("- Personalkosten")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Details/ }),
      ).not.toBeInTheDocument();
    });
  });

  it("opens and closes personnel cost details for included employees", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("switch", {
        name: "EPU Lohnnebenkostenförderung",
      }),
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Für Mitarbeiter:in 1" }),
    );

    await user.click(screen.getByRole("textbox", { name: "Umsatz" }));
    await user.keyboard("100000");

    await user.click(screen.getByRole("textbox", { name: "Aufwand" }));
    await user.keyboard("20000");

    await user.click(
      screen.getByRole("textbox", { name: "Verrechnete Stunden" }),
    );
    await user.keyboard("1000");
    await user.tab();

    const details = await screen.findByRole("button", { name: /Details/ });
    await user.click(details);

    expect(screen.getByText("Mitarbeiter 1")).toBeInTheDocument();
    expect(
      screen.getByText("Bruttoentgelt inkl. Lohnnebenkosten"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("EPU Lohnnebenkostenförderung")).toHaveLength(2);

    await user.click(
      screen.getAllByRole("button", { name: "Details ausblenden" })[0],
    );

    await waitFor(() => {
      expect(screen.queryByText("Mitarbeiter 1")).not.toBeInTheDocument();
    });
  });

  it("updates branch input fields when desired profit changes by keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    const [umsatz, aufwand, stunden] = screen.getAllByRole("textbox");

    await user.click(umsatz);
    await user.keyboard("100000");

    await user.click(aufwand);
    await user.keyboard("20000");

    await user.click(stunden);
    await user.keyboard("1000");
    await user.keyboard("{Enter}");

    const slider = screen.getByRole("slider", { name: "Erzielbarer Gewinn" });
    await waitFor(() => {
      expect(slider).toHaveAttribute("aria-valuemin", "1");
      expect(slider).toHaveAttribute("aria-valuemax", "1000000");
      expect(slider).toHaveAttribute("aria-valuenow", "80000");
    });

    slider.focus();
    await user.keyboard("{ArrowRight}");

    await waitFor(() => {
      expect(slider).toHaveAttribute("aria-valuenow", "80100");
      expect(
        (screen.getByRole("textbox", { name: "Umsatz" }) as HTMLInputElement)
          .value,
      ).toBe("100.100,00 €");
      expect(
        (
          screen.getByRole("textbox", {
            name: "Verrechnete Stunden",
          }) as HTMLInputElement
        ).value,
      ).toBe("1.001,00");
    });
  });

  it("keeps desired profit slider enabled when slider-derived hours round to zero", async () => {
    const user = userEvent.setup();
    render(<App />);

    const [umsatz, aufwand, stunden] = screen.getAllByRole("textbox");

    await user.click(umsatz);
    await user.keyboard("1000");

    await user.click(aufwand);
    await user.keyboard("13");

    await user.click(stunden);
    await user.keyboard("14");
    await user.keyboard("{Enter}");

    const slider = screen.getByRole("slider", { name: "Erzielbarer Gewinn" });
    await waitFor(() => {
      expect(slider).not.toHaveAttribute("aria-disabled", "true");
    });

    slider.focus();
    await user.keyboard("{Home}");

    await waitFor(() => {
      expect(slider).toHaveAttribute("aria-valuenow", "1");
      expect(slider).not.toHaveAttribute("aria-disabled", "true");
      expect(
        (
          screen.getByRole("textbox", {
            name: "Verrechnete Stunden",
          }) as HTMLInputElement
        ).value,
      ).toBe("0,00");
    });
  });

  it("commits numeric input with Enter and recalculates", async () => {
    const user = userEvent.setup();
    render(<App />);

    const [umsatz, aufwand, stunden] = screen.getAllByRole("textbox");

    await user.click(umsatz);
    await user.keyboard("100000");

    await user.click(aufwand);
    await user.keyboard("20000");

    await user.click(stunden);
    await user.keyboard("1000");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText("Potenzial inkl. neuer Mitarbeiter"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("slider", { name: "Erzielbarer Gewinn" }),
      ).not.toHaveAttribute("aria-disabled", "true");
    });
  });

  it("formats, clamps, and filters general numeric fields", async () => {
    const user = userEvent.setup();
    render(<App />);

    const umsatz = screen.getByRole("textbox", {
      name: "Umsatz",
    }) as HTMLInputElement;
    await user.click(umsatz);
    await user.keyboard("9999999999");
    await user.tab();

    expect(umsatz.value).toBe("2.147.483.647,00 €");

    const aufwand = screen.getByRole("textbox", {
      name: "Aufwand",
    }) as HTMLInputElement;
    await user.click(aufwand);
    await user.keyboard("-5");
    await user.tab();

    expect(aufwand.value).toBe("0,00 €");

    const stunden = screen.getByRole("textbox", {
      name: "Verrechnete Stunden",
    }) as HTMLInputElement;
    await user.click(stunden);
    await user.keyboard("abc1000x");
    expect(stunden.value).toBe("1000");
    await user.tab();

    expect(stunden.value).toBe("1.000,00");
  });

  it("keeps monthly and yearly additional employee costs in sync", async () => {
    const user = userEvent.setup();
    render(<App />);

    const monatlich = screen.getByRole("textbox", {
      name: "Daten Mitarbeiter 1: Zusatzkosten monatlich",
    }) as HTMLInputElement;
    const jaehrlich = screen.getByRole("textbox", {
      name: "Daten Mitarbeiter 1: Zusatzkosten jährlich",
    }) as HTMLInputElement;

    await user.click(monatlich);
    await user.keyboard("120");
    await user.tab();

    expect(monatlich.value).toBe("120,00 €");
    expect(jaehrlich.value).toBe("1.440,00 €");

    await user.click(jaehrlich);
    await user.clear(jaehrlich);
    await user.keyboard("2400");
    await user.tab();

    expect(monatlich.value).toBe("200,00 €");
    expect(jaehrlich.value).toBe("2.400,00 €");
  });

  it("keeps only one employee form open at a time", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("textbox", {
        name: "Daten Mitarbeiter 1: Bruttoentgelt pro Monat",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", {
        name: "Daten Mitarbeiter 2: Bruttoentgelt pro Monat",
      }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Daten Mitarbeiter(?::in)? 2/ }),
    );

    expect(
      screen.queryByRole("textbox", {
        name: "Daten Mitarbeiter 1: Bruttoentgelt pro Monat",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", {
        name: "Daten Mitarbeiter 2: Bruttoentgelt pro Monat",
      }),
    ).toBeInTheDocument();
  });

  it("shows the included employee count dynamically", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("img", {
        name: "1 von 4 Mitarbeitern in der Berechnung enthalten",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Daten Mitarbeiter(?::in)? 2/ }),
    );
    await user.click(screen.getByRole("button", { name: "Zurücksetzen" }));

    expect(
      screen.getByRole("img", {
        name: "2 von 4 Mitarbeitern in der Berechnung enthalten",
      }),
    ).toBeInTheDocument();
  });

  it("clears employee form values to zero", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Löschen" }));
    await user.click(
      screen.getByRole("button", { name: /Daten Mitarbeiter(?::in)? 1/ }),
    );

    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 1: Bruttoentgelt pro Monat",
        }) as HTMLInputElement
      ).value,
    ).toBe("0,00 €");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 1: Anzahl Wochenstunden",
        }) as HTMLInputElement
      ).value,
    ).toBe("0,00");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 1: Anzahl Beschäftigungsmonate",
        }) as HTMLInputElement
      ).value,
    ).toBe("0");
  });

  it("applies default employee field values by employment type", async () => {
    const user = userEvent.setup();
    render(<App />);

    const employmentType = screen.getByRole("combobox", {
      name: "Daten Mitarbeiter 1: Beschäftigungsform",
    });
    const salary = screen.getByRole("textbox", {
      name: "Daten Mitarbeiter 1: Bruttoentgelt pro Monat",
    }) as HTMLInputElement;
    const hours = screen.getByRole("textbox", {
      name: "Daten Mitarbeiter 1: Anzahl Wochenstunden",
    }) as HTMLInputElement;
    const months = screen.getByRole("textbox", {
      name: "Daten Mitarbeiter 1: Anzahl Beschäftigungsmonate",
    }) as HTMLInputElement;

    expect(salary.value).toBe("2.200,00 €");
    expect(hours.value).toBe("38,50");
    expect(months.value).toBe("12");

    await user.click(employmentType);
    await user.click(
      await screen.findByRole("option", {
        name: "Freier Dienstvertrag",
      }),
    );

    expect(salary.value).toBe("2.200,00 €");
    expect(hours.value).toBe("38,50");
    expect(months.value).toBe("12");

    await user.click(employmentType);
    await user.click(
      await screen.findByRole("option", {
        name: "Geringfügiges Dienstverhältnis",
      }),
    );

    expect(salary.value).toBe("0,00 €");
    expect(hours.value).toBe("0,00");
    expect(months.value).toBe("0");

    await user.click(employmentType);
    await user.click(await screen.findByRole("option", { name: "Lehrling" }));

    expect(salary.value).toBe("0,00 €");
    expect(hours.value).toBe("0,00");
    expect(months.value).toBe("0");
  });

  it("allows EPU funding for only one included employee and clears it when toggled off", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: /Daten Mitarbeiter(?::in)? 2/ }),
    );
    await user.click(screen.getByRole("button", { name: "Zurücksetzen" }));

    const epuSwitch = screen.getByRole("switch", {
      name: "EPU Lohnnebenkostenförderung",
    });

    await user.click(epuSwitch);
    expect(
      screen.queryByText(tStr("voraussetzungenTitel")),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Voraussetzungen" }));
    expect(screen.getByText(tStr("voraussetzungenTitel"))).toBeInTheDocument();

    const employee1 = screen.getByRole("checkbox", {
      name: "Für Mitarbeiter:in 1",
    }) as HTMLButtonElement;
    const employee2 = screen.getByRole("checkbox", {
      name: "Für Mitarbeiter:in 2",
    }) as HTMLButtonElement;
    const employee3 = screen.getByRole("checkbox", {
      name: "Für Mitarbeiter:in 3",
    }) as HTMLButtonElement;

    expect(employee1).not.toBeChecked();
    expect(employee2).not.toBeChecked();
    expect(employee3).toBeDisabled();

    await user.click(employee2);
    expect(employee1).not.toBeChecked();
    expect(employee2).toBeChecked();

    await user.click(employee1);
    expect(employee1).toBeChecked();
    expect(employee2).not.toBeChecked();

    await user.click(epuSwitch);
    expect(
      screen.queryByRole("checkbox", { name: "Für Mitarbeiter:in 1" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(tStr("voraussetzungenTitel")),
    ).not.toBeInTheDocument();

    await user.click(epuSwitch);
    expect(
      screen.queryByText(tStr("voraussetzungenTitel")),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Für Mitarbeiter:in 1" }),
    ).not.toBeChecked();
  });

  it("clears top inputs and employee defaults without returning review to intro on branch change", async () => {
    const user = userEvent.setup();
    render(<App />);

    const [umsatz, aufwand, stunden] = screen.getAllByRole("textbox");

    await user.click(umsatz);
    await user.keyboard("100000");

    await user.click(aufwand);
    await user.keyboard("20000");

    await user.click(stunden);
    await user.keyboard("1000");
    await user.tab();

    const slider = screen.getByRole("slider", { name: "Erzielbarer Gewinn" });
    await waitFor(() => {
      expect(slider).not.toHaveAttribute("aria-disabled", "true");
    });

    await user.click(screen.getByRole("combobox", { name: "Branche" }));
    await user.click(
      await screen.findByRole("option", { name: "Gastronomie" }),
    );

    expect(
      screen.queryByRole("textbox", { name: "Verrechnete Stunden" }),
    ).not.toBeInTheDocument();

    expect(
      (screen.getByRole("textbox", { name: "Umsatz" }) as HTMLInputElement)
        .value,
    ).toContain("0,00");
    expect(
      (screen.getByRole("textbox", { name: "Aufwand" }) as HTMLInputElement)
        .value,
    ).toContain("0,00");
    const wareneinsatz = screen.getByRole("textbox", { name: "Wareneinsatz" });
    expect((wareneinsatz as HTMLInputElement).value).toContain("0,00");
    expect(
      screen.getByRole("combobox", {
        name: /Daten Mitarbeiter 1: Besch/,
      }),
    ).toHaveTextContent("Arbeiter");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 1: Bruttoentgelt pro Monat",
        }) as HTMLInputElement
      ).value,
    ).toBe("1.500,00 €");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 1: Anzahl Wochenstunden",
        }) as HTMLInputElement
      ).value,
    ).toBe("40,00");
    expect(
      screen.queryByText(/Was kosten Ihre ersten\s+Mitarbeiter:innen/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Potenzial inkl. neuer Mitarbeiter"),
    ).toBeInTheDocument();
    expect(screen.getByText("- Personalkosten")).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Erzielbarer Gewinn" }),
    ).toHaveAttribute("data-disabled", "");

    await user.click(screen.getByRole("textbox", { name: "Umsatz" }));
    await user.keyboard("100000");

    await user.click(screen.getByRole("textbox", { name: "Aufwand" }));
    await user.keyboard("20000");

    await user.click(screen.getByRole("textbox", { name: "Wareneinsatz" }));
    await user.keyboard("10000");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByRole("slider", { name: "Erzielbarer Gewinn" }),
      ).not.toHaveAttribute("data-disabled");
    });
  });

  it("resets employee forms to selected branch defaults on branch change", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Löschen" }));
    await user.click(
      screen.getByRole("button", { name: /Daten Mitarbeiter(?::in)? 2/ }),
    );
    await user.click(screen.getByRole("button", { name: "Zurücksetzen" }));

    await user.click(screen.getByRole("combobox", { name: "Branche" }));
    await user.click(await screen.findByRole("option", { name: "Provision" }));

    expect(
      screen.getByRole("combobox", {
        name: /Daten Mitarbeiter 1: Besch/,
      }),
    ).toHaveTextContent("Angestellter");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 1: Bruttoentgelt pro Monat",
        }) as HTMLInputElement
      ).value,
    ).toBe("1.800,00 €");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 1: Anzahl Wochenstunden",
        }) as HTMLInputElement
      ).value,
    ).toBe("38,50");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 1: Anzahl Beschäftigungsmonate",
        }) as HTMLInputElement
      ).value,
    ).toBe("12");

    await user.click(
      screen.getByRole("button", { name: /Daten Mitarbeiter(?::in)? 2/ }),
    );

    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 2: Bruttoentgelt pro Monat",
        }) as HTMLInputElement
      ).value,
    ).toBe("0,00 €");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Daten Mitarbeiter 2: Anzahl Wochenstunden",
        }) as HTMLInputElement
      ).value,
    ).toBe("0,00");
  });

  it("uses provision-specific input and review labels", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("combobox", { name: "Branche" }));
    await user.click(await screen.findByRole("option", { name: "Provision" }));

    expect(
      await screen.findByRole("textbox", { name: "Umsatz" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Provision in %" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("textbox", { name: "Umsatz" }));
    await user.keyboard("100000");

    await user.click(screen.getByRole("textbox", { name: "Aufwand" }));
    await user.keyboard("20000");

    await user.click(screen.getByRole("textbox", { name: "Provision in %" }));
    await user.keyboard("10");
    await user.tab();

    expect(
      await screen.findByText("Mindest-Provisionsumsatz"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Provisionsumsatz").length).toBeGreaterThan(0);
  });

  it("shows potential revenue increase inputs and hides Gesamtstunden outside hour branches", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("combobox", { name: "Branche" }));
    await user.click(await screen.findByRole("option", { name: "Handel" }));

    expect(
      screen.getByText("Potenzielle Umsatzsteigerung"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Verkaufbare Stunden")).not.toBeInTheDocument();

    await user.click(screen.getByRole("textbox", { name: "Umsatz" }));
    await user.keyboard("160000");

    await user.click(screen.getByRole("textbox", { name: "Aufwand" }));
    await user.keyboard("50000");

    await user.click(screen.getByRole("textbox", { name: "Wareneinsatz" }));
    await user.keyboard("70000");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("Potenzial inkl. neuer Mitarbeiter"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Gesamtstunden")).not.toBeInTheDocument();
    });
  });

  it("formats and clamps percent inputs", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("combobox", { name: "Branche" }));
    await user.click(await screen.findByRole("option", { name: "Provision" }));

    const provision = (await screen.findByRole("textbox", {
      name: "Provision in %",
    })) as HTMLInputElement;
    await user.click(provision);
    await user.keyboard("150");
    await user.tab();

    expect(provision.value).toBe("100,00");
  });
});
