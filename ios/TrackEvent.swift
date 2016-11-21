//
//  TrackEvent.swift
//  Magnet
//
//  Created by sam on 11/21/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

class TrackEvent: CallableTracker {
  var category: String
  var action: String
  var label: String?
  var value: Int64?
  
  // This weird '_' syntax before a paremeter label opts out of the necessity to 
  // specify labels when invoking this constructor.
  init(_ category: String,_ action: String,_ label: String?,_ value: Int64?) {
    self.category = category
    self.action = action
    self.label = label
    self.value = value
  }
  
  func call(analytics: Analytics) {
    analytics.trackEvent(category, action: action, label: label, value: value)
  }
  
  static func fromJSON(json: JSON) -> TrackEvent {
    let category = json["category"].string!
    let action = json["action"].string!
    let label = json["label"].string
    let value = json["value"].int64
    
    return TrackEvent(category, action, label, value)
  }
}
