//
//  ApiSubscriptions.swift
//  Magnet
//
//  Created by Francisco Jordano on 02/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

class ApiSubscriptions: ApiBase {
  
  private static let PATH = "content://subscriptions"
  private var subscriptions: Subscriptions!
  
  override init() {
    super.init()
    subscriptions = Subscriptions()
  }
  
  override func get(path: String, callback: ApiCallback) {
    let all = subscriptions.get()
    var jsonObject = JSON([:])
    all.forEach { (record) in
      let jsonRecord: JSON = ["channel_id": record.channel_name, "notifications_enabled": true]
      jsonObject[record.channel_name] = jsonRecord
    }
    
    callback.onSuccess(jsonObject)
  }
  
  override func post(path: String, data: NSDictionary, callback: ApiCallback) {
    subscriptions.add(data["channel_id"] as! String)
    let json = JSON(data)
    callback.onSuccess(json)
  }
  
  override func delete(path: String, data: NSDictionary, callback: ApiCallback) {
    subscriptions.remove(data["channel_id"] as! String)
    let json = JSON(data)
    callback.onSuccess(json)
  }
}
