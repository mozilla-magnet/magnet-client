//
//  ApiChannels.swift
//  Magnet
//
//  Created by Francisco Jordano on 01/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import Alamofire
import SwiftyJSON

class ApiChannels: ApiBase {
  private static let URL_STRING = "https://tengam.org/content/v1/channel"
  override func get(path: String, callback: ApiCallback) {
    
    guard System.connectedToNetwork() else {
      let store = RequestStore.getInstance()
      callback.onSuccess(store.getJSON(ApiChannels.URL_STRING)!)
      return
    }
    
    let url = NSURL(string: ApiChannels.URL_STRING)
    
    let request = NSURLRequest(URL: url!, cachePolicy: NSURLRequestCachePolicy.ReloadIgnoringLocalCacheData, timeoutInterval: 30)
    
    Alamofire.request(request).responseJSON { response in
      guard (response.result.value != nil) else {
        callback.onError("Error performing request \(ApiChannels.URL_STRING)")
        return
      }
      
      let json = JSON(response.result.value!)
      
      RequestStore.getInstance().setJSON(ApiChannels.URL_STRING, value: json)
      callback.onSuccess(json)
      
    }
  }
}
