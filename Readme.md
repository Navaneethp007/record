# Recordify

Recordify is a React Native audio recording app built with Expo, allowing users to record, save, and play audio files with a visually engaging waveform display. The app features a modern UI with a scrollable list of recordings, a progress bar with a thumb for playback control, and a waveform visualization for real-time recording feedback.

## Features

- **Record Audio**: Start/stop recordings with a single tap, visualized by a dynamic waveform.
- **Playback Control**: Play, pause, and seek through recordings with a progress bar and thumb.
- **Scrollable List**: View saved recordings in a scrollable list with highlighted active cards.
- **Waveform Visualization**: Real-time waveform display with a smooth quadratic curve, light blue color, and full-button width.
- **UI Enhancements**: Active card highlighting, progress bar thumb shadow, and ScrollView fade effect.
- **No Recordings Placeholder**: Displays "No recordings yet" when the list is empty.

## Tech Stack

- **Framework**: React Native with Expo
- **Libraries**:
  - `expo-av`: Audio recording and playback
  - `react-native-canvas`: Waveform visualization
  - `react-native-progress`: Progress bar
  - `react-native-vector-icons`: Play/pause icons
- **Build Tool**: Expo Application Services (EAS)
- **File Structure**:
  - `App.jsx`: Main component
  - `Waveform.js`: Waveform visualization component
  - `audioFunctions.js`: Audio recording/playback logic

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Android device/emulator for testing
- Expo account (expo.dev)

## Installation

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd recordify
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Install Specific Libraries**:

   ```bash
   npm install react-native-canvas react-native-progress react-native-vector-icons
   npx expo install expo-av
   ```

4. **Clear Cache (Optional)**:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npx expo start --clear
   ```

## Configuration

1. **Update** `app.json`: Ensure `app.json` has:

   ```json
   {
     "expo": {
       "name": "Recordify",
       "slug": "recordify",
       "version": "1.0.0",
       "platforms": ["android"],
       "android": {
         "package": "com.yourname.recordify",
         "versionCode": 1
       }
     }
   }
   ```

2. **Create** `eas.json`: Add `eas.json` in the project root:

   ```json
   {
     "build": {
       "release": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```

3. **Log in to Expo**:

   ```bash
   eas login
   ```

4. **Initialize EAS Project**:

   ```bash
   eas init
   ```

   Follow prompts to link your project.

## Running the App

1. **Start Development Server**:

   ```bash
   npx expo start
   ```

2. **Test on Device**:

   - Install the Expo Go app on your Android device.
   - Scan the QR code from the terminal.
   - Alternatively, use an Android emulator.

## Building the APK

1. **Build with EAS**:

   ```bash
   eas build -p android --profile release
   ```

2. **Download APK**:

   - Monitor build progress on expo.dev.
   - Download the `.apk` from the Builds section.

3. **Install APK**:

   - Transfer the `.apk` to an Android device.
   - Enable “Install from Unknown Sources” in settings.
   - Install and test.

## Usage

- **Record**: Tap the "Start Recording" button (center bottom) to begin recording. The waveform visualizes audio input in real-time.
- **Stop**: Tap "Stop Recording" to save the audio.
- **Play/Pause**: Tap the play/pause icon in an audio card to control playback.
- **Seek**: Drag the progress bar thumb to navigate the audio.
- **Scroll**: Swipe the audio list to view all recordings.

## Screenshots

Screenshots are located in the `screenshots` folder. Below are examples:

- **Home Screen (No Recordings)**:

  ![No Recordings](screenshots/no-recordings.png)

- **Recording in Progress**:

  ![Recording](screenshots/recording.png)

- **Audio List with Playback**:

  ![Playback](screenshots/playback.png)

## Troubleshooting

- **Build Fails**: Check Expo dashboard logs or run `eas build --clear-cache`. Verify `app.json` and `eas.json`.
- **Waveform Issues**: Ensure `Waveform.js` is exported/imported correctly (`export default Waveform`, `import Waveform from './Waveform'`).
- **Audio Errors**: Log `console.log('Metering:', metering)` in `Waveform.js` or `console.log('Sound:', sound)` in `audioFunctions.js`.
- **Dependencies**: Clear cache and reinstall (`rm -rf node_modules package-lock.json && npm install`).

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgments

1. Expo team for providing robust tools.
2. React Native community for libraries like `react-native-canvas` and `react-native-progress`.
