/* helper to format plot preview strings with "..." using regex literals */
export const formatPlotPre = (s) => {
  if (!s) return '';
  const t = s.trim();
  if (/(?:\u2026|\.{3})$/.test(t)) return t;
  if (/\.$/.test(t)) return t + '..'; // If the string ends with a period, add only two dots
  return t + '...';
};