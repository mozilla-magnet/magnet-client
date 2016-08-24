import Foundation
import MagnetScannerIOS

class MagnetScanner: NSObject {
  var scanner: MagnetScannerIOS.MagnetScanner!;
  var callback: ((Dictionary<String, AnyObject>) -> Void)!

  init(callback: (Dictionary<String, AnyObject>) -> Void) {
    super.init();
    scanner = MagnetScannerIOS.MagnetScanner(callback: callback);
  }

  func start() {
    scanner.start();
  }

  func stop() {
    scanner.stop();
  }
}