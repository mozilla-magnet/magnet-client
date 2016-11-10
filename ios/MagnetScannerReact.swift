import Foundation

@objc(MagnetScannerReact) class MagnetScannerReact: NSObject {
  var scanner: MagnetScanner!;
  var bridge: RCTBridge!
  
  override init() {
    super.init()
    scanner = MagnetScanner(callback: onItemFound)
  }
  
  @objc func start(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    scanner.start()
    resolve(true)
  }
  
  @objc func stop(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    scanner.stop()
    resolve(true)
  }
  
  func onItemFound(item: Dictionary<String, AnyObject>) {
    debugPrint("item found", item["url"])
    bridge.eventDispatcher()
      .sendDeviceEventWithName("magnetscanner:itemfound", body: item)
    
    let url = item["url"] as! String
    var channel: String? = nil
    if item["channel_id"] != nil {
      channel = item["channel_id"] as! String
    }
    NotificationsHelper.notifyUser(url, channel: channel)
  }
}
