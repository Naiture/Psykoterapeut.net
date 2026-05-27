import { BigQuery } from "@google-cloud/bigquery";

let client: BigQuery | null = null;

export function bq(): BigQuery {
  if (client) return client;

  const projectId =
    process.env.GCP_PROJECT_ID || "content-research-491611";

  const jsonCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (jsonCreds) {
    const credentials = JSON.parse(jsonCreds);
    client = new BigQuery({ projectId, credentials });
    return client;
  }

  client = new BigQuery({ projectId });
  return client;
}

export const ADS_CUSTOMER_ID = "2169223464";
export const ADS_DATASET = "content-research-491611.google_ads";
