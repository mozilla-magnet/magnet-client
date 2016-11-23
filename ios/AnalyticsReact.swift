//
//  AnalyticsReact.swift
//  Magnet
//
//  Created by sam on 11/21/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

@objc(AnalyticsReact) class AnalyticsReact: NSObject {
  private let analytics = Analytics()
  
  @objc func trackEvent(data: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    let json = JSON(data);

    analytics.trackEvent(json, callback: ApiCallback(success: { result in
        resolve(result.rawValue)
      },
      error: { (error) in
        let err = NSError(coder: NSCoder())
        reject("get_error", "Error tracking event", err)
    }))
  }
  
  @objc func trackScreenView(data: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    let json = JSON(data)
    analytics.trackScreenView(json, callback: ApiCallback(success: { result in
        resolve(result.rawValue)
      },
      error: { (error) in
        let err = NSError(coder: NSCoder())
        reject("get_error", "Error tracking screen view", err)
    }))
  }
  
  @objc func trackTiming(data: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    let json = JSON(data)
    analytics.trackTiming(json, callback: ApiCallback(success: { result in
        resolve(result.rawValue)
      },
      error: { (error) in
        let err = NSError(coder: NSCoder())
        reject("get_error", "Error tracking timing event", err)
    }))
  }
}
