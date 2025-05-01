# Holistic MVP Sprint Plan

This plan assumes roughly **2-week sprint cycles**. It prioritizes foundational elements and addresses key dependencies outlined in the project brief.

**Assumptions:**

*   A development team (even if initially just one person) is ready to start.
*   Basic project infrastructure (repo, communication channels) is set up or will be part of Sprint 0.
*   Technology choices (frontend framework, backend language/framework, database, AI provider) need to be finalized early, likely in Sprint 0. The budget constraint heavily influences the AI choice.

---

## Sprint 0: Foundation & Setup (Weeks 1-2)

*   **Goal:** Establish the core project infrastructure, finalize tech stack, set up user management, and implement the basic data model structure. Mitigate key technical risks early.
*   **Key Features/Tasks:**
    *   **Project Setup:** Initialize codebase repository, set up development environments, establish CI/CD pipeline (optional but recommended).
    *   **Technology Selection & Validation:**
        *   Finalize choices for Frontend (e.g., React, Vue, Svelte), Backend (e.g., Node.js/Express, Python/Flask), Database (e.g., PostgreSQL, MongoDB).
        *   **Crucial:** Research, select, and perform initial testing with potential AI providers (Anthropic Claude, OpenAI GPT, others) focusing on capability vs. cost within the $1500 budget constraint. Validate feasibility for plan generation and chat.
    *   **Data Modeling:** Implement initial database schema based on the data model (focus on `User`, `UserProfile` tables).
    *   **Authentication:** Implement basic user registration and login functionality. Secure password handling.
    *   **Basic Layout:** Create the main application shell/layout (header, navigation placeholder, main content area).
*   **Potential Risks:** AI provider cost/capability mismatch, incorrect technology choices impacting future sprints.
*   **Definition of Done:** Project structure exists, core technologies chosen and validated, basic user signup/login works, initial DB schema migrated.

---

## Sprint 1: Adaptive Onboarding (Weeks 3-4)

*   **Goal:** Implement the dynamic onboarding quiz to collect initial user profile data.
*   **Key Features/Tasks:**
    *   **Onboarding UI:** Develop the wizard-style, one-question-at-a-time quiz interface with progress indicators.
    *   **Onboarding Logic:** Implement backend logic to:
        *   Serve questions dynamically based on previous answers.
        *   Provide immediate value/feedback snippets during the quiz.
        *   Store collected answers and update the `UserProfile.profile_data` JSON field.
        *   Update `User.onboarding_status`.
    *   **UserProfile Refinement:** Adjust `UserProfile` schema/handling based on finalized quiz questions.
*   **Potential Risks:** Complex conditional logic for quiz adaptation, structuring profile data effectively in JSON.
*   **Definition of Done:** Users can complete the onboarding quiz, data is saved correctly to their `UserProfile`, onboarding status is tracked.

---

## Sprint 2: Personalized Plan Generation (Exercise Focus) (Weeks 5-6)

*   **Goal:** Integrate the chosen AI to generate the first part of the personalized plan (Exercise) based on the user's profile.
*   **Key Features/Tasks:**
    *   **AI Integration (Core):** Build the service/module to interact with the selected AI API. Handle API keys securely.
    *   **Plan Generation Logic (Exercise):**
        *   Develop backend endpoint/function that takes `UserProfile` data.
        *   Construct appropriate prompts for the AI to generate an Exercise plan.
        *   Process the AI response and store it in the `Plan` table (`plan_type='exercise'`). Handle potential AI errors/timeouts.
    *   **Plan Data Model:** Implement the `Plan` table schema.
    *   **Basic Plan Display:** Create a simple UI component to display the generated Exercise plan content to the user.
*   **Potential Risks:** AI response quality/consistency, prompt engineering challenges, AI API latency/errors.
*   **Definition of Done:** Users with completed profiles can trigger Exercise plan generation, the plan is stored, and the basic plan content is visible to the user.

---

## Sprint 3: Plan Expansion & Task Generation (Weeks 7-8)

*   **Goal:** Expand plan generation to Nutrition and Sleep, and translate generated plans into actionable daily tasks.
*   **Key Features/Tasks:**
    *   **Plan Generation Logic (Nutrition & Sleep):** Extend AI integration to generate Nutrition and Sleep plans, storing them similarly.
    *   **Task Generation Logic:**
        *   Develop logic (potentially involving AI prompting or rule-based parsing) to extract actionable daily tasks from the `Plan.plan_content` for all three types.
        *   Store these actions in the `Task` table with appropriate due dates.
    *   **Task Data Model:** Implement the `Task` table schema.
    *   **Task Tracking UI (Dashboard v1):** Create a basic dashboard view displaying pending tasks for the user (e.g., for "today").
    *   **Task Completion:** Implement functionality for users to mark tasks as 'completed'. Update `Task.status` and `Task.completed_at`.
*   **Potential Risks:** Difficulty in reliably parsing AI plan content into structured tasks, generating appropriate due dates.
*   **Definition of Done:** Nutrition and Sleep plans are generated and displayed. Daily tasks are generated from plans. Users can view and mark tasks as complete on a basic dashboard.

---

## Sprint 4: Chatbot Coach Integration (Weeks 9-10)

*   **Goal:** Implement the basic AI chatbot for user interaction and questions.
*   **Key Features/Tasks:**
    *   **Chat UI:** Develop the chat interface component.
    *   **Chat Backend Logic:**
        *   Implement backend endpoint to receive user messages.
        *   Integrate with AI API for generating chat responses (basic Q&A, context might be limited initially).
        *   Store conversation history in the `ChatMessage` table.
    *   **ChatMessage Data Model:** Implement the `ChatMessage` table schema.
*   **Potential Risks:** Maintaining chat context effectively, AI response relevance and safety, cost of chat interactions.
*   **Definition of Done:** Users can interact with the chatbot, send messages, receive AI-generated responses, and the conversation is logged.

---

## Sprint 5: Progressive Profiling & Basic Progress Tracking (Weeks 11-12)

*   **Goal:** Enhance the chatbot to perform progressive profiling and implement basic visualizations for user progress.
*   **Key Features/Tasks:**
    *   **Progressive Profiling Logic:**
        *   Enhance chatbot backend to identify triggers (e.g., time since last interaction, specific user actions) to ask targeted profiling questions.
        *   Flag these AI messages (`ChatMessage.is_profiling_prompt`).
        *   Process user responses to profiling questions and update `UserProfile.profile_data`. Link `ChatMessage` to `UserProfile` update if possible.
    *   **Progress Tracking UI:** Enhance the dashboard or create a dedicated section to show basic progress indicators (e.g., task completion streaks, count of completed tasks over time).
    *   **Analytics Setup:** Choose and configure an analytics platform/library (e.g., Google Analytics, Mixpanel, PostHog, or custom logging). Implement the `AnalyticsEvent` data model.
*   **Potential Risks:** Designing effective profiling questions and triggers, complexity in updating nested `UserProfile` data, choosing the right analytics tool.
*   **Definition of Done:** Chatbot proactively asks profiling questions based on triggers, user responses update their profile, basic progress metrics are displayed visually, analytics infrastructure is in place.

---

## Sprint 6: Analytics Implementation & Polish (Weeks 13-14)

*   **Goal:** Implement detailed analytics tracking and refine the overall MVP for user testing.
*   **Key Features/Tasks:**
    *   **Analytics Event Tracking:** Implement backend/frontend logic to log the specific events listed in the brief (e.g., `onboarding_completion`, `plan_view_usage`, `task_completed`, `chat_engagement`, etc.) to the chosen analytics system/`AnalyticsEvent` table.
    *   **UI/UX Refinement:** Polish existing UI components based on internal feedback. Improve navigation and clarity.
    *   **Testing:** Conduct thorough internal testing (functional, usability, basic security). Fix identified bugs.
    *   **Deployment Prep:** Prepare the application for deployment to a testing environment.
    *   **User Testing Plan:** Finalize the plan and materials for the 4-week user testing phase.
*   **Potential Risks:** Ensuring accurate analytics tracking, uncovering significant bugs late in the process.
*   **Definition of Done:** All specified analytics events are tracked, major bugs fixed, UI is polished, application is deployable, user testing plan is ready.

---

## Post-MVP Sprints:

*   **User Testing Phase (Minimum 4 Weeks):** Execute the user testing plan, collect quantitative and qualitative data.
*   **Data Analysis & Iteration:** Analyze collected data, identify key findings, and plan subsequent sprints for refinement and potentially incorporating deferred features (Mental Health, Recovery) based on feedback and validated learnings.

--- 