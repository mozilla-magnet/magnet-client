//
//  ApiAnalytics.swift
//  Magnet
//
//  Created by sam on 11/21/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

class ApiAnalytics: ApiBase {
  let preferencesApi = ApiPreferences();
  let analytics = Analytics();
  override init() {
    super.init()
  }
  
  override func post(path: String, data: NSDictionary, callback: ApiCallback) {
    func onPreferencesReceived(json: JSON) {
      debugPrint("RECEIVED PREFERENCES")
      
      // If telemetry is not enabled, return early.
      if !asBoolean(json["enableTelemetry"].string) {
        callback.onSuccess(true);
        return
      }
      
      let request = JSON(data);
      
      if let type = request["type"].string {
        switch(type) {
        case "timing":
          TrackTiming.fromJSON(request).call(analytics)
        case "event":
          TrackEvent.fromJSON(request).call(analytics)
        case "screenview":
          TrackScreenView.fromJSON(request).call(analytics)
        default:
          
          callback.onError("Unkown tracking type: '" + type + "'")
          return
        }
        
        callback.onSuccess(true);
      } else {
        
        callback.onError("Unspecified tracking 'type' parameter")
      }
    }
    
    preferencesApi.get("", callback:
      ApiCallback(success: onPreferencesReceived, error: callback.onError));
  }
}


func asBoolean(string: String?) -> Bool {
  if let _string = string {
    switch(_string) {
    case "0": return false
    case "1": return true
    case "true": return true
    case "false": return false
    default: return false
    }
  }
  
  return false
}
