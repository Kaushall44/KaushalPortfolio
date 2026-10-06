import { readOnlyJson } from "../_handler.js";
import { PROFILE } from "../_data.js";

/** GET /api/v1/experience — Kaushal's employment history, newest first. */
export default readOnlyJson((req) => {
  const current = req.query.current;
  const items =
    current === "true"
      ? PROFILE.experience.filter((e) => e.endDate === null)
      : PROFILE.experience;
  return {
    data: items,
    meta: { total: items.length, currentOnly: current === "true" },
  };
});
