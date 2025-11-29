# 🎮 Truth or Dare - AI Powered Spin the Bottle

A modern, interactive **Truth or Dare** party game built with **React Native**. It features a physics-based bottle spinner (using **Skia** & **Reanimated**) and generates infinite, context-aware questions using **OPEN AI API**.

---

## ✨ Features

- **Physics-Based Spinner**: Smooth, realistic 60fps bottle animation using `@shopify/react-native-skia` and `react-native-reanimated`.
- **AI-Powered Prompts**: Generates unique Truths and Dares on the fly using the **OPEN AI APIS**.
- **Custom Topics**: Players can input topics (e.g., "School", "Romance", "Food") to steer the AI's questions.
- **Dynamic Player System**: Supports up to 12 players with auto-assigned colors.
- **Fair Randomness**: Logic ensures the bottle points exactly to the winning player.
- **Offline Fallback**: Includes a robust library of static Truths and Dares if the internet is unavailable.

---

## 🛠 Tech Stack

- **Framework**: React Native (0.72+)
- **Language**: TypeScript
- **Graphics**: @shopify/react-native-skia
- **Animations**: react-native-reanimated (v3+)
- **Icons**: lucide-react-native
---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- React Native CLI (not Expo Go, as Skia requires native code)
- iOS Simulator (Mac) or Android Emulator

### 2. Initialize Project
Since this code relies on Native Modules, you must initialize a new React Native project:

```bash
cd BOTTLE_SPINNER
```

### 3. Install Dependencies
Install the required libraries:

```bash
npm install
```

### 4. Configure Native Dependencies

**iOS:**
```bash
cd ios && pod install && cd ..
```

**Android:**
No extra steps usually required for recent React Native versions.

**Babel Config (`babel.config.js`):**
Add the Reanimated plugin. It must be listed **last**.

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
  ],
};
```

### 5. API Key Configuration

1. Get an API Key from [OPEN AI API KEY](https://platform.openai.com/api-keys).
2. For quick testing, you can hardcode it in `ai/env.ts`

> **Security Note:** In a production app, never store API keys directly in the client code. Use a proxy server.

### 6. Run the App

**Start Metro Bundler:**
```bash
npm start
```

**Run on iOS:**
```bash
npm run ios
```

**Run on Android:**
```bash
npm run android
```

---

## 📂 Project Structure

```
TruthOrDare/
├── App.tsx                 # Root component
├──src
├── ai
│   ├── aiservice.ts        # OpenAI/GPT logic (challenge generator, prompts, etc.)
│   └── env.ts              # API keys, environment configs
│
├── components
│   ├── BottleSpinner.tsx   # Bottle spinner UI + animation
│   ├── GameScreen.tsx      # Main game screen (truth/dare + challenges)
│   └── SetupScreen.tsx     # Player setup, number of players, topics, etc.
│
├── constants
│   └── constant.ts         # Static values, enums, config constants
│
└── types
    └── types.ts
```

---
## 🧩 How It Works

1. **Setup**: Users enter player names.
2. **The Spin**: 
   - We calculate a random winner index.
   - We calculate the exact angle required to point the bottle at that player.
   - We add multiple full rotations (360° * 5) + the target offset to create the animation.
3. **The Challenge**:
   - The selected player chooses **Truth** or **Dare**.
   - Optionally, they enter a **Topic**.
   - The app calls OPEN AI  API: *"Generate a dare involving [Topic] for a party game..."*
   - If the API fails, a static question is served from `constants.ts`.

---

## ⚠️ Troubleshooting

- **"Skia is not found"**: Make sure you ran `pod install` in the `ios` folder.
- **Reanimated Crash**: Ensure you cleared the metro cache (`npm start -- --reset-cache`) after adding the babel plugin.
- **Layout Issues**: The spinner size relies on `Dimensions.get('window').width`. Ensure the device is in Portrait mode.

---

## 📜 License

MIT
![alt text](<Simulator Screenshot - iPhone 17 Pro - 2025-11-29 at 10.21.27.png>) 
![alt text](<Simulator Screenshot - iPhone 17 Pro - 2025-11-29 at 10.21.30.png>) 
![alt text](<Simulator Screenshot - iPhone 17 Pro - 2025-11-29 at 10.21.38.png>) 
![alt text](<Simulator Screenshot - iPhone 17 Pro - 2025-11-29 at 10.22.00.png>)