const MOROCCAN_PHONE_LOCAL_REGEX = /^0[5-7]\d{8}$/;
export const normalizeMoroccanPhone = value => {
  if (value === undefined || value === null) {
    return value;
  }
  const trimmed = String(value).trim();
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
export const isValidMoroccanPhone = value => MOROCCAN_PHONE_LOCAL_REGEX.test(normalizeMoroccanPhone(value));
export const moroccanPhoneValidator = {
  validator: isValidMoroccanPhone,
  message: "Please enter a valid Moroccan phone number, for example 0612345678 or +212612345678"
};
