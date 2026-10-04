const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9._]{3,20}$/;

export const sanitizeArrayInput = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const validateEmail = (email) => EMAIL_REGEX.test(String(email || "").trim().toLowerCase());

export const validateUsername = (username) => USERNAME_REGEX.test(String(username || "").trim().toLowerCase());

export const validatePassword = (password) => {
  const normalized = String(password || "");
  if (normalized.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!/[A-Za-z]/.test(normalized) || !/\d/.test(normalized)) {
    return "Password must include at least one letter and one number.";
  }

  return null;
};

export const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
export const normalizeUsername = (username) => String(username || "").trim().toLowerCase();
