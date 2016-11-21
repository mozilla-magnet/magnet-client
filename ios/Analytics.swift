//
//  Analytics.swift
//  Magnet
//
//  Created by sam on 11/21/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation

// TODO:
class Analytics {
  var tracker: GAITracker
  
  init() {
    let gai = GAI.sharedInstance()
    
    // TODO: Replace this hardcoded value with a value grabbed from config at build time
    self.tracker = gai.trackerWithTrackingId("UA-87693297-1")
  }
  
  func trackEvent(category: String, action: String, label: String?, value: Int64?) {
    let hit = GAIDictionaryBuilder.createEventWithCategory(
      category, action: action, label: nil, value: nil)
  
    if let _label = label {
      hit.set(kGAIEventLabel, forKey: _label)
    }
    
    if let _value = value {
      hit.setValue(NSNumber(longLong: _value), forKey: kGAIEventValue)
    }
    
    self.tracker.send(hit.build() as [NSObject : AnyObject])
    
    debugPrint("TRACK EVENT")
  }
  
  func trackScreenView(screenName: String) {
    self.tracker.set(kGAIScreenName, value: screenName)
    
    let hit = GAIDictionaryBuilder.createScreenView()
    self.tracker.send(hit.build() as [NSObject : AnyObject])
    debugPrint("TRACK SCREEN VIEW")
  }
  
  func trackTiming(category: String, value: Double, name: String, label: String?) {
    let hit:GAIDictionaryBuilder = GAIDictionaryBuilder.createTimingWithCategory(category, interval: NSNumber(double: value), name: name, label: nil)
    
    if let _label = label {
      hit.set(kGAITimingLabel, forKey: _label)
    }
    
    self.tracker.send(hit.build() as [NSObject : AnyObject])
    debugPrint("TRACK TIMING")
  }
}
