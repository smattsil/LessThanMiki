# Less Than Miki

A React Native + Expo chat app for iOS and Android. WhatsApp-inspired light and dark themes follow the device setting.

## Run

Requires Node.js 22.13+ and npm.

```sh
npm ci
npm start
```

Scan the QR code with a compatible Expo Go app on iOS or Android. Use `npm run ios` for an iOS simulator (macOS with Xcode required), `npm run android` for an Android emulator, or `npm run web` for the web version.

## Features

- Chats and You bottom navigation tabs.
- One contact, Miki, with a blank avatar and searchable chat row.
- Local conversation with multiline message entry, date separators, timestamps, and persistent device storage.
- Placeholder You page and automatic light/dark appearance.

This is a local prototype: messages are not delivered to another person. The checkmark indicates a locally saved message. There is no backend, login, automatic reply, or end-to-end encryption implementation. Messages persist in unencrypted device storage; clearing application data removes them.

## Validate

```sh
npm run typecheck
npx expo export --platform all
```

Device smoke check: open Miki, send a message, return to Chats, relaunch the app and confirm persistence. Search for Miki, switch to You, and change the device appearance to verify both themes. Native device execution requires an emulator or physical device.

## iOS Liquid Glass

On supported iOS 26+ devices and compatible Expo Go/native builds, navigation, search, the chat header, and the message field use native Liquid Glass. Light and dark appearance follow the system. Runtime availability checks prevent rendering glass on unsupported iOS versions; enabling iOS Reduce Transparency switches to opaque controls, including when changed while the app is open.

Android and web use a separate component implementation with ordinary React Native views; they do not import the iOS glass module. No Android glass support is required. After updating the project, run `npm ci` and restart Expo. Custom development builds must be rebuilt when adding this native dependency.
