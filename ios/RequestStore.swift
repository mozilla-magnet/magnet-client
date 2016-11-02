//
//  RequestStore.swift
//  Magnet
//
//  Created by Francisco Jordano on 01/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

class RequestStore {
  private static var sharedInstance: RequestStore!
  private static let lockQueue = dispatch_queue_create("com.mozilla.magnet.requeststore", nil)
  private let db: RequestStoreSQLite
  
  private init() {
    db = RequestStoreSQLite()
  }
  
  class func getInstance() -> RequestStore {
    dispatch_sync(lockQueue) { 
      if (sharedInstance == nil) {
        sharedInstance = RequestStore()
      }
    }
    
    return sharedInstance
  }
  
  func getJSON(url: String) -> JSON? {
    return db.get(url)
  }
  
  func setJSON(url: String, value: JSON) {
    db.put(url, _value: value, _timestamp: nil)
  }
  
  func setJSON(url: String, value: String) {
    db.put(url, _value: JSON(value), _timestamp: nil)
  }
}
