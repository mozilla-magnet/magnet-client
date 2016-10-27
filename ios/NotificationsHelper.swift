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
  
  @objc class func register() {
    let notificationsSettings = UIUserNotificationSettings(forTypes: [.Alert, .Badge], categories: nil)
    UIApplication.sharedApplication().registerUserNotificationSettings(notificationsSettings)
  }
  
  class func updateNotifications() {
    guard enabled else { return }
    
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
    
  @objc class func enable() {
    enabled = true
  }
  
  @objc class func disable() {
    enabled = false
  }
}
