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
    let notificationsSettings = UIUserNotificationSettings(forTypes: [.Badge], categories: nil)
    UIApplication.sharedApplication().registerUserNotificationSettings(notificationsSettings)
  }
  
  class func updateBadge(num: Int) {
    if (enabled) {
      UIApplication.sharedApplication().applicationIconBadgeNumber = num;
    }
  }
  
  @objc class func clearNotifications() {
    self.updateBadge(0);
  }
  
  @objc class func enable() {
    enabled = true
  }
  
  @objc class func disable() {
    enabled = false
  }
}