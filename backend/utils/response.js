// backend/src/utils/response.js
export const ok = (res, data = {}, message = "OK") =>
  res.status(200).json({ success: true, message, ...data });

export const fail = (res, status = 400, message = "Error", data = {}) =>
  res.status(status).json({ success: false, message, ...data });
