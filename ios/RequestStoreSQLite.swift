//
//  RequestStoreSQLite.swift
//  Magnet
//
//  Created by Francisco Jordano on 01/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SQLite
import SwiftyJSON

class RequestStoreSQLite {
  private var db: Connection
  private let requestStore: Table = Table("requeststore")
  private let url: Expression<String> = Expression<String>("url")
  private let value: Expression<String> = Expression<String>("value")
  private let timestamp: Expression<Int64> = Expression<Int64>("timestamp")
  
  init() {
    let path = NSSearchPathForDirectoriesInDomains(
      .DocumentDirectory, .UserDomainMask, true
      ).first!
    
    db = try! Connection("\(path)/requeststore.sqlite3")
    
    try! db.run(requestStore.create(ifNotExists: true) { t in
      t.column(url, primaryKey: true)
      t.column(value)
      t.column(timestamp)
    })
  }
  
  func clear() {
    try! db.run(requestStore.delete())
  }
  
  func put(_url: String, _value: JSON, _timestamp: Int64?) {
    let stringValue = _value.rawString()!
    
    var time = Int64(NSDate().timeIntervalSince1970)
    if (_timestamp != nil) {
      time = _timestamp!
    }
    
    try! db.transaction(block: {
      let filteredResults = self.requestStore.filter(self.url == _url)
      
      if try! self.db.run(filteredResults.update(self.value <- stringValue, self.timestamp <- time)) > 0 {
        // Updated correctly
      } else {
        // Insert
        let insert = self.requestStore.insert(self.url <- _url, self.value <- stringValue, self.timestamp <- time)
        try! self.db.run(insert)
      }
    })
  }
  
  func delete(_url: String) {
    let item = requestStore.filter(url == _url)
    try! db.run(item.delete())
  }
  
  func get(_url: String) -> JSON? {
    let query = requestStore.filter(url == _url).limit(1)
    
    let result = Array(try! db.prepare(query));
    
    guard result.count >= 1 else {
      return JSON("{}")
    }
    
    return JSON(result[0][value])
  }

}
