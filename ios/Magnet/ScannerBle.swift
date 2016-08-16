//
//  ScannerBle.swift
//  magnet
//
//  Created by Francisco Jordano on 13/04/2016.
//  Licencse MPL-2.0
//

import Foundation

class ScannerBle: NSObject, Scanner, BeaconScannerDelegate {
  var bridge: RCTBridge!
  var scanner: BeaconScanner!
  
  func start() {
    print("starting scanner")
    scanner = BeaconScanner()
    scanner.delegate = self
    scanner.start()
  }
  
  func notify(urls: Array<String>) {
    print("notifying js context for the following urls");
    for url in urls { NSLog("%@", url) }
    
  }
  
  func stop() -> Void {
    print("stopping scanner");
    scanner.stop();
  }
  
  func urlContextChanged(beaconScanner: BeaconScanner) {
    notify(beaconScanner.urls);
  }
}