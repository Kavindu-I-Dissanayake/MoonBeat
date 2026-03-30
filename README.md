# MoonBeat 🌙

MoonBeat is a cycle-based timer app built with React Native and Expo. It alternates between a "WORK" phase and a "REST" phase, providing an auditory and haptic alarm upon completion of each work cycle.

## Features
- Alternating cycle timers (Work -> Rest -> Work)
- Validated numeric inputs for duration in seconds
- Audio alarm and device vibration on cycle completion
- Local notifications when backgrounded (light background usage)
- Beautiful dark-mode UI with a moon aesthetic

## Setup Instructions

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone or Open the Project**:
   Ensure you are in the project folder with `App.js` and `package.json`.

2. **Install Dependencies**:
   Run the following command to make sure all dependencies and Expo native modules are correctly installed:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

4. **Testing on your Device**:
   - Download the **Expo Go** app on your iOS or Android device.
   - Scan the QR code presented in your terminal with your phone's camera (iOS) or the Expo Go app itself (Android).
   - Ensure you allow Notification permissions when prompted, so you can test the local notifications feature limit.

## Testing Instructions
- **Timer Loop**: Enter `5` (Main Time) and `3` (Gap Time), then tap `START`. Wait 5 seconds to see it switch to `REST`, trigger the alarm, sit for 3 seconds, and switch back to `WORK`.
- **Sound**: Check if the bicycle bell sound plays reliably when switching from Work to Rest.
- **Notifications**: Try sending the app into the background or simply keeping it open when the WORK time hits zero, you should see a local system push notification arrive.

## How to Build an Android APK

Expo uses **EAS (Expo Application Services)** to compile your React Native code into standalone native apps.

### Prerequisites
1. Create an Expo account at [expo.dev](https://expo.dev/) if you haven't yet.
2. Install EAS CLI globally via npm:
   ```bash
   npm install -g eas-cli
   ```

### Building the APK
1. **Login to EAS**:
   ```bash
   eas login
   ```
2. **Configure your project**:
   ```bash
   eas build:configure
   ```
   Select `All` platforms or just `Android`.
3. **Run the APK build command**:
   By default, EAS builds `.aab` files for the Google Play Store. To build an `.apk` specifically for direct sideloading, use the `preview` profile or add `--profile preview` and ensure your `eas.json` specifies `"buildType": "apk"`. A solid command:
   ```bash
   eas build -p android --profile preview
   ```
   *(If your eas.json preview section doesn't have `buildType: "apk"`, add it manually before running the command!)*
4. **Download**: Once EAS finishes your build on their servers, it will provide a direct download link to your standalone APK that you can install directly on Android hardware.
