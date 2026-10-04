import Notification from "../models/Notification.js";

export const createNotification = async ({
  user,
  type = "system",
  title,
  body,
  link = "",
  metadata = {},
}) => {
  if (!user || !title || !body) return null;

  return Notification.create({
    user,
    type,
    title,
    body,
    link,
    metadata,
  });
};
