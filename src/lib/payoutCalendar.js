/**
 * generatePayoutICS — creates a downloadable .ics (iCalendar) file from
 * upcoming creator payouts. Works with Google Calendar, Apple Calendar,
 * Outlook, and any calendar app that supports the iCal standard.
 *
 * Pending and processing payouts are included as all-day events on the
 * estimated disbursement date (15th of the month following the cycle).
 */

/** Derive an estimated disbursement date from a payout's cycle string. */
function payoutDateFromCycle(cycle) {
  if (!cycle || typeof cycle !== "string") return null;
  // Cycle format: "YYYY-MM" → disburse on the 15th of the following month
  const [year, month] = cycle.split("-").map(Number);
  if (!year || !month) return null;
  const d = new Date(year, month, 15); // month is 0-indexed, so this is the 15th of next month
  return d;
}

function fmtICSDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function escapeICS(text) {
  return String(text || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * @param {Array} payouts — payout objects with cycle, amount, status, id
 * @returns {string} — full .ics file content
 */
export function generatePayoutICS(payouts) {
  const upcoming = (payouts || []).filter((p) => p.status === "pending" || p.status === "processing");

  const events = upcoming
    .map((p) => {
      const date = payoutDateFromCycle(p.cycle);
      if (!date) return null;
      const start = fmtICSDate(date);
      const endFmt = new Date(date);
      endFmt.setDate(endFmt.getDate() + 1);
      const end = fmtICSDate(endFmt);
      const amount = Number(p.amount || 0).toLocaleString();
      const uid = `payout-${p.id || p.cycle}@livestreamlab.live`;

      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${escapeICS(`Payout Disbursement - ${amount} $STREAMING`)}`,
        `DESCRIPTION:${escapeICS(`Cycle ${p.cycle} payout of ${amount} $STREAMING.\nStatus: ${p.status}`)}`,
        `STATUS:${p.status === "processing" ? "TENTATIVE" : "CONFIRMED"}`,
        "BEGIN:VALARM",
        "TRIGGER:-P1D",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeICS(`Payout disbursement tomorrow: ${amount} $STREAMING`)}`,
        "END:VALARM",
        "END:VEVENT",
      ].join("\r\n");
    })
    .filter(Boolean);

  if (events.length === 0) return null;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LiveStreamLab//Creator OS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:LiveStreamLab Payouts",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Triggers a browser download of the .ics file. */
export function downloadPayoutICS(payouts) {
  const ics = generatePayoutICS(payouts);
  if (!ics) return false;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "livestreamlab-payouts.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/** Count of upcoming payouts that would be synced. */
export function countUpcomingPayouts(payouts) {
  return (payouts || []).filter((p) => p.status === "pending" || p.status === "processing").length;
}