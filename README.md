# TinexusFlow™ - Conversation Navigation Engine

> **Tagline:** Think in branches, not lines.  
> **Company:** Tinexus — A Tinu's Technology  

TinexusFlow™ is a full-stack conversation platform that transforms linear AI chats into navigable conversation trees. When clarification is needed or topics expand, TinexusFlow creates branching threads. Users can jump between nodes, backtrack to parent/root branches, and resume previous paths, with the AI dynamically rebuilding its context.

---

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.4.1 (Spring Web, Data JPA, Security, Lombok, Validation)
- **AI Integration:** LangChain4j, Google Gemini API
- **Persistence:** Neon AWS PostgreSQL Database (hosted)
- **Frontend:** React 19, Vite, Zustand, Tailwind CSS v4, React Flow v12

---

## Project Structure

```
tinexusflow/
├── backend/                  # Spring Boot 3.4.1 Backend
│   ├── build.gradle
│   ├── .env.example          # Environment variables template
│   └── src/main/java/com/tinexus/tinexusflow/
│       ├── config/           # Security, Cors, LLM configurations
│       ├── controller/       # REST API Controllers
│       ├── dto/              # API payload transfer objects
│       ├── entity/           # JPA entities (Conversation, Node, FlowState)
│       ├── exception/        # Custom exception handlers
│       ├── repository/       # Database access layers
│       ├── service/          # Chat, LLM, Context builder services
│       └── engine/           # TinexusFlow navigation & intelligence
└── frontend/                 # Vite + React 19 Frontend
    ├── package.json
    ├── .env.example          # Frontend configuration template
    └── src/
        ├── components/       # Chat bubbles, React Flow canvases, Sidebars
        ├── store/            # Zustand session and navigation state stores
        └── utils/            # Graph spatial tree layout calculations
```

---

## Installation & Running

### 1. Backend Configuration
The backend connects to your live PostgreSQL database and Gemini API via environment variables.

Copy `backend/.env.example` to `backend/.env` and fill in your details:
```env
DB_URL=jdbc:postgresql://<your-neon-endpoint>/neondb?sslmode=require
DB_USERNAME=your_username
DB_PASSWORD=your_password
GEMINI_API_KEY=your_gemini_api_key

# For deployment (e.g. Render), you can configure CORS:
# ALLOWED_ORIGINS=https://tinexusflow.vercel.app
```

Run the Spring Boot application from the `backend/` directory:
```bash
cd backend
./gradlew bootRun
```

### 2. Frontend Configuration

For local development, no `.env` is required as Vite automatically proxies `/api` to `localhost:8080`.
For production deployment, copy `frontend/.env.example` to `frontend/.env` and set the backend URL:
```env
VITE_API_BASE_URL=https://your-backend-api.onrender.com
```

Install dependencies and run the Vite server from the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on [http://localhost:5173](http://localhost:5173).

---

## MVP Success Verification Flow

Verify the primary innovation of TinexusFlow using the following sequence:

1. **Q1:** Type `"What is AI?"` in the chat.
   - The system creates a `ROOT` node on the map.
2. **Q2:** Type `"Tell me about LLMs."`
   - The system creates a `CLARIFICATION` node branching off the root.
3. **Q3:** Type `"What is a context window?"`
   - The system creates a third nested node.
4. **Action:** Double-click the **Q1** node on the right-hand map, or click the **Q1** breadcrumb path element, or type `"go back"` / `"return parent"` repeatedly.
   - The visual tree highlights **Q1** as the active context node. The message feed updates to show only the conversation up to **Q1**.
5. **Resume:** Type `"Continue"`.
   - The backend checks for continuation options, prompts for clarification if needed, and constructs the context using **only Q1**. The AI continues the discussion from the AI definition (e.g. general machine learning) instead of context window tokens.
