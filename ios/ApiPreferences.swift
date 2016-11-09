//
//  ApiPreferences.swift
//  magnet
//
//  Created by sam on 11/7/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

class ApiPreferences: ApiBase {
  private let store: RequestStore
  private static let PATH = "content://preferences"
  private let lockQueue = dispatch_queue_create("com.mozilla.magnet.apipreferences", nil)

  override init() {
    store = RequestStore.getInstance()
    super.init()
  }

  override func get(path: String, callback: ApiCallback) {
    if let json = store.getJSON(ApiPreferences.PATH) {
      callback.onSuccess(json)
    } else {
      callback.onSuccess(JSON(""))
    }
  }

  override func post(path: String, data: NSDictionary, callback: ApiCallback) {
    var json = JSON("{}");

    dispatch_sync(lockQueue) {

      if let storedJson = store.getJSON(ApiPreferences.PATH) {
        json = storedJson
      }

      json[data["pref_key"] as! String] = JSON(tryAsBooleanString(data["value"]!.description))

      store.setJSON(ApiPreferences.PATH, value: json)
    }

    callback.onSuccess(json)
  }

  override func delete(path: String, data: NSDictionary, callback: ApiCallback) {
    var json = JSON("{}");

    dispatch_sync(lockQueue) {

      if var storeJson = store.getJSON(ApiPreferences.PATH) {
        storeJson[data["pref_key"] as! String] = nil
        json = storeJson
        store.setJSON(ApiPreferences.PATH, value: storeJson)
      }
    }

    callback.onSuccess(json)
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
