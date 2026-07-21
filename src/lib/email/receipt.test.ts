import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  DEFAULT_RECEIPT_TO,
  buildReceiptEmailText,
  getConfiguredReceiptTo,
  missingResendKeyMessage,
  resolveReceiptDestination,
} from "../email/receipt";

describe("receipt email destination", () => {
  beforeEach(() => {
    delete process.env.RECEIPT_EMAIL_TO;
    delete process.env.RECEIPT_ALLOW_CUSTOM_TO;
  });

  it("always sends to the gmach inbox by default", () => {
    assert.equal(DEFAULT_RECEIPT_TO, "g025817999@gmail.com");
    const result = resolveReceiptDestination("customer@gmail.com");
    assert.equal(result.to, DEFAULT_RECEIPT_TO);
    assert.equal(result.customerEmail, "customer@gmail.com");
    assert.equal(result.usedCustomTo, false);
  });

  it("does not duplicate gmach inbox as customer-email note", () => {
    const result = resolveReceiptDestination(DEFAULT_RECEIPT_TO);
    assert.equal(result.to, DEFAULT_RECEIPT_TO);
    assert.equal(result.customerEmail, null);
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
  });

  it("sends to custom address when RECEIPT_ALLOW_CUSTOM_TO is enabled", () => {
    process.env.RECEIPT_ALLOW_CUSTOM_TO = "true";
    const result = resolveReceiptDestination("future@client.com");
    assert.equal(result.to, "future@client.com");
    assert.equal(result.usedCustomTo, true);
  });

  it("explains missing API key in Hebrew", () => {
    const msg = missingResendKeyMessage();
    assert.match(msg, /RESEND_API_KEY/);
    assert.match(msg, /Vercel/);
  });
});
