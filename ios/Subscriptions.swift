//
//  Subscriptions.swift
//  magnet
//
//  Created by Wilson Page on 26/10/2016.
//

import Foundation

class Subscriptions: NSObject {
  private var db: SubscriptionsDB!
  private let lockQueue = dispatch_queue_create("com.mozilla.magnet.subscriptions.access", nil)
  
  override init() {
    super.init();
    db = SubscriptionsDB.get()
  }
  
  func add(channelName: String) -> Bool {
    var opResult = false
    dispatch_sync(lockQueue) {
      opResult = db.add(channelName)
    }
    return opResult
  }
  
  func remove(channelName: String) -> Bool {
    var opResult = false
    dispatch_sync(lockQueue) {
      opResult = db.remove(channelName)
    }
    return opResult
  }
  
  func update(channelName: String, updates: Dictionary<String,AnyObject>) -> Bool {
    var opResult = false
    dispatch_sync(lockQueue) {
      opResult = db.update(channelName, updates: updates)
    }
    return opResult
  }
  
  func get() -> [SubscriptionRecord] {
    var subscriptions: [SubscriptionRecord] = []
    dispatch_sync(lockQueue) {
      subscriptions = db.get();
    }
    return subscriptions
  }
  
  func exists(channelName: String) -> Bool {
    var exists = false
    dispatch_sync(lockQueue) {
      exists = db.exists(channelName)
    }
    return exists
  }
}
