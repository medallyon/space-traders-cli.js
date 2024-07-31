import createClient from "openapi-fetch";

// Missing file SpaceTradersApi? Run `npm run generate-types` to generate it.
import type { paths } from "../SpaceTradersApi";

import Ratelimits from "../middleware/Ratelimits.js";

const BASE_URL = "https://api.spacetraders.io/v2";

const fetch = createClient<paths>({ baseUrl: BASE_URL });
fetch.use(Ratelimits);

export default fetch;
