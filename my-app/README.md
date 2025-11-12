# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Profile.tsx - Public Functions

| Function | Purpose | Outcome |
|-----------|----------|----------|
| `retrieveAuthenticatedUser()` | Gets the current logged-in user from Supabase. | Updates `authenticatedUser` state. |
| `loadActiveUserProfile()` | Fetches the user’s full profile information from Supabase. | Populates `userProfile` state. |
| `handleProfilePictureUpdate()` | Opens image picker and updates the profile picture in Supabase. | Updates `userProfile.profilePictureUrl` and shows confirmation. |
| `formatDateOfBirth(dob)` | Formats a given date string into a readable format. | Returns a locale-specific formatted date. |
| `reloadUserProfile()` | Manual trigger for refreshing the profile. | Calls `loadActiveUserProfile()`. |

## Settings.tsx - Public Functions
| Function | Purpose | Outcome |
|-----------|----------|----------|
| `loadUserProfile()` | Retrieves the authenticated user’s profile details (first name, last name, email, and weight) from Supabase. | Populates `userProfile` state with the user’s stored information. |
| `updateUserProfileDetails()` | Validates input fields and updates the user’s profile details in Supabase. | Persists profile changes and exits edit mode upon success. |
| `togglePushNotifications()` | Switches the push notification preference on or off. | Updates `pushNotificationsEnabled` state to reflect user preference. |
| `handleLogout()` | Signs the user out of the current session via Supabase and navigates to the login screen. | Logs out the user and resets navigation state. |
| `renderField(label, fieldKey, keyboardType?)` | Renders a labeled text input for a profile field (e.g., First Name, Weight). | Displays a consistent form input, editable only in edit mode. |