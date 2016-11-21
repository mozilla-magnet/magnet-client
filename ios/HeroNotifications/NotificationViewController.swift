//
//  NotificationViewController.swift
//  HeroNotifications
//
//  Created by Francisco Jordano on 17/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import UIKit
import UserNotifications
import UserNotificationsUI

class NotificationViewController: UIViewController, UNNotificationContentExtension {

    @IBOutlet var imageView: UIImageView!
  
    private static var notification: UNNotification?
  
    override func viewDidLoad() {
        super.viewDidLoad()
    }
  
    func didReceiveNotification(notification: UNNotification) {
      NotificationViewController.notification = notification
      
      let notifyTimer = NSTimer.init(
        timeInterval: 1,
        target: self,
        selector: #selector(processNotification),
        userInfo: nil,
        repeats: false)
      NSRunLoop.mainRunLoop().addTimer(notifyTimer, forMode: NSDefaultRunLoopMode)
    }
  
    func processNotification() {
      guard let notification: UNNotification = NotificationViewController.notification! else {
        return
      }
      
      guard let imageURL: String = notification.request.content.launchImageName else {
        return
      }
      
      guard let url = NSURL(string: imageURL) else {
        return
      }
      
      guard let image = UIImage(data: try NSData(contentsOfURL: url)!) else {
        return
      }
      
      self.imageView.image = image
      self.imageView.clipsToBounds = true
      self.imageView.contentMode = .ScaleAspectFill
    }
  
}
