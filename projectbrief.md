# Project Brief: Holistic MVP

**Version:** 1.0
**Date:** 2024-07-27

## 1. Project Name

Holistic MVP

## 2. Project Goals & Objectives

*   Develop a web application as the Minimum Viable Product (MVP).
*   Conduct a minimum 4-week experimental phase with test users upon MVP completion.
*   Collect quantitative (analytics) and qualitative (feedback) data during the experiment.
*   Utilize collected data to refine the web app and inform the development strategy for a future mobile app version.

## 3. Problem Statement

*   Existing AI plan generation tools are often complex and overwhelming for users, lacking clear, actionable steps.
*   Users struggle to effectively prompt AI for comprehensive and personalized plans.
*   Current wellness plans (human or AI) often lack deep personalization due to insufficient data collection.
*   Human-led plans cannot adapt in real-time to user progress or changing needs.

## 4. Target Audience

*   Individuals seeking to improve their general fitness, health, and wellness.
*   Athletes aiming for optimal performance in their specific sports.

## 5. Project Scope

### 5.1. Inclusions

*   **Adaptive Onboarding Quiz:**
    *   Wizard-style, one-question-at-a-time interface.
    *   Visual progress indicators.
    *   Provides immediate value/feedback during the quiz (e.g., acknowledging poor sleep and mentioning potential solutions).
    *   Dynamically adapts questions based on prior answers to build a deep user profile.
*   **Personalized Plan Generation:**
    *   AI generates personalized plans covering **Exercise, Nutrition, and Sleep**.
    *   *(Mental Health/Mindfulness and Recovery sections deferred post-MVP)*.
*   **Task/Habit Tracking:**
    *   AI translates plans into daily actionable tasks.
    *   Tasks displayed clearly on a user dashboard.
*   **Chatbot Coach:**
    *   In-app AI assistant for user questions, updates, advice.
    *   Potential for logging information that influences plans.
*   **Progressive Profiling & Micro-Surveys:**
    *   Chatbot proactively asks targeted questions based on triggers (usage, time, etc.).
    *   Aims to continuously refine the user profile.
    *   Questions may appear integrated with the chatbot interface.
    *   Responses stored as structured user profile data.
*   **Basic Progress Tracking:**
    *   Simple dashboard or log view.
    *   Shows completed tasks/logged activities.
    *   Basic visual progress indicators (e.g., streaks, goal counts).
*   **Passive Behavior Tracking:**
    *   Utilize analytics on user interactions (feature usage, navigation) as implicit cues for personalization.
    *   To be used alongside explicit data from quizzes, surveys, and chat.
*   **Data Analytics & User Progress Tracking:**
    *   Implement analytics tracking for key user behaviors and outcomes.
    *   Initial events to track (subject to refinement):
        *   `onboarding_completion`
        *   `plan_view_usage` (by section: Exercise, Nutrition, Sleep)
        *   `chat_engagement` (messages sent, questions asked)
        *   `recommendation_habit_followed` (task completion)
        *   `goal_achievement` (user-defined or system-derived)
        *   `navigation_path`
        *   `drop_off_point_error`
        *   `retention_growth_event` (e.g., session frequency, return visits)
        *   `analytics_export_request` (for team analysis)

### 5.2. Exclusions

*   Wearable device integrations.
*   Third-party app integrations.
*   Push notifications (for the web app).
*   Features beyond the defined MVP scope (e.g., advanced reporting, social features).
*   Mental Health/Mindfulness and Recovery plan sections (initially).

## 6. Key Deliverables

*   Functional Holistic MVP web application.
*   System/process for collecting and analyzing user data from the experiment.
*   Framework/plan for conducting the minimum 4-week user testing phase.

## 7. Stakeholders

*   **Holistic Team:**
    *   Brandon (assuming Project/Product Lead role)
    *   Shaq (Partner, Industry Expert)
    *   Future Engineer/Builder
    *   Future Marketer
*   **Test Users:** Participants in the experimental phase.

## 8. Timeline & Key Milestones

*   **MVP Development Start Date:** TBD (Dependent on planning completion and test participant recruitment).
*   **MVP Development Completion Date:** As Soon As Possible (ASAP).
*   **User Testing Phase:** Minimum 4 weeks, commencing after MVP completion and user onboarding.

## 9. Budget & Resources

*   **Budget:** Target maximum of $1500, preferably less.
*   **Resources:** Existing team members, planned hires, crucial need for affordable yet effective AI model(s).

## 10. Success Metrics

*   **Primary KPI (MVP Experiment):** User retention rate throughout the testing period.
*   **Secondary Metrics:**
    *   Positive qualitative feedback from test users.
    *   User engagement metrics derived from analytics (e.g., feature usage frequency, task completion rates).
    *   Onboarding completion rate.

## 11. Assumptions

*   An accessible AI model exists that can provide accurate, helpful, safe, and non-legally problematic planning, recommendations, and coaching within the budget.
*   Sufficient data (user-provided and behavioral) can be collected and utilized effectively for meaningful personalization.

## 12. Risks & Challenges

*   **Budget vs. AI Capability:** Finding a suitable AI model within the strict budget constraints.
*   **Integration Complexity:** Ensuring seamless flow and data consistency between onboarding, plan generation, chat, task tracking, and profiling features.
*   **User Value & Engagement:** Risk that users may not perceive sufficient unique benefit compared to alternatives, leading to poor retention.
*   **Vision Alignment:** Ensuring the focus remains on the core value proposition and hasn't overly strayed due to AI-driven feature research.
*   **AI Safety & Reliability:** Mitigating the risk of harmful, incorrect, or nonsensical AI outputs.
*   **Technical Feasibility:** Implementing the dynamic onboarding, real-time adaptation, and progressive profiling within scope and budget. 