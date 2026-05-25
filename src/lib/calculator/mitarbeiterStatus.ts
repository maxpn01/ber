import { showsUmsatzsteigerung, showsVerkaufbareStunden } from "./branche";
import type { Branche, InputMitarbeiter } from "./types";

export const isMitarbeiterBasicComplete = (m: InputMitarbeiter) =>
  !!m.beschaeftigungsform &&
  m.bruttogehaltProMonat > 0 &&
  m.anzahlWochenstunden > 0 &&
  m.anzahlBeschaeftigungsmonate > 0;

export const isMitarbeiterAdvancedComplete = (
  m: InputMitarbeiter,
  branche: Branche,
) => {
  if (!isMitarbeiterBasicComplete(m)) return false;
  if (showsVerkaufbareStunden(branche)) {
    return m.verkaufbareStunden > 0 && m.stundensatz > 0;
  }
  if (showsUmsatzsteigerung(branche)) {
    return m.umsatzsteigerung > 0;
  }
  return true;
};

export const hasMitarbeiterInput = (m: InputMitarbeiter) =>
  m.bruttogehaltProMonat > 0 ||
  m.anzahlWochenstunden > 0 ||
  m.zusatzkostenMonatlich > 0 ||
  m.zusatzkostenJaehrlich > 0 ||
  m.verkaufbareStunden > 0 ||
  m.stundensatz > 0 ||
  m.umsatzsteigerung > 0 ||
  m.foerderung ||
  m.foerderungBonus ||
  m.foerderungStartUp;
