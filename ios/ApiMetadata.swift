//
//  ApiMetadata.swift
//  Magnet
//
//  Created by Francisco Jordano on 03/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import Alamofire
import SwiftyJSON

class ApiMetadata: ApiBase {
  private static let SERVER_URL = kMetadataServiceUrl

  override func get(path: String, callback: ApiCallback) {
    callback.onError("Not implemented")
  }

  override func delete(path: String, data: NSDictionary, callback: ApiCallback) {
    callback.onError("Not implemented")
  }

  override func put(path: String, data: NSDictionary, callback: ApiCallback) {
    callback.onError("Not implemented")
  }

  // The data attribute expect an object like the metadata server expects:
  // { "objects": [{"url":"https://...."} ....] }
  // Or call it natively building a NSDictionary like:
  //  var data: Dictionary<String, NSArray> = Dictionary<String, NSArray>()
  //  var item: Dictionary<String, String> = Dictionary<String, String>()
  //  item["url"] = "https://mozilla.com"
  //  let elems = NSArray(arrayLiteral: item)
  //
  //  data["objects"] = elems

  override func post(path: String, data: NSArray, callback: ApiCallback) {
    guard System.connectedToNetwork() else {
      callback.onError("No internet connection")
      return
    }

    let url = NSURL(string: ApiMetadata.SERVER_URL)
    var urls = Array<Dictionary<String,String>>();

    for url in data {
      urls.append(["url": url as! String]);
    }

    let body = ["objects": urls]
    let request = NSMutableURLRequest(URL: url!)

    request.HTTPMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.HTTPBody = try! NSJSONSerialization.dataWithJSONObject(body, options: [])

    Alamofire.request(request).responseJSON { response in
      guard response.result.value != nil else {
        callback.onError((response.result.error!).localizedDescription)
        return
      }

      callback.onSuccess(JSON(response.result.value!))
    }
  }
}
