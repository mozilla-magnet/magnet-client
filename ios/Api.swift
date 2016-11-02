//
//  Api.swift
//  Magnet
//
//  Created by Francisco Jordano on 01/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation
import SwiftyJSON

protocol Api {
  func get(path: String, callback: ApiCallback)
  func post(path: String, data: NSDictionary, callback: ApiCallback)
  func put(path: String, data: NSDictionary, callback: ApiCallback)
  func delete(path: String, data: NSDictionary, callback: ApiCallback)
  func mount(path: String, api: Api)
}

@objc class ApiCallback: NSObject {
  var onSuccess: ((JSON) -> Void)
  var onError: ((String) -> Void)
  
  init(success: ((JSON) -> Void), error: ((String) -> Void)) {
    onSuccess = success
    onError = error
  }
}

class ApiBase: Api {
  private var endpoints: Dictionary<String, Api> = Dictionary<String, Api>()
  
  func mount(path: String, api: Api) {
    endpoints[path] = api
  }
  
  private func find(namespace: String) -> Api? {
    return endpoints[namespace]
  }
  
  func get(path: String, callback: ApiCallback) {
    let api = find(path)
    
    guard api != nil else {
      callback.onError("Could not find route \(path)")
      return
    }
    
    api!.get(path, callback: callback)
  }
  
  func post(path: String, data: NSDictionary, callback: ApiCallback) {
    let api = find(path)
    
    guard api != nil else {
      callback.onError("Could not find route \(path)")
      return
    }
    
    api!.post(path, data: data, callback: callback)
  }
  
  func put(path: String, data: NSDictionary, callback: ApiCallback) {
    let api = find(path)
    
    guard api != nil else {
      callback.onError("Could not find route \(path)")
      return
    }
    
    api!.put(path, data: data, callback: callback)
  }
  
  func delete(path: String, data: NSDictionary, callback: ApiCallback) {
    let api = find(path)
    
    guard api != nil else {
      callback.onError("Could not find route \(path)")
      return
    }
    
    api!.delete(path, data: data, callback: callback)
  }
}
