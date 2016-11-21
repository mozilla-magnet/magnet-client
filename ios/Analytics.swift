//
//  Analytics.swift
//  Magnet
//
//  Created by sam on 11/21/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation

class Analytics {
  init() {}
  
  func trackEvent(category: String, action: String, label: String?, value: Int64?) {
    debugPrint("TRACK EVENT")
  }
  
  func trackScreenView(screenName: String) {
    debugPrint("TRACK SCREENVIEW")
  }
  
  func trackTiming(category: String, value: Double, name: String?, label: String?) {
    debugPrint("TRACK TIMING")
  }
}
