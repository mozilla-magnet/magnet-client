//
//  History.swift
//  magnet
//
//  This class manages the high level access to the history
//  of urls that the user has found.
//
//  Created by Francisco Jordano on 19/07/2016.
//

import Foundation

class History {
  private static var sharedInstance: History!
  private var db: HistorySQLite
  private let RECENT_PERIOD = 60 * 60
  private init() {
    db = HistorySQLite()
  }
  
  class func getInstance() -> History {
    // Synchronized
    let lockQueue = dispatch_queue_create("com.mozilla.magnet.history", nil)
    dispatch_sync(lockQueue) {
      if (sharedInstance == nil) {
        sharedInstance = History()
      }
    }
    return sharedInstance
  }
  
  func record(url: String) {
    let recent = getRecent(url)
    if (recent != nil) {
      db.updateLastSeen(recent.id)
      return
    }
    db.insert(url)
  }
  
  func getRecent(url: String) -> HistoryRecord! {
    let earlyDate = NSCalendar.currentCalendar().dateByAddingUnit(
      .Hour,
      value: -1,
      toDate: NSDate(),
      options: [])
    return db.getSince(url, sinceDate: earlyDate!)
  }
  
  func clear() {
    db.clear()
  }
}
