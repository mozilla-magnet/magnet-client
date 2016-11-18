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
#import "RCTLinkingManager.h"

// Include the project headers for swift code. (<project-name>-Swift.h)
#import "magnet-Swift.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

  // Load from the server
  // jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
  // Load from local bundle
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];

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
  
  self.regionManager = [[RegionManager alloc] init];
  
  // Remote logs
  #if DEBUG
    [Bugfender enableAllWithToken:@""];
  #endif
  [Log log:@"Magnet Client starting"];

  return YES;
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [NotificationsHelper clearNotifications];
  [NotificationsHelper disable];
  [self.regionManager stopListeningToRegionChange];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
  [NotificationsHelper clearNotifications];
  [NotificationsHelper enable];
  [self.regionManager startListeningToRegionChange];
}

-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"notification:applaunch" body:nil];
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
  return [RCTLinkingManager application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
}


@end
