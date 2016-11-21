//
//  CallableTracker.swift
//  Magnet
//
//  Created by sam on 11/21/16.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation

protocol CallableTracker {
  func call(analytics: Analytics) -> Void;
}
