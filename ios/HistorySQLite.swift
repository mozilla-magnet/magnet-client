//
//  HistorySQLite.swift
//  magnet
//  
//  SQLite helper class to deal with the definition and
//  sqlite operations to store the history of webs found.
//
//  Created by Francisco Jordano on 18/07/2016.
//

import Foundation
import SQLite

class HistorySQLite {
  private var db: Connection
  private let history: Table = Table("history")
  private let id: Expression<Int64> = Expression<Int64>("id")
  private let firstSeen: Expression<Int64> = Expression<Int64>("firstSeen")
  private let lastSeen: Expression<Int64> = Expression<Int64>("lastSeen")
  private let url: Expression<String> = Expression<String>("url")
  
  init() {
    let path = NSSearchPathForDirectoriesInDomains(
      .DocumentDirectory, .UserDomainMask, true
      ).first!
    
    db = try! Connection("\(path)/history.sqlite3")
    
    // Create the table if it doesnt exists
    try! db.run(history.create(ifNotExists: true) { t in
      t.column(id, primaryKey: .Autoincrement)
      t.column(url)
      t.column(firstSeen)
      t.column(lastSeen)
    })
  }
  
  func insert(theUrl: String) {
    let now = Int64(NSDate().timeIntervalSince1970)
    let insert = history.insert(url <- theUrl, firstSeen <- now, lastSeen <- now)
    
    try! db.run(insert)
  }
  
  func updateLastSeen(theId: Int64) {
    let now = Int64(NSDate().timeIntervalSince1970)
    let record = history.filter(id == theId)
    let update = record.update(lastSeen <- now)
    try! db.run(update)
  }
  
  func update(theId: Int64, _url: String, _lastSeen: Int64, _firstSeen: Int64) {
    let record = history.filter(id == theId)
    let update = record.update(lastSeen <- _lastSeen, url <- _url, firstSeen <- _firstSeen)
    try! db.run(update)
  }
  
  func getSince(theUrl: String, sinceDate: NSDate) -> HistoryRecord! {
    let date = Int64(sinceDate.timeIntervalSince1970)
    let query = history.filter(url == theUrl && lastSeen > date).limit(1)
    let result = Array(try! db.prepare(query))
    
    if (result.count == 0) {
      return nil
    }

    let record = result[0]
    return HistoryRecord(id: record[id],
            url: record[url],
            lastSeen: record[lastSeen],
            firstSeen: record[firstSeen])
  }
  
  func clear() {
    try! db.run(history.delete())
  }
  
}
