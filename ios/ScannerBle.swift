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


/* ==!== Heavily edited for the URL discovery use case ==!== */

import CoreBluetooth

///
/// BeaconScanner
///
/// Scans for Eddystone compliant beacons using Core Bluetooth. To receive notifications of any
/// sighted beacons, be sure to implement BeaconScannerDelegate and set that on the scanner.
///
class BeaconScanner: NSObject, Scanner, CBCentralManagerDelegate {
  private var centralManager: CBCentralManager!
  // As we are going to background we will need to dispatch our queue for attending BTLE operaions in a serial queue.
  // more information: https://developer.apple.com/library/ios/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationQueues/OperationQueues.html
  private let beaconOperationsQueue: dispatch_queue_t = dispatch_queue_create("beacon_operations_queue", DISPATCH_QUEUE_SERIAL)
  private var shouldBeScanning: Bool = false
  private var callback: ((Dictionary<String, AnyObject>) -> Void)!
  
  init(callback: (Dictionary<String, AnyObject>) -> Void) {
    super.init()
    centralManager = CBCentralManager(delegate: self, queue: self.beaconOperationsQueue)
    centralManager.delegate = self
    self.callback = callback
  }
  
  func start() {
    dispatch_async(self.beaconOperationsQueue) {
      self.startScanningSynchronized()
    }
  }
  
  func stop() {
    centralManager.stopScan()
  }
  
  deinit {
    stop()
  }
  
  func centralManagerDidUpdateState(central: CBCentralManager)  {
    if central.state == CBCentralManagerState.PoweredOn && self.shouldBeScanning {
      start()
    }
  }
  
  func centralManager(central: CBCentralManager, didDiscoverPeripheral peripheral: CBPeripheral, advertisementData: [String : AnyObject], RSSI: NSNumber) {
    guard let serviceData = advertisementData[CBAdvertisementDataServiceDataKey] as? [NSObject : AnyObject] else { return }
    guard isUrlType(serviceData) else { return }
    guard let frame = getFrameData(serviceData) else { return }
    
    let bytes = getFrameBytes(frame)
    guard let url = getUrl(bytes) else { return }
    let distance = getDistance(bytes, rssi: RSSI.doubleValue)
    
    callback([
      "url": url,
      "distance": distance
    ])
  }
  
  private func startScanningSynchronized() {
    dispatch_async(self.beaconOperationsQueue) {
      if self.centralManager.state != CBCentralManagerState.PoweredOn {
        NSLog("CentralManager state is %d, cannot start scan", self.centralManager.state.rawValue)
        self.shouldBeScanning = true
      } else {
        NSLog("Starting to scan for Eddystones")
        let services = [CBUUID(string: "FEAA"), CBUUID(string: "FED8")]
        let options = [CBCentralManagerScanOptionAllowDuplicatesKey : true]
        self.centralManager.scanForPeripheralsWithServices(services, options: options)
      }
    }
  }
}

private func isUrlType(advertisementFrameList: [NSObject : AnyObject]) -> Bool {
  let eddystoneUUID = CBUUID(string: "FEAA")
  let uribeaconUUID = CBUUID(string: "FED8")
  let data = advertisementFrameList[uribeaconUUID]
  
  if (data == nil) {
    guard let frameData = advertisementFrameList[eddystoneUUID] as? NSData else { return false }
    guard frameData.length > 1 else { return false }
    
    let count = frameData.length
    var frameBytes = [UInt8](count: count, repeatedValue: 0)
    frameData.getBytes(&frameBytes, length: count)
    
    return frameBytes[0] == 0x10
  }
  
  return data?.length > 0
}

private func getFrameData(advertisementFrameList: [NSObject : AnyObject]) -> NSData? {

  // eddystone
  let eddystoneUUID = CBUUID(string: "FEAA")
  var data = advertisementFrameList[eddystoneUUID] as? NSData
  if (data != nil && data?.length > 0) { return data }
  
  // uri-beacon
  let uribeaconUUID = CBUUID(string: "FED8")
  data = advertisementFrameList[uribeaconUUID] as? NSData
  if (data != nil && data?.length > 0) { return data }
  
  // neither found
  return nil
}

private func getFrameBytes(frameData: NSData) -> [UInt8] {
  var frameBytes = [UInt8](count: frameData.length, repeatedValue: 0)
  frameData.getBytes(&frameBytes, length: frameData.length)
  return frameBytes;
}

private func getUrl(bytes: [UInt8]) -> String? {
  let scheme = getScheme(bytes[2])
  var result = scheme
  
  for i in 3..<bytes.count {
    result.appendContentsOf(getString(bytes[i]))
  }
  
  if (isUrl(result)) { return result }
  else { return nil }
}

private func isUrl(url: String) -> Bool {
  guard let url = NSURL(string: url) else { return false }
  return !url.scheme.isEmpty
}

private func getDistance(bytes: [UInt8], rssi: Double) -> Double {
  if rssi == 0 { return -1 }
  let txPower = Int8(bitPattern: bytes[1])
  return pow(10, ((Double(txPower) - rssi) - 41) / 20);
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
