//
//  TrackScreenView.swift
//  Magnet
//
//  Created by sam on 11/21/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

class TrackScreenView: CallableTracker {
  var screenName: String

  // This weird '_' syntax before a paremeter label opts out of the necessity to
  // specify labels when invoking this constructor.
  init(_ screenName: String) {
    self.screenName = screenName
  }
  
  func call(analytics: Analytics) {
    analytics.trackScreenView(screenName)
  }
  
  static func fromJSON(json: JSON) -> TrackScreenView {
    let screenName = json["name"].string!
    
    return TrackScreenView(screenName)
  }
}
