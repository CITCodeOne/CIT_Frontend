/* Hjaelp: sikrer at korte plot-tekster ender pa '...' uden at tilfoeje dobbelt punkter */
export const formatPlotPre = (s) => {
  if (!s) return ''; // tom input giver tomt svar, sa UI kan vise placeholder
  const t = s.trim(); // fjern mellemrum for og efter teksten
  if (/(?:\u2026|\.{3})$/.test(t)) return t; // hvis teksten allerede ender med … eller ... saa behold den
  if (/\.$/.test(t)) return t + '..'; // slutter den med et enkelt punktum, tilfoej kun to for at undgaa fire
  return t + '...'; // ellers tilfoej standard tre prikker som forhvisning
};