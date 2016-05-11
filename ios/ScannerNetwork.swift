import Foundation

@objc(ScannerNetwork) class ScannerNetwork: NSObject, NSNetServiceBrowserDelegate {
  let MDNS_SERVICE_TYPE = "_http._tcp."
  var serviceBrowser: NSNetServiceBrowser!
  var bridge: RCTBridge!
  
  override init() {
    super.init()
    serviceBrowser = NSNetServiceBrowser()
    serviceBrowser.delegate = self
  }

  @objc func start() -> Void {
    print("starting scanner")
    serviceBrowser.searchForServicesOfType(MDNS_SERVICE_TYPE, inDomain: "")
  }

  @objc func stop() -> Void {
    print("stopping scanner");
    serviceBrowser.stop()
  }
  
  func notify(url: String) {
    print("notify", url);
    self.bridge.eventDispatcher.sendDeviceEventWithName("magnet:urlfound", body: [url]);
  }
  
  func netServiceBrowser(aNetServiceBrowser: NSNetServiceBrowser, didFindService service: NSNetService, moreComing: Bool) {
    print("found service: \(service.name)")
    notify(service.name);
  }
  
  func netServiceBrowser(aNetServiceBrowser: NSNetServiceBrowser, didRemoveService aNetService: NSNetService, moreComing: Bool) {
    print("lost service: \(aNetService.name)")
  }
}