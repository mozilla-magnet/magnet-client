//
//  TrackTiming.swift
//  Magnet
//
//  Created by sam on 11/21/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

class TrackTiming: CallableTracker {
  var category: String
  var value: Double
  var name: String?
  var label: String?
  
  // This weird '_' syntax before a paremeter label opts out of the necessity to
  // specify labels when invoking this constructor.
  init(_ category: String,_ value: Double,_ name: String?,_ label: String?) {
    self.category = category
    self.value = value
    self.name = name
    self.label = label
  }
  
  func call(analytics: Analytics) {
    analytics.trackTiming(category, value: value, name: name, label: label)
  }
  
  static func fromJSON(json: JSON) -> TrackTiming {
    let category = json["category"].string!
    let value = json["value"].double!
    let name = json["name"].string
    let label = json["label"].string
    
    return TrackTiming(category, value, name, label)
  }
}
