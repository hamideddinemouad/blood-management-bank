export const MOROCCAN_PHONE_HINT = "Use 0612345678 or +212612345678";

export const sanitizeMoroccanPhoneInput = (value) =>
  value.replace(/[^\d+\s()-]/g, "").replace(/(?!^)\+/g, "");

export const normalizeMoroccanPhone = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return "";
  }

  const digitsOnly = trimmed.replace(/\D/g, "");

  if (digitsOnly.startsWith("212") && digitsOnly.length === 12) {
    return `0${digitsOnly.slice(3)}`;
  }

  if (digitsOnly.length === 9 && /^[5-7]\d{8}$/.test(digitsOnly)) {
    return `0${digitsOnly}`;
  }

  return digitsOnly;
};

export const isValidMoroccanPhone = (value) =>
  /^0[5-7]\d{8}$/.test(normalizeMoroccanPhone(value));
