import type { SavedRental } from "../rentals/types";

export type ReceiptCatalogItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
};

export type BuiltReceipt = {
  subject: string;
  text: string;
  html: string;
};

function formatDisplayDate(iso: string): string {
  if (!iso || iso.length < 10) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  const yy = y.length === 4 ? y.slice(-2) : y;
  return `${d}-${m}-${yy}`;
}

function depositLabel(option: SavedRental["deposit"]["option"]): string {
  return option === "cheque" ? "צ'ק פיקדון + תרומה" : "פיקדון מזומן + תרומה";
}

function selectedItems(
  rental: SavedRental,
  catalog: ReceiptCatalogItem[],
): Array<{ name: string; qty: number; price: number; lineTotal: number }> {
  const rows: Array<{
    name: string;
    qty: number;
    price: number;
    lineTotal: number;
  }> = [];
  for (const item of catalog) {
    const qty = rental.items?.[item.id] || 0;
    if (qty <= 0) continue;
    rows.push({
      name: item.name,
      qty,
      price: item.price,
      lineTotal: qty * item.price,
    });
  }
  return rows;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** בונה קבלה מסודרת (טקסט + HTML בעברית) לשליחה במייל / WhatsApp */
export function buildReceiptContent(
  rental: SavedRental,
  catalog: ReceiptCatalogItem[],
  options?: { customerEmail?: string | null },
): BuiltReceipt {
  const customerEmail = options?.customerEmail?.trim() || null;
  const items = selectedItems(rental, catalog);
  const created = formatDisplayDate(rental.createdAt);
  const fullName =
    `${rental.personal.firstName} ${rental.personal.lastName}`.trim();

  const textLines: string[] = [];
  textLines.push('גמ"ח אור לכלה שמחת "יום טוב"');
  textLines.push("══════════════════════════");
  textLines.push("סיכום הזמנה וקבלה");
  textLines.push("");
  if (customerEmail) {
    textLines.push(`מייל לקוח (לתיעוד): ${customerEmail}`);
    textLines.push("");
  }
  textLines.push(`מספר הזמנה: ${rental.id}`);
  textLines.push(`תאריך יצירה: ${created || rental.createdAt}`);
  textLines.push("");
  textLines.push("— פרטי לקוח —");
  textLines.push(`שם: ${fullName}`);
  textLines.push(`טלפון 1: ${rental.personal.phone1}`);
  if (rental.personal.phone2) {
    textLines.push(`טלפון 2: ${rental.personal.phone2}`);
  }
  textLines.push("");
  textLines.push("— פיקדון ותרומה —");
  textLines.push(`סוג: ${depositLabel(rental.deposit.option)}`);
  textLines.push(`סכום פיקדון: ${rental.deposit.depositAmount} ₪`);
  textLines.push(`תרומה: ${rental.deposit.donationAmount} ₪`);
  textLines.push("");
  textLines.push("— תאריכים —");
  textLines.push(`לקיחה: ${formatDisplayDate(rental.dates.pickupDate)}`);
  textLines.push(`החזרה: ${formatDisplayDate(rental.dates.returnDate)}`);
  textLines.push("");
  textLines.push("— ציוד ופריטים —");
  if (items.length === 0) {
    textLines.push("לא נבחרו פריטים");
  } else {
    for (const row of items) {
      const pricePart =
        row.price > 0 ? ` · ${row.price} ₪ × ${row.qty} = ${row.lineTotal} ₪` : "";
      textLines.push(`• ${row.name} × ${row.qty}${pricePart}`);
    }
  }
  if (rental.notes?.trim()) {
    textLines.push("");
    textLines.push("— פרטים נוספים —");
    textLines.push(rental.notes.trim());
  }
  textLines.push("");
  textLines.push("— סכומים —");
  textLines.push(`תרומה: ${rental.totals.donation} ₪`);
  if (rental.deposit.option === "cash") {
    textLines.push(`פיקדון מזומן: ${rental.totals.depositAmount} ₪`);
  }
  textLines.push(`רכישת מוצרים: ${rental.totals.purchaseTotal} ₪`);
  if (rental.totals.rentalTotal > 0) {
    textLines.push(`השכרת ציוד: ${rental.totals.rentalTotal} ₪`);
  }
  if (
    typeof rental.extraChargeAmount === "number" &&
    rental.extraChargeAmount > 0
  ) {
    textLines.push(`חיוב נוסף: ${rental.extraChargeAmount} ₪`);
  }
  textLines.push(`סה"כ לתשלום עכשיו: ${rental.totals.totalToPayNow} ₪`);
  textLines.push("");
  textLines.push("תודה ובהצלחה!");
  textLines.push('גמ"ח אור לכלה שמחת "יום טוב"');

  const itemRowsHtml =
    items.length === 0
      ? `<tr><td colspan="3" style="padding:8px;border-bottom:1px solid #eee;">לא נבחרו פריטים</td></tr>`
      : items
          .map(
            (row) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(row.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${row.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:left;" dir="ltr">${
            row.price > 0 ? `${row.lineTotal} ₪` : "—"
          }</td>
        </tr>`,
          )
          .join("");

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f7f2f3;font-family:Arial,Helvetica,sans-serif;color:#222;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border:1px solid #f0d6db;border-radius:12px;overflow:hidden;">
    <div style="background:#c85a6c;color:#fff;padding:20px 24px;text-align:center;">
      <div style="font-size:20px;font-weight:bold;">גמ&quot;ח אור לכלה שמחת &quot;יום טוב&quot;</div>
      <div style="margin-top:6px;font-size:14px;">סיכום הזמנה וקבלה</div>
    </div>
    <div style="padding:20px 24px;font-size:14px;line-height:1.6;">
      ${
        customerEmail
          ? `<p style="margin:0 0 12px;color:#666;">מייל לקוח (לתיעוד): <span dir="ltr">${escapeHtml(customerEmail)}</span></p>`
          : ""
      }
      <p style="margin:0 0 4px;"><strong>מספר הזמנה:</strong> ${escapeHtml(String(rental.id))}</p>
      <p style="margin:0 0 16px;"><strong>תאריך יצירה:</strong> ${escapeHtml(created || rental.createdAt)}</p>

      <h3 style="margin:0 0 8px;color:#c85a6c;font-size:15px;">פרטי לקוח</h3>
      <p style="margin:0 0 4px;">שם: ${escapeHtml(fullName)}</p>
      <p style="margin:0 0 4px;">טלפון 1: <span dir="ltr">${escapeHtml(rental.personal.phone1)}</span></p>
      ${
        rental.personal.phone2
          ? `<p style="margin:0 0 16px;">טלפון 2: <span dir="ltr">${escapeHtml(rental.personal.phone2)}</span></p>`
          : `<div style="height:12px"></div>`
      }

      <h3 style="margin:0 0 8px;color:#c85a6c;font-size:15px;">פיקדון ותרומה</h3>
      <p style="margin:0 0 4px;">סוג: ${escapeHtml(depositLabel(rental.deposit.option))}</p>
      <p style="margin:0 0 4px;">סכום פיקדון: ${rental.deposit.depositAmount} ₪</p>
      <p style="margin:0 0 16px;">תרומה: ${rental.deposit.donationAmount} ₪</p>

      <h3 style="margin:0 0 8px;color:#c85a6c;font-size:15px;">תאריכים</h3>
      <p style="margin:0 0 4px;">לקיחה: ${escapeHtml(formatDisplayDate(rental.dates.pickupDate))}</p>
      <p style="margin:0 0 16px;">החזרה: ${escapeHtml(formatDisplayDate(rental.dates.returnDate))}</p>

      <h3 style="margin:0 0 8px;color:#c85a6c;font-size:15px;">ציוד ופריטים</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;">
        <thead>
          <tr style="background:#f7f2f3;">
            <th style="padding:8px;text-align:right;">פריט</th>
            <th style="padding:8px;text-align:center;">כמות</th>
            <th style="padding:8px;text-align:left;">סה״כ</th>
          </tr>
        </thead>
        <tbody>${itemRowsHtml}</tbody>
      </table>

      ${
        rental.notes?.trim()
          ? `<h3 style="margin:0 0 8px;color:#c85a6c;font-size:15px;">פרטים נוספים</h3>
             <p style="margin:0 0 16px;white-space:pre-wrap;">${escapeHtml(rental.notes.trim())}</p>`
          : ""
      }

      <h3 style="margin:0 0 8px;color:#c85a6c;font-size:15px;">סכומים</h3>
      <p style="margin:0 0 4px;">תרומה: ${rental.totals.donation} ₪</p>
      ${
        rental.deposit.option === "cash"
          ? `<p style="margin:0 0 4px;">פיקדון מזומן: ${rental.totals.depositAmount} ₪</p>`
          : ""
      }
      <p style="margin:0 0 4px;">רכישת מוצרים: ${rental.totals.purchaseTotal} ₪</p>
      ${
        rental.totals.rentalTotal > 0
          ? `<p style="margin:0 0 4px;">השכרת ציוד: ${rental.totals.rentalTotal} ₪</p>`
          : ""
      }
      ${
        typeof rental.extraChargeAmount === "number" &&
        rental.extraChargeAmount > 0
          ? `<p style="margin:0 0 4px;">חיוב נוסף: ${rental.extraChargeAmount} ₪</p>`
          : ""
      }
      <p style="margin:12px 0 0;font-size:16px;font-weight:bold;color:#c85a6c;">
        סה&quot;כ לתשלום עכשיו: ${rental.totals.totalToPayNow} ₪
      </p>
    </div>
    <div style="padding:14px 24px;background:#faf7f8;color:#666;font-size:12px;text-align:center;">
      תודה ובהצלחה · גמ&quot;ח אור לכלה שמחת &quot;יום טוב&quot;
    </div>
  </div>
</body>
</html>`;

  return {
    subject: `קבלה ממערכת ההשאלה של גמ״ח אור לכלה – הזמנה ${rental.id}`,
    text: textLines.join("\n"),
    html,
  };
}
