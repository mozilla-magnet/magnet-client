//
//  NotificationsHelperIOS10.swift
//  Magnet
//
//  Created by Francisco Jordano on 04/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import UserNotifications
import UserNotificationsUI
import SwiftyJSON

@available(iOS 10.0, *)
class NotificationsHelperIOS10: NSObject, UNUserNotificationCenterDelegate {
  private static let CATEGORY = "magnet.notifications.category"
  
  override init() {
    super.init()
    UNUserNotificationCenter.currentNotificationCenter().delegate = self
  }
  
  func processNotifications(toNotify: Dictionary<String, String>) {
    toNotify.keys.forEach { (url) in
      let channel = toNotify[url]
      processNotification(url, channel: channel!)
    }
  }
  
  private func processNotification(url: String, channel: String) {
    fetchData(url, callback: { (json) in
      do {
        guard json[0] != nil && json[0]["description"] != nil && json[0]["title"] != nil else {
          return
        }
        
        try self.showRichNotification(json[0]["title"].string!,
              subtitle: "by \(channel)",
              body: json[0]["description"].string!,
              url: url)
      } catch {
        debugPrint("Could not launh notification for \(url) : \(channel)")
      }
    })
  }
  
  private func fetchData(url: String, callback: ((JSON) -> Void)) {
    let api = ApiMetadata()
    
    let item: Dictionary<String, String> = ["url": url]
    let objects: Dictionary<String, NSArray> = ["objects": [item]]
    
    api.post("metadata", data: objects, callback: ApiCallback(success: { json in
        callback(json)
      }, error: { (err) in
        debugPrint("Could not get metadata for \(url): \(err)")
    }))
  }
  
  private func showRichNotification(title: String, subtitle: String, body: String, url: String) {
    let content = UNMutableNotificationContent()
    content.title = title
    content.subtitle = subtitle
    content.body = body
    content.categoryIdentifier = NotificationsHelperIOS10.CATEGORY
    
    let action = UNNotificationAction(identifier: "visit", title: "Visit", options: UNNotificationActionOptions.Foreground)
    let category = UNNotificationCategory(identifier: NotificationsHelperIOS10.CATEGORY, actions: [action], intentIdentifiers: [], options: [])
    UNUserNotificationCenter.currentNotificationCenter().setNotificationCategories([category])
    
    let request = UNNotificationRequest(identifier: url, content: content, trigger: nil)
    UNUserNotificationCenter.currentNotificationCenter().addNotificationRequest(request, withCompletionHandler: nil)
  }
  
  func userNotificationCenter(center: UNUserNotificationCenter, didReceiveNotificationResponse response: UNNotificationResponse, withCompletionHandler completionHandler: () -> Void) {
    if (response.actionIdentifier == "visit") {
      debugPrint("Launching web page \(response.notification.request.identifier)")
      let url = NSURL(string: response.notification.request.identifier)
      UIApplication.sharedApplication().openURL(url!, options: [:], completionHandler: nil)
    }
  }
  
}
