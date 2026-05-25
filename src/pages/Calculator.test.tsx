import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "@/App";

describe("Calculator page", () => {
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
});
