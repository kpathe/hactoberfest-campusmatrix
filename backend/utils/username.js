import User from "../models/User.js";
import { normalizeUsername } from "./validation.js";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._]+/g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, 20);

export const generateUsernameBase = ({ username, email, name }) => {
  const candidates = [
    normalizeUsername(username),
    slugify(email?.split("@")?.[0]),
    slugify(name),
    "campus.user",
  ].filter(Boolean);

  return candidates[0];
};

export const ensureUniqueUsername = async ({ username, email, name, excludeUserId } = {}) => {
  const base = generateUsernameBase({ username, email, name }).slice(0, 20) || "campus.user";
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await User.findOne({
      username: candidate,
      ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}),
    }).select("_id");

    if (!existing) return candidate;

    const suffixText = String(suffix);
    candidate = `${base.slice(0, Math.max(1, 20 - suffixText.length))}${suffixText}`;
    suffix += 1;
  }
};
