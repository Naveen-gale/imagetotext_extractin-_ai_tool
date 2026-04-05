# ImageToPDF AI Converter

Full-stack MERN application that extracts text from images using Groq AI, reconstructs it using native structures (tables, lists, paragraphs), and outputs formatted PDF/DOCX files.

## Project Structure
- `frontend/`: React + Vite application using Tailwind CSS.
- `backend/`: Node.js + Express application integrating Groq SDK, officeparser, and ImageKit.

---

## 🚀 Production Deployment Guide

We will be deploying the **Backend to Render** and the **Frontend to Vercel**.

### Step 1: Backend Deployment (Render.com)

1. **Create an Account on Render**: Go to [Render](https://render.com) and link your GitHub repository.
2. **Create a New Web Service**:
   - **Repository**: Select your GitHub repo.
   - **Root Directory**: Type `backend` (very important!).
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Environment Variables**: Add exactly these variables dynamically in Render Environment section:
   - `PORT`: `5000` (Optional, Render provides it)
   - `GROQ_API_KEY`: `your_groq_api_key_here`
   - `IMAGEKIT_PUBLIC_KEY`: `your_imagekit_public_key`
   - `IMAGEKIT_PRIVATE_KEY`: `your_imagekit_private_key`
   - `IMAGEKIT_URL_ENDPOINT`: `your_imagekit_url`
   - `FRONTEND_URL`: Leave blank until you deploy Vercel, then come back and add `https://your-frontend-url.vercel.app`.
4. **Deploy**: Click "Create Web Service". 
5. Wait for it to build. **Copy the backend URL** (e.g., `https://imagetopdf-backend.onrender.com`).

*(Note: The backup Python OCR feature (`fallback_ai.py`) is meant for deep-server installations. Render's standard Node environment doesn't include Python + Tesseract. The app works perfectly with Groq directly!)*

### Step 2: Frontend Deployment (Vercel)

1. **Create an Account on Vercel**: Go to [Vercel](https://vercel.com) and link your GitHub.
2. **Add New Project**:
   - Import your GitHub repo.
   - **Framework Preset**: Should automatically detect `Vite`.
   - **Root Directory**: Click "Edit" and select `frontend`.
3. **Environment Variables**:
   - `VITE_API_BASE_URL`: Paste the backend URL you got from Render, appended with `/api/v1` (e.g., `https://imagetopdf-backend.onrender.com/api/v1`).
4. **Deploy**: Click "Deploy".
5. Wait for the build process (it will use `npm run build`). Once completed, Vercel will give you a public URL!

### Step 3: Final Link (CORS)
Go back to your Backend on Render, and ensure `FRONTEND_URL` is set to the Vercel URL you got. This will allow the Vercel frontend to talk securely to the Render backend via CORS. 

---

## 💻 Local Development

1. **Install dependencies in root**:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   npm install concurrently
   ```

2. **Configure `.env` in Backend**:
   Ensure `backend/.env` exists and contains your keys:
   ```env
   PORT=5000
   GROQ_API_KEY=your_key
   IMAGEKIT_PUBLIC_KEY=your_public_key
   IMAGEKIT_PRIVATE_KEY=your_private_key
   IMAGEKIT_URL_ENDPOINT=your_endpoint
   ```

3. **Run the Full App Locally**:
   From the root folder (where this README is), just start the Dev script:
   ```bash
   npm run dev
   ```
   This uses `concurrently` to launch both Frontend (Vite) and Backend (Node) at the same time. Open `http://localhost:5173` to view the app!
