// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/* ==!== Heavily edited for the URL discovery use case + mDNS support ==!== */

import UIKit
import CoreBluetooth

///
/// BeaconScannerDelegate
///
/// Implement this to receive notifications about beacons.
protocol BeaconScannerDelegate {
  func urlContextChanged(beaconScanner: BeaconScanner)
}

///
/// BeaconScanner
///
/// Scans for Eddystone compliant beacons using Core Bluetooth. To receive notifications of any
/// sighted beacons, be sure to implement BeaconScannerDelegate and set that on the scanner.
///
class BeaconScanner: NSObject, CBCentralManagerDelegate, NSNetServiceBrowserDelegate, NSNetServiceDelegate {
  
  var delegate: BeaconScannerDelegate?
  
  private var centralManager: CBCentralManager!
  private var serviceBrowser: NSNetServiceBrowser!
  private let beaconOperationsQueue: dispatch_queue_t = dispatch_queue_create("beacon_operations_queue", nil)
  private var shouldBeScanning: Bool = false
  private var _urlFound = Set<NSURL>()
  
  var urlFound: Set<NSURL> {
    get {
      return _urlFound
    }
  }
  
  override init() {
    super.init()
    
    self.centralManager = CBCentralManager(delegate: self, queue: self.beaconOperationsQueue)
    self.centralManager.delegate = self
    
    self.serviceBrowser = NSNetServiceBrowser()
    self.serviceBrowser.delegate = self
  }
  
  func startScanning() {
    dispatch_async(self.beaconOperationsQueue) {
      self.startScanningSynchronized()
    }
  }
  
  func stopScanning() {
    self.centralManager.stopScan()
    self.serviceBrowser.stop()
  }
  
  deinit {
    self.stopScanning()
  }
  
  func centralManagerDidUpdateState(central: CBCentralManager)  {
    if central.state == CBCentralManagerState.PoweredOn && self.shouldBeScanning {
      self.startScanning();
    }
  }
  
  func centralManager(central: CBCentralManager, didDiscoverPeripheral peripheral: CBPeripheral, advertisementData: [String : AnyObject], RSSI: NSNumber) {
    guard let serviceData = advertisementData[CBAdvertisementDataServiceDataKey] as? [NSObject : AnyObject] else { return }
    guard isAdvertisingURL(serviceData) else { return }
    
    if let url = URLForFrame(serviceData) {
      self.addURL(url)
    }
  }
  
  func netServiceBrowser(browser: NSNetServiceBrowser, didFindService service: NSNetService, moreComing: Bool) {
    service.delegate = self
    service.resolveWithTimeout(30)
  }
  
  func netServiceBrowser(browser: NSNetServiceBrowser, didRemoveService service: NSNetService, moreComing: Bool) {
    service.delegate = nil
  }
  
  func netServiceDidResolveAddress(sender: NSNetService) {
    guard let host = sender.hostName else { return }
    
    let urlString = sender.port != 80 ? "http://\(host):\(sender.port)" : "http://\(host)"
    if let url = NSURL(string: urlString) {
      self.addURL(url)
    }
  }
  
  private func startScanningSynchronized() {
    dispatch_async(self.beaconOperationsQueue) {
      if self.centralManager.state != CBCentralManagerState.PoweredOn {
        NSLog("CentralManager state is %d, cannot start scan", self.centralManager.state.rawValue)
        self.shouldBeScanning = true
      } else {
        NSLog("Starting to scan for Eddystones")
        let services = [CBUUID(string: "FEAA")]
        let options = [CBCentralManagerScanOptionAllowDuplicatesKey : true]
        self.centralManager.scanForPeripheralsWithServices(services, options: options)
        NSLog("Starting to scan for mDNS")
        self.serviceBrowser.searchForServicesOfType("_http._tcp.", inDomain: "")
      }
    }
  }
  
  private func addURL(url: NSURL) {
    let count = self._urlFound.count
    self._urlFound.insert(url)
    if self._urlFound.count != count {
      self.delegate?.urlContextChanged(self)
    }
  }
  
  //TODO: add support for the URL eviction
  private func removeURL(url: NSURL) {
    self._urlFound.remove(url)
  }
}

private func isAdvertisingURL(advertisementFrameList: [NSObject : AnyObject]) -> Bool {
  let uuid = CBUUID(string: "FEAA")
  guard let frameData = advertisementFrameList[uuid] as? NSData else { return false }
  guard frameData.length > 1 else { return false }
  
  let count = frameData.length
  var frameBytes = [UInt8](count: count, repeatedValue: 0)
  frameData.getBytes(&frameBytes, length: count)
  
  return frameBytes[0] == 0x10
}

private func URLForFrame(advertisementFrameList: [NSObject : AnyObject]) -> NSURL? {
  let uuid = CBUUID(string: "FEAA")
  guard let frameData = advertisementFrameList[uuid] as? NSData else { return nil }
  guard frameData.length > 1 else { return nil }
  
  var frameBytes = [UInt8](count: frameData.length, repeatedValue: 0)
  frameData.getBytes(&frameBytes, length: frameData.length)
  
  let schemeByte = frameBytes[2]
  let scheme = getScheme(schemeByte)
  
  var result = scheme
  for i in 3..<frameData.length {
    result.appendContentsOf(getString(frameBytes[i]))
  }
  
  return NSURL(string: result)
}

private func getScheme(char: UInt8) -> String {
  switch char {
  case 0x00:
    return "http://www."
  case 0x01:
    return "https://www."
  case 0x02:
    return "http://"
  case 0x03:
    return "https://"
  default:
    return ""
  }
}

private func getString(char: UInt8) -> String {
  switch char {
  case 0x00:
    return ".com/"
  case 0x01:
    return ".org/"
  case 0x02:
    return ".edu/"
  case 0x03:
    return ".net/"
  case 0x04:
    return ".info/"
  case 0x05:
    return ".biz/"
  case 0x06:
    return ".gov/"
  case 0x07:
    return ".com/"
  case 0x08:
    return ".org/"
  case 0x09:
    return ".edu/"
  case 0x0a:
    return ".net/"
  case 0x0b:
    return ".info/"
  case 0x0c:
    return ".biz/"
  case 0x0d:
    return ".gov/"
  default:
    return NSString(format: "%c", char) as String
  }
}
