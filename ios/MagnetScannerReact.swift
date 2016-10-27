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
    debugPrint("item found", item["url"])
    bridge.eventDispatcher()
      .sendDeviceEventWithName("magnetscanner:itemfound", body: item)
    
    let url = item["url"] as! String
    NotificationsHelper.notifyUser(url)
  }
}
