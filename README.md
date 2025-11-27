# Gamified Gym Project Guide
Mobile app that track, and has gaming aspect to help engage in gym activities 

## Lecture Topics Guide
Format: LTT_#issue_(Name of file) 
Use the issue number to trace the developer that worked on the task.

## Gamified Gym – Repository Structure
This repository contains the source code and documentation for **Gamified Gym**, a mobile fitness application built with **React Native**. The app combines workout tracking with gamified features like achievements, badges, and challenges to motivate users.

### Folder Structure
```
gamified-gym/
│
├── app/                         # Main React Native application code
│   ├── components/              # Reusable UI components (buttons, cards, modals, etc.)
│   ├── screens/                 # Application screens
│   │   ├── Auth/                # Login, Signup, Forgot Password
│   │   ├── Profile/             # Profile view, Settings
│   │   ├── Home/                # Dashboard, landing screens
│   │   ├── Tracker/             # Workout logging, exercise list
│   │   └── Game/                # Achievements, badges, challenges
│   ├── navigation/              # Navigation logic (stack, tab, drawer navigation)
│   ├── assets/                  # Images, icons, badge graphics, fonts
│   ├── services/                # API calls, backend integration, database helpers
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Helper functions (formatting, validators, etc.)
│   └── App.js                   # Entry point of the React Native app
│
├── backend/                     # (Optional / future) API and backend services
│   ├── models/                  # Data models (User, Workout, Achievement)
│   ├── routes/                  # API endpoints
│   ├── controllers/             # Business logic for routes
│   └── server.js                # Backend entry point
│
├── docs/                        # Documentation for developers
│   ├── team-guidelines.md       # Contribution rules, Git workflow
│   ├── milestones.md            # Milestone planning & deadlines
│   ├── LTT-examples.md          # Lecture Topic Task guidance
│   └── architecture.md          # High-level design decisions
│
├── tests/                       # Unit and integration tests
│   ├── app-tests/               # Frontend tests
│   └── backend-tests/           # API tests
│
├── .github/                     # GitHub configuration
│   └── workflows/               # GitHub Actions (CI/CD pipelines)
|       └── asciidoctor-pdf.yml               # .adoc to .pdf auto-converter
|       └── dev-metrics.yml               # computes scores for developers
│
├── README.md                    # Project overview (this file)
└── LICENSE                      # License information
```

### Naming Conventions
To ensure clarity and consistency across the project:

#### Folders
- Use **PascalCase** for folders inside ```app/screens/``` (e.g., ```Auth```, ```Profile```, ```Tracker```, ```Game```).
- Use **kebab-case** for non-screen-level directories (e.g., ```assets```, ```services```, ```utils```).

#### Files
- React components: **PascalCase** (e.g., ```LoginScreen.js```, ```WorkoutCard.js```).
- Helper files, utilities, hooks: **camelCase** (e.g., ```dateFormatter.js```, ```useWorkout.js```).
- Images and icons: **kebab-case** (e.g., ```dumbbell-icon.png```, ```badge-gold.png```).

### Branches
- Use team and feature-based prefixes:
  - ```foundations/feature-login```
  - ```game/feature-badges```
  - ```tracker/feature-workout-logging```
