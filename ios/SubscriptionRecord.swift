//
//  SubscriptionRecord.swift
//  magnet
//
//  Created by Wilson Page on 26/10/2016.
//

import Foundation

struct SubscriptionRecord {
  static let CHANNEL_NAME = "channel_name"
  static let NOTIFICATIONS_ENABLED = "notifications_enabled"
  
  var channel_name: String
  var notifications_enabled: Bool
  
  func toDictionary() -> Dictionary<String,AnyObject> {
    return [
      SubscriptionRecord.CHANNEL_NAME: channel_name,
      SubscriptionRecord.NOTIFICATIONS_ENABLED: notifications_enabled
    ]
  }
}
