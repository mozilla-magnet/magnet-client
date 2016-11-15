//
//  RegionManager.swift
//  Magnet
//
//  Created by Francisco Jordano on 09/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import CoreLocation
import MagnetScannerIOS

@objc(RegionManager) class RegionManager: NSObject, CLLocationManagerDelegate {
  let locationManager:CLLocationManager = CLLocationManager()
  private static let REGION_NAME = "region.magnet.mozilla.org"
  var scanner: MagnetScanner? = nil
  var isEnabled = true
  var currentRegion: CLRegion?
  let locationResolver: OneShotLocation = OneShotLocation()
  
  @objc override init() {
    super.init()
    
    isEnabled = CLLocationManager.isMonitoringAvailableForClass(CLRegion.self)
    
    guard isEnabled else {
      Log.w("Region monitoring not enabled for this device")
      return;
    }
    
    scanner = MagnetScanner(callback: self.onItemFound)
  }
  
  private func onItemFound(item: Dictionary<String, AnyObject>) {
    Log.l("Got item cause region abandoned \(item)")
    let url = item["url"] as! String
    var channel: String? = nil
    if item["channel_id"] != nil {
      channel = item["channel_id"] as! String
    }
    NotificationsHelper.notifyUser(url, channel: channel)
  }
  
  
  @objc func startListeningToRegionChange() {
    guard isEnabled else {
      return
    }
    Log.l("Start listening to region changes")
    self.locationManager.delegate = self
    setupRegion(nil)
  }
  
  @objc func stopListeningToRegionChange() {
    guard isEnabled && self.currentRegion != nil else {
      return
    }
    Log.l("Stoping listening to region changes")
    
    self.locationManager.stopMonitoringForRegion(self.currentRegion!)
  }
  
  private func setupRegion(callback:((Void) -> Void)?) {
    locationResolver.start { location in
      let region = CLCircularRegion(center: location.coordinate, radius: 50, identifier: RegionManager.REGION_NAME)
      self.currentRegion = region
      Log.l("Setting up region \(region)")
      self.locationManager.startMonitoringForRegion(region)
      if callback != nil {
        callback!()
      }
    }
  }
  
  func locationManager(manager: CLLocationManager, didExitRegion region: CLRegion) {
    setupRegion(nil)
    Log.l("Waking up case region abandoned")
    self.scanner!.start()
  }
}
