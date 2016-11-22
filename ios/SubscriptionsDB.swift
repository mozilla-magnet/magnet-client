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
    db = try! Connection("\(path)/subscriptions.sqlite3")
    db.busyTimeout = 5
    db.busyHandler({ tries in
      if tries >= 3 {
        return false
      }
      return true
    })
    
    // create the table if it doesnt exists
    try! db.run(table.create(ifNotExists: true) { table in
      table.column(columnChannelName, primaryKey: true)
      table.column(columnNotificationsEnabled)
    })
  }
  
  func add(channelName: String) -> Bool {
    guard !exists(channelName) else { return false }
    
    do {
      try db.transaction(block: {
        let insert = self.table.insert(
          self.columnChannelName <- channelName,
          self.columnNotificationsEnabled <- true)
        
        try self.db.run(insert)
      })
    } catch { return false }
    
    return true
  }
  
  func remove(channelName: String) -> Bool {
    let row = table.filter(columnChannelName == channelName)
    do {
      try db.transaction(block: { 
        try self.db.run(row.delete())
      })
    } catch { return false }
    return true
  }
  
  func update(channelName: String, updates: Dictionary<String,AnyObject>) -> Bool {
    do {
      try db.transaction(block: { 
        let query = self.table.filter(self.columnChannelName == channelName);
        var setters:[SQLite.Setter] = [];
        
        // apply known columns
        if let notificationsEnabled = updates[SubscriptionRecord.NOTIFICATIONS_ENABLED] {
          setters.append(self.columnNotificationsEnabled <- (notificationsEnabled as! Bool))
        }
        
        try self.db.run(query.update(setters))
      })
    } catch { return false }
    
    return true
  }
  
  func exists(channelName: String) -> Bool {
    var result = false
    do {
      try db.transaction(block: { 
        let query = self.table.filter(self.columnChannelName == channelName)
        result = try self.db.pluck(query) != nil
      })
    } catch { return false }
    return result
  }
  
  func get() -> [SubscriptionRecord] {
    var result:[SubscriptionRecord] = [];
    
    do {
      try db.transaction(block: { 
        for row in try self.db.prepare(self.table) {
          result.append(SubscriptionRecord(
            channel_name: row[self.columnChannelName],
            notifications_enabled: row[self.columnNotificationsEnabled]
            ))
        }
      })
    } catch { return result }
    
    return result
  }
}
