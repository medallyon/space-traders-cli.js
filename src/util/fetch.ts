import createClient from "openapi-fetch";

// Missing file SpaceTradersApi? Run `npm run generate-types` to generate it.
import { paths } from "../SpaceTradersApi";

const BASE_URL = "https://api.spacetraders.io/v2";

export default createClient<paths>({ baseUrl: BASE_URL });
