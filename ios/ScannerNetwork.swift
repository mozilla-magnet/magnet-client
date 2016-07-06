import Foundation

class ScannerNetwork: NSObject, Scanner, NSNetServiceBrowserDelegate {
  private var callback: ((Dictionary<String, AnyObject>) -> Void)!
  private let MDNS_SERVICE_TYPE = "_http._tcp."
  private var serviceBrowser: NSNetServiceBrowser!
  private var bridge: RCTBridge!
  
  init(callback: (Dictionary<String, AnyObject>) -> Void) {
    super.init()
    serviceBrowser = NSNetServiceBrowser()
    serviceBrowser.delegate = self
    self.callback = callback
  }

  func start() -> Void {
    print("starting scanner")
    serviceBrowser.searchForServicesOfType(MDNS_SERVICE_TYPE, inDomain: "")
  }

  func stop() -> Void {
    print("stopping scanner");
    serviceBrowser.stop()
  }
  

  private func notify(url: String) {
    print("notify", url)
    callback([
      "url": url,
      "distance": -1
    ])
  }
  
  func netServiceBrowser(aNetServiceBrowser: NSNetServiceBrowser, didFindService service: NSNetService, moreComing: Bool) {
    guard isUrl(service.name) else { return }
    print("found service: \(service.name)")
    notify(service.name);
  }
  
  func netServiceBrowser(aNetServiceBrowser: NSNetServiceBrowser, didRemoveService aNetService: NSNetService, moreComing: Bool) {
    print("lost service: \(aNetService.name)")
  }
  
  private func isUrl(url: String) -> Bool {
    guard let url = NSURL(string: url) else { return false }
    return !url.scheme.isEmpty
  }
}