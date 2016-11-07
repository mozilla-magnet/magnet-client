//
//  SubscriptionsSQLite.swift
//  magnet
//
//  Created by Wilson Page on 26/10/2016.
//

import Foundation
import SQLite

class SubscriptionsDB {
  private static var singleton: SubscriptionsDB!
  private let table: Table = Table("subscriptions")
  private let columnChannelName = Expression<String>(SubscriptionRecord.CHANNEL_NAME);
  private let columnNotificationsEnabled = Expression<Bool>(SubscriptionRecord.NOTIFICATIONS_ENABLED)
  private var db: Connection

  static func get() -> SubscriptionsDB {
    let lockQueue = dispatch_queue_create("com.mozilla.magnet.subscriptions", nil)
    
    // syncronized
    dispatch_sync(lockQueue) {
      if (singleton == nil) {
        singleton = SubscriptionsDB()
      }
    }
    
    return singleton
  }
  
  private init() {
    
    // get the application path
    let path = NSSearchPathForDirectoriesInDomains(
      .DocumentDirectory,
      .UserDomainMask,
      true).first!
    
    // get handle on database
    db = try! Connection("\(path)/history.sqlite3")
    
    // create the table if it doesnt exists
    try! db.run(table.create(ifNotExists: true) { table in
      table.column(columnChannelName, primaryKey: true)
      table.column(columnNotificationsEnabled)
    })
  }
  
  func add(channelName: String) -> Bool {
    guard !exists(channelName) else { return false }
    
    let insert = table.insert(
      columnChannelName <- channelName,
      columnNotificationsEnabled <- true)
  
    do { try db.run(insert) }
    catch { return false }
    
    return true
  }
  
  func remove(channelName: String) -> Bool {
    let row = table.filter(columnChannelName == channelName)
    return try! db.run(row.delete()) > 0
  }
  
  func update(channelName: String, updates: Dictionary<String,AnyObject>) -> Bool {
    let query = table.filter(columnChannelName == channelName);
    var setters:[SQLite.Setter] = [];
    
    // apply known columns
    if let notificationsEnabled = updates[SubscriptionRecord.NOTIFICATIONS_ENABLED] {
      setters.append(columnNotificationsEnabled <- (notificationsEnabled as! Bool))
    }
    
    return try! db.run(query.update(setters)) > 0
  }
  
  func exists(channelName: String) -> Bool {
    let query = table.filter(columnChannelName == channelName)
    return try! db.pluck(query) != nil
  }
  
  func get() -> [SubscriptionRecord] {
    var result:[SubscriptionRecord] = [];
    
    for row in try! db.prepare(table) {
      result.append(SubscriptionRecord(
        channel_name: row[columnChannelName],
        notifications_enabled: row[columnNotificationsEnabled]
      ))
    }
    
    return result;
  }
}
