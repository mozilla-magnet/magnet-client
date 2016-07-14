import Foundation

@objc(MagnetScannerReact) class MagnetScannerReact: NSObject {
  var scanner: MagnetScanner!;
  var bridge: RCTBridge!
  var notifyTimer: NSTimer!
  var toNotify: [String]!
  
  override init() {
    super.init()
    toNotify = []
    scanner = MagnetScanner(callback: onItemFound)
  }
  
  @objc func start() {
    scanner.start()
  }
  
  @objc func stop() {
    // We don't stop scanning when the app goes into the background as we want bluetooth scanning to continue.
    // If we stop scanning we have no way of starting again until the app comes to the foreground.
    // When the app is in the background and the scanner is still running,
    // the OS will periodically call the scan-callback with results.
  }
  
  func onItemFound(item: Dictionary<String, AnyObject>) {
    print("item found", item["url"])
    bridge.eventDispatcher()
      .sendDeviceEventWithName("magnetscanner:itemfound", body: item)
    
    notifyUser(item["url"] as! String)
  }
  
  // Throttles the notification process, waiting for 1 minute until
  // setting up the badge with the number of elements nearby.
  func notifyUser(url: String) {
    if (toNotify.contains(url)) {
      return;
    }
    toNotify.append(url)
    if (notifyTimer != nil) {
      notifyTimer.invalidate();
    }
    
    // We need to throttle the notifications, waiting for receive more nearby web pages,
    // so we use NSTimer to wait for 1 minute and after that we trigger the action, in
    // this case doNotifyUser, that notifies depending on the number of web pages found
    // during the waiting period.
    notifyTimer = NSTimer.init(
      timeInterval: 60 ,
      target: self,
      selector: #selector(MagnetScannerReact.doNotifyUser),
      userInfo: nil,
      repeats: false)
    // It's important to note that this timer is being execute in the main loop
    // (look at NSRunLoop.mainRunLoop) to be sure that the notifications will reflect
    // changes in the UI despite of this being trigget in the background.
    NSRunLoop.mainRunLoop().addTimer(notifyTimer, forMode: NSDefaultRunLoopMode)
  }
  
  func doNotifyUser() {
    NotificationsHelper.updateBadge(toNotify.count);
    toNotify = [];
  }
}
