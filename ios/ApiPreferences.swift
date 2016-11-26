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

  private func mergeDefaults(inout json: JSON) {
    for pref in kDefaultPreferences {
      if !json[pref[0]].exists() {
        json[pref[0]].string = pref[1];
      }
    }
  }
  
  override func get(path: String, callback: ApiCallback) {
    if var json = store.getJSON(ApiPreferences.PATH) {
      
      mergeDefaults(&json)
      callback.onSuccess(json)
    } else {
      
      var json = JSON("");
      mergeDefaults(&json);
      callback.onSuccess(json)
    }
  }

  override func post(path: String, data: NSDictionary, callback: ApiCallback) {
    var json = JSON("{}");

    // Lock this section to prevent any non-atomic updates to the JSON in
    // the RequestStore
    dispatch_sync(lockQueue) {

      if let storedJson = store.getJSON(ApiPreferences.PATH) {
        json = storedJson
      }

      // Coerce the value to a string with '.description'
      let value: String = data["value"]!.description
      let prefKey = data["pref_key"] as! String
      json[prefKey] = JSON(tryAsBooleanString(value))

      store.setJSON(ApiPreferences.PATH, value: json)
    }

    callback.onSuccess(json)
  }

  override func delete(path: String, data: NSDictionary, callback: ApiCallback) {
    var json = JSON("{}");

    // Lock this section to prevent any non-atomic updates to the JSON in
    // the RequestStore
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

// Given a string, try and alias it to 'true' or 'false' if.
// If it cannot be aliased return the string as is.
// We use this because the JavaScript at the moment expects only
// booleans for preferences, but we want to support aribitrary types
// in the future.
func tryAsBooleanString(value: String) -> String {
  switch(value) {
  case "0": return "false"
  case "1": return "true"
  case "true": return "true"
  case "false": return "false"
  default: return value
  }
}
