import fs from "fs";
import { buildReceiptContent } from "../src/lib/email/buildReceipt";
import type { SavedRental } from "../src/lib/rentals/types";

const rental: SavedRental = {
  id: "TEST-99",
  createdAt: "2026-07-21T20:00:00.000Z",
  personal: {
    firstName: "בדיקה",
    lastName: "קבלה",
    phone1: "0556771200",
    phone2: "0524545458",
  },
  deposit: {
    option: "cash",
    chequeName: "",
    chequeNumber: "",
    depositAmount: 200,
    donationAmount: 50,
  },
  dates: { pickupDate: "2026-08-01", returnDate: "2026-08-05" },
  items: {
    "basic-table": 1,
    "happy-instruments-1": 2,
    "basic-arch-flowers": 1,
  },
  totals: {
    donation: 50,
    depositAmount: 200,
    purchaseTotal: 0,
    rentalTotal: 0,
    totalToPayNow: 250,
  },
  notes: "זו קבלת בדיקה – לוודא שהפורמט מסודר",
};

const catalog = [
  { id: "basic-table", name: "מצנח", price: 0 },
  { id: "happy-instruments-1", name: "דרבוקות", price: 0 },
  { id: "basic-arch-flowers", name: "קשתות פרחים", price: 0 },
];

async function main() {
  const receipt = buildReceiptContent(rental, catalog);
  fs.mkdirSync("/opt/cursor/artifacts", { recursive: true });
  fs.writeFileSync("/opt/cursor/artifacts/sample-receipt.html", receipt.html);
  fs.writeFileSync("/opt/cursor/artifacts/sample-receipt.txt", receipt.text);
  console.log("subject:", receipt.subject);
  console.log("wrote /opt/cursor/artifacts/sample-receipt.html");

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to =
    process.env.RECEIPT_EMAIL_TO?.trim() || "g025817999@gmail.com";

  if (!apiKey) {
    console.log(
      "No RESEND_API_KEY in env — skipped live Resend send. HTML sample is ready.",
    );
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: "גמ״ח אור לכלה <onboarding@resend.dev>",
    to: [to],
    subject: `[בדיקה] ${receipt.subject}`,
    text: receipt.text,
    html: receipt.html,
  });

  if (error) {
    console.error("SEND FAILED:", error.message || error);
    process.exitCode = 1;
    return;
  }
  console.log("SEND OK id=", data?.id, "to=", to);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
