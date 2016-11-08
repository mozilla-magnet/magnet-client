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
  
  private static let PATH = "content://preferences"
  private var preferences: Preferences!
  
  override init() {
    super.init()
    preferences = Preferences()
  }
  
  override func get(path: String, callback: ApiCallback) {
    let all = preferences.get()
    callback.onSuccess(JSON(all))
  }
  
  override func post(path: String, data: NSDictionary, callback: ApiCallback) {
    
    var dict = Dictionary<String, String>()
    
    dict.updateValue(data["value"]!.description, forKey: data["pref_key"] as! String)
    
    preferences.update(dict)
    let json = JSON(dict)
    callback.onSuccess(json)
  }
  
  override func delete(path: String, data: NSDictionary, callback: ApiCallback) {
    preferences.remove(data["pref_key"] as! String)
    let json = JSON(data)
    callback.onSuccess(json)
  }
}
