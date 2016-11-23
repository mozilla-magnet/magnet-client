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
    @IBOutlet var loadingSpinner: UIActivityIndicatorView!
  
    private static var notification: UNNotification?
  
    override func viewDidLoad() {
        super.viewDidLoad()
    }
  
    func didReceiveNotification(notification: UNNotification) {
      NotificationViewController.notification = notification

      dispatch_async(dispatch_get_main_queue(), { () -> Void in
        self.processNotification()
      })

      
    }
  
    func processNotification() {
      guard let notification: UNNotification = NotificationViewController.notification! else {
        return
      }
      
      guard let imageURL: String = notification.request.content.launchImageName else {
        return
      }
      
      // Start animating the spinner that is currently visible
      self.loadingSpinner.hidden = false
      self.loadingSpinner.startAnimating()
      
      self.imageView.stopAnimating()
      
      NSURLSession.sharedSession().dataTaskWithURL(NSURL(string: imageURL)!, completionHandler: { (data, response, error) -> Void in
        
        if error != nil {
          self.loadingSpinner.stopAnimating()
          return
        }

        dispatch_async(dispatch_get_main_queue(), { 
          let image = UIImage(data: data!)
          self.imageView.image = image
          self.imageView.clipsToBounds = true
          self.imageView.contentMode = .ScaleAspectFill
          
          self.loadingSpinner.hidden = true
          self.loadingSpinner.stopAnimating()
          self.imageView.hidden = false
        })
        
      }).resume()
    }
  
}
