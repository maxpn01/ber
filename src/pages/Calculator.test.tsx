import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "@/App";
import { tStr } from "@/lib/text";

describe("Calculator page", () => {
  it("has original-site help text for branch and dynamic general fields", () => {
    expect(tStr("brancheHelp")).toContain(
      "Die Ermittlung des Break-Even-Umsatzes erfolgt je nach angegebener Kategorie unterschiedlich",
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
  });

  it("preselects Dienstleistung and shows all branch options", async () => {
    const user = userEvent.setup();
    render(<App />);

    const branch = screen.getByRole("combobox", { name: "Branche" });
    expect(branch).toHaveTextContent("Dienstleistung");
    expect(branch).not.toHaveClass("border-wko-red");

    await user.click(branch);

    expect(await screen.findByRole("option", { name: "Dienstleistung" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Gastronomie" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Handel" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", {
        name: "Gewerbe-Handel-Dienstleistung/Handwerk",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Provision" })).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Gastronomie" }));

    await waitFor(() => {
      expect(branch).toHaveClass("border-wko-red");
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

    expect(screen.getByText("Was kosten Ihre Ersten Mitarbeiter?")).toBeInTheDocument();

    await user.tab();

    await waitFor(() => {
      expect(screen.getByText("Potenzial inkl. neuer Mitarbeiter")).toBeInTheDocument();
      expect(screen.queryByText("Was kosten Ihre Ersten Mitarbeiter?")).not.toBeInTheDocument();
      const slider = screen.getByRole("slider", { name: "Erzielbarer Gewinn" });
      expect(slider).toHaveAttribute("aria-valuenow", "80000");
      expect(slider).not.toHaveAttribute("aria-disabled", "true");
    });
  });

  it("keeps only one employee form open at a time", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("textbox", {
        name: "Daten Mitarbeiter 1: Bruttogehalt pro Monat",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", {
        name: "Daten Mitarbeiter 2: Bruttogehalt pro Monat",
      }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Daten Mitarbeiter 2/ }));

    expect(
      screen.queryByRole("textbox", {
        name: "Daten Mitarbeiter 1: Bruttogehalt pro Monat",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", {
        name: "Daten Mitarbeiter 2: Bruttogehalt pro Monat",
      }),
    ).toBeInTheDocument();
  });

  it("clears top inputs, employee defaults, and review state on branch change", async () => {
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
    await user.click(await screen.findByRole("option", { name: "Gastronomie" }));

    expect(
      screen.queryByRole("textbox", { name: "Verrechnete Stunden" }),
    ).not.toBeInTheDocument();

    expect((screen.getByRole("textbox", { name: "Umsatz" }) as HTMLInputElement).value).toContain(
      "0,00",
    );
    expect((screen.getByRole("textbox", { name: "Aufwand" }) as HTMLInputElement).value).toContain(
      "0,00",
    );
    const wareneinsatz = screen.getByRole("textbox", { name: "Wareneinsatz" });
    expect((wareneinsatz as HTMLInputElement).value).toContain("0,00");
    expect(
      screen.getByRole("combobox", {
        name: /Daten Mitarbeiter 1: Besch/,
      }),
    ).toHaveTextContent("Arbeiter");
    expect(screen.getByText("Was kosten Ihre Ersten Mitarbeiter?")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Erzielbarer Gewinn" })).toHaveAttribute(
      "data-disabled",
      "",
    );

    await user.click(screen.getByRole("textbox", { name: "Umsatz" }));
    await user.keyboard("100000");

    await user.click(screen.getByRole("textbox", { name: "Aufwand" }));
    await user.keyboard("20000");

    await user.click(screen.getByRole("textbox", { name: "Wareneinsatz" }));
    await user.keyboard("10000");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole("slider", { name: "Erzielbarer Gewinn" })).not.toHaveAttribute(
        "data-disabled",
      );
    });
  });

  it("uses provision-specific input and review labels", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("combobox", { name: "Branche" }));
    await user.click(await screen.findByRole("option", { name: "Provision" }));

    expect(
      screen.getByRole("textbox", { name: "Provisionsumsatz" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Umsatz" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Provision in %" })).toBeInTheDocument();

    await user.click(screen.getByRole("textbox", { name: "Provisionsumsatz" }));
    await user.keyboard("100000");

    await user.click(screen.getByRole("textbox", { name: "Aufwand" }));
    await user.keyboard("20000");

    await user.click(screen.getByRole("textbox", { name: "Provision in %" }));
    await user.keyboard("10");
    await user.tab();

    expect(await screen.findByText("Break-Even-Provisionsumsatz")).toBeInTheDocument();
    expect(screen.getAllByText("Provisionsumsatz").length).toBeGreaterThan(0);
  });
});
