# Contributing to TinexusFlow

First off, thank you for considering contributing to TinexusFlow! We welcome contributions to help improve our branching AI conversation engine.

As TinexusFlow is currently in beta and developed by a solo maintainer, please understand that review times may vary. 

## Local Setup

To run TinexusFlow locally for development:

1. **Clone the repository**
2. **Backend Setup (Java/Spring Boot)**
   - Navigate to `backend/`
   - Copy `.env.example` to `.env` and fill in your Neon PostgreSQL credentials and Gemini API Key
   - Run: `./gradlew bootRun`
3. **Frontend Setup (React/Vite)**
   - Navigate to `frontend/`
   - Copy `.env.example` to `.env` (Optional for local dev as Vite proxies `/api` to localhost:8080)
   - Run: `npm install` and `npm run dev`

For more detailed setup instructions, please refer to the `README.md`.

## Contribution Process

1. **Open an Issue**: Before submitting a large pull request, please open an issue to discuss the proposed change. This ensures your work aligns with the project's direction.
2. **Branching Strategy**: Use clear, descriptive branch names.
   - For features: `feature/your-feature-name`
   - For bug fixes: `fix/bug-description`
3. **Keep PRs Focused**: Submit separate PRs for separate logical changes. Large, monolithic PRs are harder to review.
4. **Testing**: Test your changes thoroughly, including edge cases with branching logic.

## Code Style

- **Frontend**: Follow the existing TailwindCSS design tokens defined in `index.css`. Maintain consistency with the dark/light mode palette.
- **Backend**: Adhere to the standard Spring Boot architecture (Controllers, Services, Repositories). Keep business logic out of controllers.

Thank you for helping make TinexusFlow better!
