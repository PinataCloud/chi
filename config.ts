import dotenv from "dotenv";

dotenv.config();

export const config = {
    "aiService": "OpenAI", 
    "aiApiKey": process.env.API_KEY, 
    "pinataJwt": process.env.PINATA_JWT, 
    "filebaseKey": process.env.FILEBASE_KEY
}

export const specs = [{
    provider: "Pinata", 
    location_support: "US", 
    avg_ttfb: 300, 
    storage_price: "$0.07 per GB", 
    bandwidth_price: "$0.10 per GB"
}, {
    provider: "Filebase", 
    location_support: "EU",
    avg_ttfb: 500,
    storage_price: "$0.08 per GB", 
    bandwidth_price: "$0.015 per GB"
}]

export const ALLOWED_RULES = [
    "fast", 
    "cheap_storage", 
    "cheap_bandwidth",
    "us_location", 
    "eu_location", 
    "local_location"
]