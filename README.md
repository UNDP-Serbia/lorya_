# Lorya

A full-stack document processing and OCR platform built with React, NestJS, and Python, organized as a monorepo using Turborepo and Yarn workspaces. Lorya provides an end-to-end pipeline for uploading document scans, identifying document layout regions, extracting text via OCR, and applying post-OCR corrections.

## Latest release v1.3.0

- **Custom LLM models (OCR & Post-OCR)** — new `LITELLM` model type for OCR and Post-OCR Correction via LiteLLM-compatible providers; backend `llm` module (`LlmRunnerService`, config parsing/sanitization, output-format prompts) with Python runner `scripts/ai/app/llm/run_litellm.py`; `AddLlmModelTypeAndNullableConfidence` migration; OCR/post-OCR services accept optional prompt override and store nullable confidence for LLM results.
- **Custom LLM model settings** — frontend `ModelSettingsForm` Custom LLM section (JSON config upload with model, API key, default prompt, optional API base/parameters); editable output format instructions merged into config on save; collapsible output format editor; available under OCR and Post-OCR Correction in `ManageModelSettings`.
- **Prompt review before run** — `CustomLlmPromptModal` in OCR and Post-OCR right-drawer sections; users review/edit the default prompt before single-file or batch execution; output format instructions appended automatically at runtime.
- **Run history & editor integration** — model kind surfaced as Custom LLM in run history and model tables; confidence hidden for LLM results in `AdditionalRightDrawer`; clearer LLM API error messages (rate limits, invalid model, malformed JSON).
- **UI improvements** — logged-in user displayed in the drawer; LLM output format editor collapsed by default in model settings.

See [CHANGELOG.md](./CHANGELOG.md) for previous releases.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **TanStack React Query** - Server state management with caching and persistence
- **React Router** - Client-side routing
- **Formik + Yup** - Form handling and validation
- **Material-UI (MUI)** - Component library
- **TailwindCSS + SCSS** - Styling
- **Annotorious + OpenSeadragon** - Image annotation and deep zoom

### Backend
- **NestJS 11** with TypeScript
- **TypeORM** - ORM with migration-based schema management
- **PostgreSQL** - Relational database
- **Passport + JWT** - Authentication and authorization
- **Swagger/OpenAPI** - API documentation
- **AutoMapper** - Entity-to-DTO mapping

### AI / ML (Python)
- **Python 3.11** managed via Conda
- **Tesseract 5.2** - Optical Character Recognition
- **YOLOv8 (Ultralytics)** - Document layout detection
- **OpenCV 4.10** - Image processing and enhancement
- **PyTorch 2.2** - Deep learning framework
- **pdf2image** - PDF to image conversion

### Development Tools
- **Turborepo** - Monorepo build system
- **Yarn 4 Workspaces** - Package management
- **Prettier** - Code formatting (no semicolons, single quotes, 80 char width)
- **ESLint** - Code linting with strict TypeScript rules
- **Husky** - Git hooks management
- **Commitlint** - Commit message linting
- **Lint-staged** - Pre-commit code quality checks

## Project Structure

```
lorya/
├── apps/
│   ├── backend/              # NestJS API server
│   │   └── src/
│   │       ├── config/       # Global config (DB, JWT, CORS, guards)
│   │       ├── auth/         # Authentication (login, register, refresh)
│   │       ├── account/      # User account management
│   │       ├── file-manager/ # File/directory operations
│   │       ├── ai/           # AI orchestration (PDF split, image ops)
│   │       ├── ai-model/     # AI model registry
│   │       ├── layout-identification/  # YOLO document segmentation
│   │       ├── image-enhancement/      # OpenCV image preprocessing
│   │       ├── ocr/          # Tesseract OCR processing
│   │       ├── post-ocr-correction/    # Post-OCR error correction
│   │       ├── segment-management/     # Document segment CRUD
│   │       ├── router/       # API versioning (/api/v1)
│   │       ├── database/     # TypeORM migrations
│   │       ├── mapper/       # AutoMapper profiles
│   │       └── common/       # Shared utilities, guards, filters
│   └── frontend/             # React application
│       └── src/
│           ├── api/          # Axios client, interceptors, endpoints
│           ├── query/        # React Query hooks (queries & mutations)
│           ├── pages/        # Page components (Home, Login, Settings)
│           ├── components/   # Reusable UI components
│           ├── router/       # Route definitions & guards
│           └── utils/        # Utility functions
├── shared/
│   ├── config/               # Shared ESLint and TypeScript configs
│   └── ui/                   # Shared UI components library (@shared/ui)
├── scripts/
│   └── ai/                   # Python AI scripts + Conda environment
│       ├── app/              # Processing scripts
│       │   ├── documents/    # PDF splitting
│       │   ├── layout/       # YOLO layout detection + segment cropping
│       │   ├── image_enhancement/  # Adaptive thresholding
│       │   ├── image_processing/   # Rotate, crop, brightness, contrast
│       │   ├── ocr/          # Tesseract OCR
│       │   ├── post_ocr/     # Post-OCR correction
│       │   └── export/       # ALTO XML export
│       └── environment.yml   # Conda environment definition
├── turbo.json                # Turborepo configuration
├── package.json              # Root workspace configuration
├── commitlint.config.js      # Commit message linting rules
├── .prettierrc               # Prettier configuration
└── yarn.lock                 # Dependency lock file
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Yarn** 4.9.2 (via Corepack)
- **PostgreSQL** - Running instance
- **Conda** (Anaconda or Miniconda) - For Python AI scripts

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lorya
```

2. Enable Corepack and install Node.js dependencies:
```bash
corepack enable
yarn install
```

3. Set up the Conda environment (see [Conda Environment Setup](#conda-environment-setup) below).

4. Configure environment variables (see [Environment Variables](#environment-variables) below).

5. Run database migrations:
```bash
cd apps/backend
yarn migration:run
```

### Conda Environment Setup

The AI processing scripts (OCR, layout identification, image enhancement) require a Python environment managed by Conda. The environment definition is at `scripts/ai/environment.yml`.

#### 1. Install Conda

If you don't have Conda installed, install [Miniconda](https://docs.conda.io/en/latest/miniconda.html) (lightweight) or [Anaconda](https://www.anaconda.com/download) (full distribution):

```bash
# macOS (Miniconda)
brew install miniconda

# Or download from https://docs.conda.io/en/latest/miniconda.html
```

After installation, initialize Conda for your shell:
```bash
conda init zsh    # or: conda init bash
```

Restart your terminal after initialization.

#### 2. Create the Environment

```bash
cd scripts/ai
conda env create -f environment.yml
```

This creates a Conda environment named **`lorya`** with Python 3.11.11 and all required AI/ML dependencies (PyTorch, OpenCV, Tesseract, Ultralytics YOLO, etc.).

> **Note:** The initial creation may take 10-20 minutes depending on your internet connection, as it downloads PyTorch, OpenCV, and other large packages.

#### 3. Activate the Environment

```bash
conda activate lorya
```

You should see `(lorya)` in your terminal prompt when the environment is active.

#### 4. Verify the Installation

```bash
python --version          # Should show Python 3.11.x
tesseract --version       # Should show tesseract 5.2.x
python -c "import torch; print(torch.__version__)"       # 2.2.2
python -c "import cv2; print(cv2.__version__)"            # 4.10.0
python -c "import ultralytics; print(ultralytics.__version__)"  # 8.3.x
```

#### 5. Update the Environment

If `environment.yml` is updated, sync your environment:

```bash
conda env update -f scripts/ai/environment.yml --prune
```

The `--prune` flag removes packages that are no longer in the specification.

#### 6. Remove the Environment

To completely remove the environment:

```bash
conda deactivate
conda env remove -n lorya
```

### Environment Variables

#### Backend (`apps/backend/.env`)

Create environment-specific files (`.env.development`, `.env.production`):

```env
# Application
ENVIRONMENT=development
PORT=3333

# Database (PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=lorya

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_TOKEN_EXPIRES_IN=900       # 15 minutes (seconds)
JWT_REFRESH_TOKEN_EXPIRES_IN=604800   # 7 days (seconds)

# File Storage
STORAGE_DIR=storage
ORIGINALS_DIR=originals
SCRIPT_DIR=../../scripts/ai/app

# Conda
CONDA_ENV=/opt/anaconda3/envs/lorya
```

#### Frontend (`apps/frontend/.env`)

```env
VITE_API_URL=http://localhost:3333/api/v1
VITE_IMAGE_FETCH_URL=http://localhost:3333
```

### Development

Start all applications in development mode:
```bash
yarn dev
```

This will start:
- **Frontend** on `http://localhost:5173` (Vite dev server)
- **Backend** on `http://localhost:3333` (NestJS with hot reload)

> **Important:** The Conda environment must be activated in the terminal running the backend for AI features to work.

#### Start Individual Services

```bash
# Frontend only
cd apps/frontend
yarn dev

# Backend only (with Conda activated)
conda activate lorya
cd apps/backend
yarn dev
```

## Build & Production

Build all applications:
```bash
yarn build
```

Build individual applications:
```bash
# Frontend
cd apps/frontend
yarn build

# Backend
cd apps/backend
yarn build
```

Start production server (backend):
```bash
cd apps/backend
yarn start:prod
```

## Database Migrations

TypeORM migrations manage the database schema. Run from `apps/backend`:

```bash
# Run pending migrations
yarn migration:run

# Revert the last migration
yarn migration:revert

# Show migration status
yarn migration:show

# Generate a new migration from entity changes
yarn migration:generate <MigrationName>

# Create an empty migration
yarn migration:create <MigrationName>
```

> **Note:** Migrations run automatically on application startup (`migrationsRun: true`).

## Testing

Run all tests:
```bash
yarn test
```

Backend tests:
```bash
cd apps/backend
yarn test             # Unit tests
yarn test:watch       # Watch mode
yarn test:cov         # Coverage report
yarn test:e2e         # End-to-end tests
```

## Code Quality

```bash
# Lint all code
yarn lint

# Fix linting issues
yarn lint:fix

# Check code formatting
yarn format:check

# Format code
yarn format
```

## Commit Conventions

Commits are enforced via Commitlint + Husky pre-commit hooks.

**Format:** `type(scope): message` (max 100 characters)

**Types:** `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`, `config`, `upgrade`, `revert`

**Scopes:** `project`, `frontend`, `backend`, `shared`, `ai`

**Examples:**
```
feat(frontend): add document annotation editor
fix(backend): resolve JWT refresh token expiration
chore(project): update dependencies
docs(ai): add conda setup instructions
```

## API Documentation

When the backend is running, Swagger documentation is available at:
```
http://localhost:3333/api/docs
```

## Architecture Overview

### Document Processing Pipeline

```
1. Upload    →  File uploaded to storage
2. PDF Split →  Multi-page PDF → individual page images
3. Layout ID →  YOLOv8 detects document regions (text, tables, images)
4. Enhance   →  (Optional) OpenCV image preprocessing
5. OCR       →  Tesseract extracts text with confidence scores
6. Post-OCR  →  Automated error correction
7. Review    →  Manual review & editing via annotation interface
8. Export    →  ALTO XML or other formats
```

### File Processing Status

Each file progresses through the pipeline stages:
```
INITIALIZED → SEGMENTED → OCR_COMPLETED → POST_OCR_COMPLETED
```

### Authentication

- JWT-based authentication with access tokens (15min) and refresh tokens (7 days)
- Global authentication guard protects all routes by default
- Use `@Public()` decorator for public endpoints
- Role-based authorization via `@Roles()` decorator

### Deployment

- **CI/CD:** Bitbucket Pipelines → build → rsync to EC2
- **Backend:** PM2 process manager
- **Frontend:** Nginx serving static files
- **Database:** PostgreSQL with auto-running migrations

## Shared Packages

### @shared/config

Exports shared ESLint configs (`base`, `nest`, `react`) and TypeScript configs that apps extend.

### @shared/ui

Reusable React component library with Material-UI integration:
```tsx
import { UIProvider, Button } from '@shared/ui'

function App() {
  return (
    <UIProvider>
      <Button>Click me</Button>
    </UIProvider>
  )
}
```

Components include: Drawer, Tooltip, Autocomplete, Switcher, Accordion, Loading, and more.
