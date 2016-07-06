//
//  MagnetScanner.swift
//  magnet
//
//  Created by Wilson Page on 05/07/2016.
//  Copyright © 2016 Facebook. All rights reserved.
//

import Foundation

class MagnetScanner: NSObject {
  var scanners = [String: Scanner]()
  var callback: ((Dictionary<String, AnyObject>) -> Void)!
  
  init(callback: (Dictionary<String, AnyObject>) -> Void) {
    scanners["ble"] = BeaconScanner(callback: callback);
    scanners["network"] = ScannerNetwork(callback: callback);
  }
  
  func start() {
    for (_, scanner) in scanners { scanner.start() }
  }
  
  func stop() {
    for (_, scanner) in scanners { scanner.stop() }
  }
}
