# Changelog

All notable changes to Lorya are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.3.0] - 2026-07-03

- **Custom LLM models (OCR & Post-OCR)** — new `LITELLM` model type for OCR and Post-OCR Correction via LiteLLM-compatible providers; backend `llm` module (`LlmRunnerService`, config parsing/sanitization, output-format prompts) with Python runner `scripts/ai/app/llm/run_litellm.py`; `AddLlmModelTypeAndNullableConfidence` migration; OCR/post-OCR services accept optional prompt override and store nullable confidence for LLM results.
- **Custom LLM model settings** — frontend `ModelSettingsForm` Custom LLM section (JSON config upload with model, API key, default prompt, optional API base/parameters); editable output format instructions merged into config on save; collapsible output format editor; available under OCR and Post-OCR Correction in `ManageModelSettings`.
- **Prompt review before run** — `CustomLlmPromptModal` in OCR and Post-OCR right-drawer sections; users review/edit the default prompt before single-file or batch execution; output format instructions appended automatically at runtime.
- **Run history & editor integration** — model kind surfaced as Custom LLM in run history and model tables; confidence hidden for LLM results in `AdditionalRightDrawer`; clearer LLM API error messages (rate limits, invalid model, malformed JSON).
- **UI improvements** — logged-in user displayed in the drawer; LLM output format editor collapsed by default in model settings.

## [1.1.0] - 2026-05-06

- **AI model upload & management** — full upload/CRUD for OCR, Layout Identification, Image Enhancement, and Post-OCR Correction models (per-category entities, repositories, services, controllers, AutoMapper profiles, migrations + seeds), plus HuggingFace-based model configuration and frontend management forms.
- **Batch processing** — new `batch` module (controller/service/route/DTOs) with frontend `BatchSelectionContext`, `BatchProcessingModal` and `ActiveSelectionModal` to validate and apply AI operations across multiple files at once.
- **Activity history** — new `Activity` module (entity, controller, service, repository, AutoMapper profile, enums for category/operation/status) with `AddActivityTable` migration; integrated into the left drawer `History` section to track user and system operations across the pipeline.
- **Model run history** — new `ModelRun` module recording every AI execution (image enhancement, layout, OCR, post-OCR) with filtering, paginated listing, detail/segment/file DTOs, status mapper, and `AddModelRunTable` migration; right-drawer sections (Image Enhancement, Layout Identification, OCR, Post-OCR) now surface recent runs via dedicated React Query hooks.
- **Soft delete & run references** — `AddSoftDeleteAndModelRunRefs` migration adds soft delete support to OCR and Post-OCR results, links them to `ModelRun`, refines right-drawer permissions, and tightens segment management around cropping and run-history wiring.
