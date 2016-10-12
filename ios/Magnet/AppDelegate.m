/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"
#import "RCTBridge.h"

// Include the project headers for swift code. (<project-name>-Swift.h)
#import "magnet-Swift.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"Magnet"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [NotificationsHelper register];
  [self.window makeKeyAndVisible];
  self.bridge = [[RCTBridge alloc] initWithBundleURL:jsCodeLocation
                                            moduleProvider: nil
                                            launchOptions:launchOptions];
  return YES;
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [NotificationsHelper clearNotifications];
  [NotificationsHelper disable];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
  [NotificationsHelper clearNotifications];
  [NotificationsHelper enable];
}

-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  if (application.applicationState == UIApplicationStateInactive ||
      application.applicationState == UIApplicationStateBackground) {
    [self.bridge.eventDispatcher sendDeviceEventWithName:@"notification:applaunch" body:nil];
  }
}

@end
