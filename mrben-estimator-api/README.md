\# 🪟 MrBen AI Estimator API (Backend)



This is the dedicated microservice that handles window counting and pricing logic using Google Gemini (Vertex AI).



\## 🚀 How to Update the Live Server



Unlike the website (which updates automatically via Vercel), updates to this API must be pushed manually to Google Cloud Run.



\### 1. Open PowerShell in this folder

`cd C:\\Users\\bendo\\gemini-project\\mrben.ca\_website\\mrben-estimator-api`



\### 2. Run the Deployment Command

Paste this command to upload your changes and restart the engine:



```powershell

gcloud run deploy mrben-estimator-api `
  --source . `
  --region us-east1 `
  --timeout 300 `
  --service-account mrben-ai-worker@gen-lang-client-0569585575.iam.gserviceaccount.com `
  --allow-unauthenticated


### 3. Fix Permissions (If needed)
If the terminal asks for a password or says "Reauthentication required," run this first:
```powershell
gcloud auth login