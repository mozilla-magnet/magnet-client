//
//  Subscriptions.swift
//  magnet
//
//  Created by Wilson Page on 26/10/2016.
//

import Foundation

class Subscriptions: NSObject {
  private var db: SubscriptionsDB!
  
  override init() {
    super.init();
    db = SubscriptionsDB.get()
  }
  
  func add(channelName: String) -> Bool {
    return db.add(channelName)
  }
  
  func remove(channelName: String) -> Bool {
    return db.remove(channelName)
  }
  
  func update(channelName: String, updates: Dictionary<String,AnyObject>) -> Bool {
    return db.update(channelName, updates: updates)
  }
  
  func get() -> [SubscriptionRecord] {
    return db.get();
  }
  
  func exists(channelName: String) -> Bool {
    return db.exists(channelName)
  }
}
