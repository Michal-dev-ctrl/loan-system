import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_RECEIPT_TO,
  buildReceiptEmailText,
  getConfiguredReceiptTo,
  missingResendKeyMessage,
  resolveReceiptDestination,
} from "../email/receipt";

describe("receipt email destination", () => {
  it("always sends to the gmach inbox by default", () => {
    delete process.env.RECEIPT_EMAIL_TO;
    const result = resolveReceiptDestination("customer@gmail.com");
    assert.equal(result.to, DEFAULT_RECEIPT_TO);
    assert.equal(result.customerEmail, "customer@gmail.com");
  });

  it("keeps customer email in the body for documentation", () => {
    const text = buildReceiptEmailText("שורת קבלה", "a@b.com");
    assert.match(text, /מייל לקוח/);
    assert.match(text, /a@b.com/);
    assert.match(text, /שורת קבלה/);
  });

  it("allows overriding destination via RECEIPT_EMAIL_TO", () => {
    process.env.RECEIPT_EMAIL_TO = "other@example.com";
    assert.equal(getConfiguredReceiptTo(), "other@example.com");
    delete process.env.RECEIPT_EMAIL_TO;
  });

  it("explains missing API key in Hebrew", () => {
    const msg = missingResendKeyMessage();
    assert.match(msg, /RESEND_API_KEY/);
    assert.match(msg, /Vercel/);
  });
});
