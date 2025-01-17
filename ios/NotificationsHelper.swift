//
//  NotificationsHelper.swift
//  magnet
//
//  Created by Francisco Jordano on 12/07/2016.
//

import Foundation
import UIKit
import UserNotifications

@objc(NotificationsHelper) class NotificationsHelper: NSObject {
  static var enabled: Bool = true
  static var notifyTimer: NSTimer!
  static var toNotify: Dictionary<String, String> = [:]
  static let subscriptions: Subscriptions = Subscriptions()
  @available(iOS 10.0, *)
  static let ios10Helper: NotificationsHelperIOS10 = NotificationsHelperIOS10()
  
  @objc class func register() {
    let notificationsSettings = UIUserNotificationSettings(forTypes: [.Alert, .Badge], categories: nil)
    UIApplication.sharedApplication().registerUserNotificationSettings(notificationsSettings)
  }
  
  class func updateNotifications() {
    guard enabled else { return }
    
    if #available(iOS 10, *) {
      ios10Helper.processNotifications(toNotify)
      return;
    }
    
    // Normal ios9 notifications
    
    clearNotifications()
    
    let notification = UILocalNotification()
    notification.alertBody = "Content found nearby"
    UIApplication.sharedApplication().presentLocalNotificationNow(notification)
  }
  
  @objc class func clearNotifications() {
    if #available(iOS 10.0, *) {
      let center = UNUserNotificationCenter.currentNotificationCenter()
      center.removeAllDeliveredNotifications()
    } else {
      UIApplication.sharedApplication().cancelAllLocalNotifications()
      // Clean any badge
      UIApplication.sharedApplication().applicationIconBadgeNumber = 0
    }
  }
  
  class func showNotification(msg: String) {
    UIApplication.sharedApplication().cancelAllLocalNotifications()
    // Clean any badge
    UIApplication.sharedApplication().applicationIconBadgeNumber = 0
    let notification = UILocalNotification()
    notification.alertBody = msg
    UIApplication.sharedApplication().presentLocalNotificationNow(notification)
  }
  
  // Throttles the notification process, waiting for 10 seconds until
  // setting up the badge with the number of elements nearby.
  class func notifyUser(url: String, channel: String?) {
    guard toNotify[url] == nil else {
      Log.l("Abort, notification already scheduled for \(url)")
      return
    }
    
    if channel != nil && !subscriptions.exists(channel!) {
      Log.l("Abort notification for \(url), user not subscribed to channel \(channel)")
      return
    }
    
    toNotify[url] = channel
    if (notifyTimer != nil) {
      notifyTimer.invalidate();
    }
    
    // We need to throttle the notifications, waiting for receive more nearby web pages,
    // so we use NSTimer to wait for 10 seconds and after that we trigger the action, in
    // this case doNotifyUser, that notifies depending on the number of web pages found
    // during the waiting period.
    notifyTimer = NSTimer.init(
      timeInterval: 5 ,
      target: self,
      selector: #selector(doNotifyUser),
      userInfo: nil,
      repeats: false)
    // It's important to note that this timer is being execute in the main loop
    // (look at NSRunLoop.mainRunLoop) to be sure that the notifications will reflect
    // changes in the UI despite of this being trigget in the background.
    NSRunLoop.mainRunLoop().addTimer(notifyTimer, forMode: NSDefaultRunLoopMode)
    
    // Save the record in history for analyzing in future iterations.
    History.getInstance().record(url)
  }
  
  @objc private class func doNotifyUser() {
    NotificationsHelper.updateNotifications();
    toNotify = [:];
  }
  
  @objc class func enable() {
    enabled = true
  }
  
  @objc class func disable() {
    enabled = false
  }
}
