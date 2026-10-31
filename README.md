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
