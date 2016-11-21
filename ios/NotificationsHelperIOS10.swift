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
    Log.l("Processing notification for \(url)")
    fetchData(url, callback: { (json) in
      do {
        guard json[0] != nil && json[0]["description"] != nil && json[0]["title"] != nil else {
          return
        }
        
        try self.showRichNotification(json[0]["title"].string!,
              subtitle: "by \(channel)",
              body: json[0]["description"].string!,
              image: json[0]["image"].string,
              url: url)
        Log.l("Dispatching rich notification for \(json.rawString())")
      } catch {
        Log.w("Could not launch notification for \(url) : \(channel)")
      }
    })
  }
  
  private func fetchData(url: String, callback: ((JSON) -> Void)) {
    let api = ApiMetadata()
    let urls: NSArray = [url]
    
    api.post("metadata", data: urls, callback: ApiCallback(success: { json in
      callback(json)
      }, error: { (err) in
        debugPrint("Could not get metadata for \(url): \(err)")
    }))
  }
  
  private func showRichNotification(title: String, subtitle: String, body: String, image: String?, url: String) {
    let content = UNMutableNotificationContent()
    content.title = title
    content.subtitle = subtitle
    content.body = body
    if let _image: String = image! {
      content.launchImageName = _image
    }
    content.categoryIdentifier = NotificationsHelperIOS10.CATEGORY
    
    let action = UNNotificationAction(identifier: "visit", title: "Visit", options: UNNotificationActionOptions.Foreground)
    let category = UNNotificationCategory(identifier: NotificationsHelperIOS10.CATEGORY, actions: [action], intentIdentifiers: [], options: [])
    UNUserNotificationCenter.currentNotificationCenter().setNotificationCategories([category])
    
    // Trigger this notification in 1 second from now.
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
    
    let request = UNNotificationRequest(identifier: url, content: content, trigger: trigger)
    UNUserNotificationCenter.currentNotificationCenter().addNotificationRequest(request, withCompletionHandler: {error in
      guard let error = error else {
        return
      }
      Log.w("Error while sending notification \(error)")
    })
  }
  
  func userNotificationCenter(center: UNUserNotificationCenter, didReceiveNotificationResponse response: UNNotificationResponse, withCompletionHandler completionHandler: () -> Void) {
    if (response.actionIdentifier == "visit") {
      Log.l("Launching web page \(response.notification.request.identifier)")
      let url = NSURL(string: response.notification.request.identifier)
      UIApplication.sharedApplication().openURL(url!, options: [:], completionHandler: nil)
    }
  }
  
}
