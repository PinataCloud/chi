import dotenv from "dotenv";

dotenv.config();

export const config = {
  "pinataJwt": process.env.PINATA_JWT,
}
