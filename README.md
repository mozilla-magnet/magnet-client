[![Stories in Ready](https://badge.waffle.io/mozilla-magnet/magnet.png?label=ready&title=Ready)](https://waffle.io/mozilla-magnet/magnet)
# Magnet

> A nearby content discovery client for Android and iOS built with React-Native.

## Setup

0. Make sure that you have node >= v5.11.0 and npm >= 3.8.6
1. Install react-native on your machine: `npm install react-native react-native-cli -g`
2. Clone this project: `git clone git@github.com:mozilla-magnet/magnet.git && cd magnet`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`

## Running on Android

5. Follow the ['running on device' instructions](https://facebook.github.io/react-native/docs/running-on-device-android.html#running-on-device)
6. Run `react-native run-android`

## Running on iOS

5. Install ['Carthage'](https://github.com/Carthage/Carthage) you can use the ['latest release'](https://github.com/Carthage/Carthage/releases). And perform the following from the `ios` directory:
```bash
carthage bootstrap --platform iOS
```
If you already have Carthage installed, this step has been added as part of the `postinstall` npm scripts.

6. Follow the ['running on device' instructions](https://facebook.github.io/react-native/docs/running-on-device-ios.html#content).

If you don't have a team certificate for the Mozilla organization choose your own developer certificate (or create one) and change the bundle indentifier.
