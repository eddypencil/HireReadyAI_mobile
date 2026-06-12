# Project Context

## Goal
Port the DESIGN_SYSTEM.md design tokens, dark mode, and i18n patterns from the web app into the React Native mobile project.

## Completed — All feature components migrated

All feature components across all phases now use `useTheme()` + `useTranslation()` instead of static `import { colors }`.

### Files migrated by phase

**Phase 1 — Auth (4 files)**
`LoginPage.js`, `RegisterPage.js`, `ForgotPasswordPage.js`, `ResetPasswordPage.js`

**Phase 2 — Jobs (4 files)**
`JobSearch.js`, `JobCard.js`, `JobsPage.js`, `JobDetailsPage.js`

**Phase 3 — Applicant (6 files)**
`ApplicantPage.js`, `ApplicantHeader.js`, `StatsCards.js`, `ApplicationsList.js`, `InterviewList.js`, `AvatarModal.js`

**Phase 4 — Companies (6 files)**
`CompanyProfile.js`, `JDGeneratorPage.js`, `JDGeneratorResultPage.js`, `NoCompanyView.js`, `CompanyLayout.js`, `JobPostings.jsx`

**Phase 5 — Shortlist (8 files)**
`ShortlistsPage.js`, `SideBySideComparison.js`, `ShortlistReportTable.js`, `OfferEmailModal.js`, `ShortlistInsightsBar.js`, `ComparisonCard.js`, `ShortlistDetailPanel.js`, `ShortlistCandidateCard.js`

**Phase 6 — Remaining (13 files)**
- Recruiter: `RecruiterScreen.jsx`, `PipelineCandidatesPage.jsx`, `CandidateProfileScreen.jsx`, `CandidateAssessmentsScreen.jsx`
- Pipeline: `StageLibrary.jsx`, `PipelineCard.jsx`, `StageCard.jsx`, `StageDetailsPanel.jsx`, `PipelineBuilder.jsx`, `PipelineBuilderPage.jsx`, `PipelinesPage.jsx`
- Applications: `ApplyJobPage.js`, `QuestionCard.js`

## Key Patterns
- Option A: inline styles with plain `s` object inside component, or `createStyles(c)` function for StyleSheet-based files
- Theme tokens: `c = theme.colors`, bracket access for hyphenated keys (`c['muted-foreground']`)
- Hex opacity suffix: e.g. `` `${c['stage-applied']}26` `` for ~15% opacity
- i18n: `t("namespace.key")` via `useTranslation()`
- Stage colors: `stage-applied`, `stage-screening`, `stage-interview`, `stage-assessment`, `stage-final`, `stage-hired`, plus `success`/`warning`/`destructive`

## Interview System (Rewritten June 2026)

The mobile interview system now mirrors the web's new architecture:

**Tables used:** `application_stages`, `application_questions`, `application_answers`, `application_stage_evaluations`

**Key files:**
- `features/interview/pages/InterviewPage.js` — state machine: INIT→LOADING→ANSWERING→EVALUATING→FINISHED→ERROR; timer with auto-submit, progress bar, resume support
- `features/interview/services/interview.service.js` — `fetchActiveInterviewStage()`, `fetchStageQuestions()`, `generateNextQuestion()` (calls edge function)
- `features/interview/services/interview_database_service.js` — CRUD for new tables
- `features/interview/services/wandbox.service.js` — code execution via Wandbox API
- `features/interview/services/video_storage_service.js` — upload to `generation_context` JSONB
- `features/interview/hooks/useInterviewQuestions.js` — loads stage + questions
- `features/interview/components/TextQuestion.js` — min 30 chars
- `features/interview/components/MultipleChoiceQuestion.js` — radio-list options
- `features/interview/components/CodeQuestion.js` — monospace editor + Wandbox run
- `features/interview/components/VideoQuestion.js` — `expo-camera` recording + upload

**Navigation:** InterviewList.js "Start Interview" button → `navigation.navigate("Interview", { applicationId })`

**Status:** InterviewPage reads `application_stages` to determine interview progress, works with existing `application_stages` data already fetched by `fetchApplicationsByApplicantId`.

**StatsCards.js** now counts interviews via `application_stages` (status `in_progress`/`completed`), offers via `current_recruitment_stage.stage_type === "offer"`, and rejected via `application_stages` status.

**Key dependencies:** `expo-camera` installed for video recording.
