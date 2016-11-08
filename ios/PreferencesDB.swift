//
//  PreferencesDB.swift
//  magnet
//
//  Created by sam on 11/7/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SQLite

class PreferencesDB {
  private static var singleton: PreferencesDB!
  private let table: Table = Table("preferences")
  private let columnPrefKey = Expression<String>("pref_key");
  private let columnPrefValue = Expression<String>("value");
  private var db: Connection
  
  static func get() -> PreferencesDB {
    let lockQueue = dispatch_queue_create("com.mozilla.magnet.preferences", nil);
    
    dispatch_sync(lockQueue) {
      if (singleton == nil) {
        singleton = PreferencesDB()
      }
    }
    
    return singleton
  }
  
  private init() {
    let path = NSSearchPathForDirectoriesInDomains(
      .DocumentDirectory,
      .UserDomainMask,
      true).first!
    
    db = try! Connection("\(path)/history.sqlite3")
    
    try! db.run(table.create(ifNotExists: true) {
      table in
      table.column(columnPrefKey, primaryKey: true)
      table.column(columnPrefValue)
    })
  }
  
  func remove(prefKey: String) -> Bool {
    let row = table.filter(columnPrefKey == prefKey)
    return try! db.run(row.delete()) > 0
  }
  
  func setPrefs(prefs: Dictionary<String, String>) -> Bool {
    for (pref, value) in prefs {
      try! db.transaction {
        let filteredTable = self.table.filter(self.columnPrefKey == pref);
        
        if try! self.db.run(filteredTable.update(self.columnPrefValue <- value)) == 0 {
          try! self.db.run(self.table.insert(self.columnPrefKey <- pref, self.columnPrefValue <- value))
        }
      }
    }
    
    return true
  }
  
  func getPrefs() -> Dictionary<String, String> {
    var result = Dictionary<String, String>();

    for row in try! db.prepare(table) {
      
      // Convert to a boolean string so that it can be interpreted in the javascript correctly
      // Ideally we might want to support prefs that contain a string (like configurable metadata 
      // server etc.)
      result.updateValue(tryAsBooleanString(row[columnPrefValue]), forKey: row[columnPrefKey])
    }
    
    return result
  }
}

func tryAsBooleanString(value: String) -> String {
  switch(value) {
  case "0": return "false"
  case "1": return "true"
  case "true": return "true"
  case "false": return "false"
  default: return value
  }
}
