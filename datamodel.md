# Holistic MVP Data Model

Based on `projectbrief.md` v1.0.

**1. User**

*   `user_id` (Primary Key): Unique identifier for the user.
*   `email` (String, Unique): User's email address for login/contact.
*   `hashed_password` (String): Securely stored password hash.
*   `created_at` (Timestamp): When the user account was created.
*   `last_login` (Timestamp): Timestamp of the last login.
*   `onboarding_status` (Enum: 'not_started', 'in_progress', 'completed'): Tracks the user's progress through the onboarding quiz.

**2. UserProfile**

*   `profile_id` (Primary Key): Unique identifier for the profile data.
*   `user_id` (Foreign Key -> User): Links to the user.
*   `profile_data` (JSON/Text): Stores the comprehensive user profile built from the onboarding quiz and progressive profiling. This could include:
    *   General Fitness Goals (e.g., weight loss, muscle gain, general health)
    *   Specific Athletic Goals (e.g., improve marathon time, increase vertical jump)
    *   Current Fitness Level (self-assessed or estimated)
    *   Dietary Preferences/Restrictions (e.g., vegetarian, allergies)
    *   Sleep Habits (e.g., average hours, quality assessment)
    *   Exercise Preferences (e.g., running, weightlifting, yoga)
    *   Known Injuries/Limitations
    *   Time Availability for exercise/meal prep
    *   *Other fields dynamically added based on quiz/profiling*
*   `created_at` (Timestamp): When the profile entry was first created.
*   `updated_at` (Timestamp): When the profile data was last updated (crucial for tracking changes).

**3. Plan**

*   `plan_id` (Primary Key): Unique identifier for a generated wellness plan.
*   `user_id` (Foreign Key -> User): The user this plan belongs to.
*   `plan_type` (Enum: 'exercise', 'nutrition', 'sleep'): The category of the plan section. *(Note: A user might have one overall logical "plan" composed of these three types)*.
*   `plan_content` (Text/JSON): The detailed AI-generated plan content for the specific type (e.g., workout schedule, meal suggestions, sleep hygiene recommendations).
*   `generated_at` (Timestamp): When this plan section was generated.
*   `is_active` (Boolean): Indicates if this is the currently active plan section for the user. (Allows for history/versioning).
*   `source_profile_version` (Timestamp/FK -> UserProfile?): Reference to the state of the `UserProfile` (`updated_at` timestamp?) used to generate this plan, allowing traceability.

**4. Task**

*   `task_id` (Primary Key): Unique identifier for an actionable task.
*   `user_id` (Foreign Key -> User): The user this task is assigned to.
*   `plan_id` (Foreign Key -> Plan, Nullable): Links the task back to the specific plan section it derived from (optional, but good for context).
*   `task_description` (String): The specific action the user needs to take (e.g., "Run 3 miles at a moderate pace", "Eat 20g protein for breakfast", "Go to bed by 10:30 PM").
*   `due_date` (Date/Timestamp): The date/time the task is intended to be completed.
*   `status` (Enum: 'pending', 'completed', 'skipped', 'missed'): The current status of the task.
*   `created_at` (Timestamp): When the task was generated.
*   `completed_at` (Timestamp, Nullable): When the task was marked as completed.

**5. ChatMessage**

*   `message_id` (Primary Key): Unique identifier for a chat message.
*   `user_id` (Foreign Key -> User): The user involved in the chat.
*   `sender` (Enum: 'user', 'ai_coach'): Who sent the message.
*   `message_content` (Text): The actual text of the message.
*   `timestamp` (Timestamp): When the message was sent/received.
*   `is_profiling_prompt` (Boolean): Flag indicating if this AI message was a targeted progressive profiling question.
*   `related_profile_update` (Foreign Key -> UserProfile, Nullable): Link to a `UserProfile` update triggered by this chat interaction, if applicable.

**6. AnalyticsEvent**

*   `event_id` (Primary Key): Unique identifier for an analytics event.
*   `user_id` (Foreign Key -> User, Nullable): The user who triggered the event (if applicable).
*   `session_id` (String, Nullable): Identifier for the user's session.
*   `event_name` (String): Name of the event (e.g., `onboarding_completion`, `task_completed`, `chat_message_sent`).
*   `event_properties` (JSON/Text): Additional context/details about the event (e.g., `{ "task_id": 123, "plan_type": "exercise" }`).
*   `timestamp` (Timestamp): When the event occurred.

**Relationships:**

*   **User** 1 : 1..* **UserProfile** (One user can have multiple profile snapshots over time, but typically one *active* profile).
*   **User** 1 : * **Plan** (One user has multiple plan sections, potentially versioned over time).
*   **User** 1 : * **Task** (One user has many tasks).
*   **Plan** 1 : * **Task** (One plan section can generate multiple tasks).
*   **User** 1 : * **ChatMessage** (One user has many chat messages).
*   **User** 1 : * **AnalyticsEvent** (One user triggers many analytics events).
*   **ChatMessage** * : 1 **UserProfile** (Potentially, a chat interaction can trigger a profile update). 