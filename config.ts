import dotenv from "dotenv";
import { PinningService } from "./src/types";

dotenv.config();

export const pinata: PinningService = {
  name: "pinata",
  endpoint: "https://api.pinata.cloud/psa",
  key: `${process.env.PINATA_JWT}`
}
