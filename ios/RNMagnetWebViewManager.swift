//
//  RNMagnetWebView.swift
//  IosCustomComponents
//
//  Created by Wilson Page on 05/05/2016.
//  Copyright © 2016 Facebook. All rights reserved.
//

import Foundation

@objc(MagnetWebViewManager) class MagnetWebViewManager : RCTViewManager {
  override func view() -> MagnetWebView! {
    return MagnetWebView()
  }
}
