import { readOnlyJson } from "../_handler.js";
import { PROFILE } from "../_data.js";

const GROUPS = Object.keys(PROFILE.skills);

/** GET /api/v1/skills — Kaushal's technical skills, optionally by group. */
export default readOnlyJson((req) => {
  const group = req.query.group as string | undefined;
  if (group && !GROUPS.includes(group)) {
    return {
      error: {
        status: 400,
        code: "invalid_parameter",
        title: "Invalid group",
        detail: `Unknown group "${group}". Valid values: ${GROUPS.join(", ")}.`,
        extra: { parameter: "group", allowedValues: GROUPS },
      },
    };
  }
  const data = group
    ? { [group]: PROFILE.skills[group as keyof typeof PROFILE.skills] }
    : PROFILE.skills;
  return { data, meta: { group: group ?? null, groups: GROUPS } };
});
