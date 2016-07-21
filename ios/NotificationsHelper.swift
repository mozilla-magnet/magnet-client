//
//  NotificationsHelper.swift
//  magnet
//
//  Created by Francisco Jordano on 12/07/2016.
//

import Foundation
import UIKit

@objc(NotificationsHelper) class NotificationsHelper: NSObject {
  static var enabled: Bool = true
  
  @objc class func register() {
    let notificationsSettings = UIUserNotificationSettings(forTypes: [.Alert, .Badge], categories: nil)
    UIApplication.sharedApplication().registerUserNotificationSettings(notificationsSettings)
  }
  
  class func updateNotifications() {
    guard enabled else { return }
    
    UIApplication.sharedApplication().cancelAllLocalNotifications()
    // Clean any badge
    UIApplication.sharedApplication().applicationIconBadgeNumber = 0
    let notification = UILocalNotification()
    notification.alertBody = "There are web pages around you"
    UIApplication.sharedApplication().presentLocalNotificationNow(notification)
  }
  
  @objc class func clearNotifications() {
    UIApplication.sharedApplication().cancelAllLocalNotifications()
    self.updateNotifications()
  }
  
  @objc class func enable() {
    enabled = true
  }
  
  @objc class func disable() {
    enabled = false
  }
}