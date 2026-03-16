import { HOSTEL_SEQ } from "./constants";

export function buildMonthPills(fees) {
  const monthSet = new Set(fees.map(f => f.month));
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const years = [...new Set(fees.map(f => f.month.split(" ")[1]))].sort();
  const pills = [{ label: "All", val: "all" }];
  years.forEach(yr => {
    months.forEach(mo => {
      const val = `${mo} ${yr}`;
      if (monthSet.has(val)) {
        pills.push({ label: val, val });
      } else {
        pills.push({ label: val, val, empty: true });
      }
    });
  });
  return pills;
}

export function resolveStatus(f) {
  if (f.status === "paid") return "paid";
  const [d, m, y] = f.pub.split("/");
  const publishDate = new Date(+y, +m - 1, +d);
  const sixMonthsLater = new Date(publishDate);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  if (Date.now() > sixMonthsLater.getTime()) return "overdue";
  return f.status;
}

export function genAttendance(year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  const data = {};
  for (let d = 1; d <= days; d++) {
    data[d] = HOSTEL_SEQ[(d + month * 7 + year) % HOSTEL_SEQ.length];
  }
  return data;
}

export function fmtCurrency(n) { 
  return `₹${n.toLocaleString("en-IN")}`; 
}
