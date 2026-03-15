import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

if (!clientEmail || !privateKey || !projectId) {
  console.error("Missing environment variables. Please check your .env file.");
  process.exit(1);
}

const vertexAI = new VertexAI({
  project: projectId,
  location: "us-central1",
  googleAuthOptions: {
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
  },
});

const model = vertexAI.getGenerativeModel({
  model: "projects/gen-lang-client-0569585575/locations/us-central1/tunedModels/mrben-pane-counter-v4",
});

async function runTest() {
  console.log("Starting smoke test...");
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Hello, this is a test. Are you online?" }] }],
    });

    console.log("Response received successfully!");
    console.log(JSON.stringify(result.response, null, 2));
  } catch (error) {
    console.error("Smoke test failed!");
    console.error(error);
  }
}

runTest();
