//
//  LocationChangeReceiver.swift
//  Magnet
//
//  Created by Francisco Jordano on 24/10/2016.
//

import Foundation
import CoreLocation

@objc(LocationChangeReceiver) class LocationChangeReceiver: NSObject, CLLocationManagerDelegate {
  let locationManager:CLLocationManager = CLLocationManager()
  var scanner: MagnetScanner! = nil
  
  @objc override init() {
    super.init()
    scanner = MagnetScanner(callback: self.onMagnetScanner)
  }
  
  private func onMagnetScanner(result: Dictionary<String, AnyObject>) {
    let url = result["url"] as! String
    // Uncomment following line for debug
    //NotificationsHelper.showNotification("Url we should notify \(url)")
    NotificationsHelper.notifyUser(url)
  }
  
  @objc func startSignificantLocationChanges() {
    self.locationManager.delegate = self
    self.locationManager.requestAlwaysAuthorization()
    self.locationManager.startMonitoringSignificantLocationChanges()
  }
  
  @objc func stopSignificantLocationChanges() {
    self.locationManager.stopMonitoringSignificantLocationChanges()
  }
  
  func locationManager(manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    // Scan just if we are in background
    guard UIApplication.sharedApplication().applicationState == UIApplicationState.Background else {
      return;
    }
    
    scanner!.start()
  }
}
