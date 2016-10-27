//
//  Subscriptions.swift
//  magnet
//
//  Created by Wilson Page on 26/10/2016.
//  Copyright © 2016 Facebook. All rights reserved.
//

import Foundation

/**
  
 An adaptor layer around `Subscriptions`
 
 */

@objc(SubscriptionsReact) class SubscriptionsReact: Subscriptions {
  
  @objc func add(channelName: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(super.add(channelName))
  }
  
  @objc func remove(channelName: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(super.remove(channelName))
  }
  
  @objc func update(channelName: String, updates: Dictionary<String,AnyObject>, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(super.update(channelName, updates: updates))
  }
  
  @objc func get(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    let items: [SubscriptionRecord] = super.get();
    var result: [AnyObject] = [];
    
    for item in items {
      result.append(item.toDictionary())
    }
    
    resolve(result)
  }
}
