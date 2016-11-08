//
//  Preferences.swift
//  magnet
//
//  Created by Sam Giles on 11/7/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation

class Preferences: NSObject {
  private var db: PreferencesDB!
  
  override init() {
    super.init()
    db = PreferencesDB.get()
  }
  
  func remove(prefKey: String) -> Bool {
    return db.remove(prefKey)
  }
  
  func update(updates: Dictionary<String, String>) -> Bool {
    return db.setPrefs(updates);
  }
  
  func get() -> Dictionary<String, String> {
    return db.getPrefs()
  }
}
