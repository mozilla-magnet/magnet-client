//
//  ReactScanner.swift
//  magnet
//
//  Created by Wilson Page on 05/07/2016.
//  Copyright © 2016 Facebook. All rights reserved.
//

import Foundation

@objc(MagnetScannerReact) class MagnetScannerReact: NSObject {
  var scanner: MagnetScanner!;
  var bridge: RCTBridge!
  
  override init() {
    super.init()
    scanner = MagnetScanner(callback: onItemFound)
  }
  
  @objc func start() {
    scanner.start()
  }
  
  @objc func stop() {
    scanner.stop()
  }
  
  func onItemFound(item: Dictionary<String, AnyObject>) {
    print("item found", item["url"]);
    bridge.eventDispatcher()
      .sendDeviceEventWithName("magnetscanner:itemfound", body: item);
  }
}
