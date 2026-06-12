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

## Font
- Cairo (via `@expo-google-fonts/cairo`) — loaded in `App.js` via `useCairoFonts()` from `src/fonts.js`
- `FONT_FAMILY` constant = `'Cairo_400Regular'` — import from `src/fonts`
- Each weight has its own font family name: `Cairo_400Regular`, `Cairo_500Medium`, `Cairo_600SemiBold`, `Cairo_700Bold`, `Cairo_800ExtraBold`, `Cairo_900Black`
- Theme registers weight-specific font families in each typography entry, so headings use the correct weight variant automatically
- Two `monospace` usages (code blocks) intentionally kept

## Key Patterns
- Option A: inline styles with plain `s` object inside component, or `createStyles(c)` function for StyleSheet-based files
- Theme tokens: `c = theme.colors`, bracket access for hyphenated keys (`c['muted-foreground']`)
- Hex opacity suffix: e.g. `` `${c['stage-applied']}26` `` for ~15% opacity
- i18n: `t("namespace.key")` via `useTranslation()`
- Stage colors: `stage-applied`, `stage-screening`, `stage-interview`, `stage-assessment`, `stage-final`, `stage-hired`, plus `success`/`warning`/`destructive`
