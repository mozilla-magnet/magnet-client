//
//  ApiMagnet.swift
//  Magnet
//
//  Created by Francisco Jordano on 01/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation

class ApiMagnet: ApiBase {
  
  override init() {
    super.init()
    mount("channels", api: ApiChannels())
    mount("subscriptions", api: ApiSubscriptions())
  }
}
