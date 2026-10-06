import { readOnlyJson } from "../_handler.js";
import { PROFILE } from "../_data.js";

/** GET /api/v1/profile — structured facts about Kaushal Raj Gupta. */
export default readOnlyJson(() => ({ data: PROFILE }));
