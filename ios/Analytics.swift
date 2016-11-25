//
//  Analytics.swift
//  Magnet
//
//  Created by sam on 11/21/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

class Analytics {
  var tracker: GAITracker
  let apiPreferences = ApiPreferences()

  init() {
    let gai = GAI.sharedInstance()
    self.tracker = gai.trackerWithTrackingId(kGaTrackerId)
  }

  // Wrap a tracking function around a preference check.
  func doTrack(track: () -> Void,_ callback: ApiCallback) {
    func onPreferencesReceived(json: JSON) {
      // If telemetry is not enabled, return early.
      if !asBoolean(json["enableTelemetry"].string) {
        callback.onSuccess(true);
        return
      }

      track();
      callback.onSuccess(true)
    }

    apiPreferences.get("", callback:
      ApiCallback(success: onPreferencesReceived, error: callback.onError));
  }

  func trackEvent(data: JSON, callback: ApiCallback) {
    doTrack({() in
      self.doTrackEvent(data)
    }, callback);
  }

  func trackScreenView(data: JSON, callback: ApiCallback) {
    doTrack({() in
      self.doTrackScreenView(data)
    }, callback);
  }

  func trackTiming(data: JSON, callback: ApiCallback) {
    doTrack({() in
      self.doTrackTiming(data)
    }, callback);
  }

  func doTrackEvent(data: JSON) {
    let category = data["category"].string!
    let action = data["action"].string!
    let label = data["label"].string
    let value = data["value"].int64

    self.doTrackEvent(category, action: action, label: label, value: value)
  }

  func doTrackEvent(category: String, action: String, label: String?, value: Int64?) {
    
    var hit: GAIDictionaryBuilder
    
    if let _value = value {
      hit = GAIDictionaryBuilder.createEventWithCategory(
        category, action: action, label: nil, value: NSNumber(longLong: _value))
    } else {
      hit = GAIDictionaryBuilder.createEventWithCategory(
        category, action: action, label: nil, value: nil)
    }

    if let _label = label {
      hit.set(_label, forKey: kGAIEventLabel)
    }
    
    self.tracker.send(hit.build() as [NSObject : AnyObject])
  }

  func doTrackScreenView(data: JSON) {
    let screenName = data["name"].string!

    self.doTrackScreenView(screenName)
  }

  func doTrackScreenView(screenName: String) {
    self.tracker.set(kGAIScreenName, value: screenName)

    let hit = GAIDictionaryBuilder.createScreenView()
    self.tracker.send(hit.build() as [NSObject : AnyObject])
  }

  func doTrackTiming(data: JSON) {
    let category = data["category"].string!
    let value = data["value"].double!
    let name = data["name"].string!
    let label = data["label"].string

    self.doTrackTiming(category, value: value, name: name, label: label)
  }

  func doTrackTiming(category: String, value: Double, name: String, label: String?) {
    let hit:GAIDictionaryBuilder = GAIDictionaryBuilder.createTimingWithCategory(category, interval: NSNumber(double: value), name: name, label: nil)

    if let _label = label {
      hit.set(kGAITimingLabel, forKey: _label)
    }

    self.tracker.send(hit.build() as [NSObject : AnyObject])
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
