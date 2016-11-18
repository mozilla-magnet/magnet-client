//
//  RegionManager.swift
//  Magnet
//
//  Created by Francisco Jordano on 09/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//
//  This class takes care of waking up in background and
//  checking the current location to know if there are interesting
//  things around.
//  In order to do this we use the region functionality in iOS.
//  We setup circular regions centered in the current location of the user,
//  when the OS detect that we abandon that region, we get a callback and have
//  some time in the background to get a meassure of the new location, check
//  if there are interesting things around and setup the new region.
//
//  This process will happen, creation of the region, detection of the region
//  being abandoned, checking things around, and again we start.
import Foundation
import CoreLocation
import MagnetScannerIOS

@objc(RegionManager) class RegionManager: NSObject, CLLocationManagerDelegate {
  let locationManager:CLLocationManager = CLLocationManager()
  private static let REGION_NAME = "region.magnet.mozilla.org"
  private static let REGION_RADIUS: Double = 50
  var scanner: MagnetScanner? = nil
  var isEnabled = true
  var currentRegion: CLRegion?
  let locationResolver: LocationHelper = LocationHelper()
  
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
    Log.l("Found item on leaving region \(item)")
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
    setupRegion()
  }
  
  @objc func stopListeningToRegionChange() {
    guard isEnabled && self.currentRegion != nil else {
      return
    }
    Log.l("Stoping listening to region changes")
    
    self.locationManager.stopMonitoringForRegion(self.currentRegion!)
  }
  
  private func setupRegion() {
    locationResolver.start { location in
      let region = CLCircularRegion(center: location.coordinate, radius: RegionManager.REGION_RADIUS, identifier: RegionManager.REGION_NAME)
      self.currentRegion = region
      Log.l("Setting up region \(region)")
      self.locationManager.startMonitoringForRegion(region)
    }
  }
  
  func locationManager(manager: CLLocationManager, didExitRegion region: CLRegion) {
    setupRegion()
    Log.l("Waking up case region abandoned")
    self.scanner!.start()
  }
}
