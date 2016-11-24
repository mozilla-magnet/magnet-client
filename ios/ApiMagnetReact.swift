//
//  ApiMagnetReact.swift
//  Magnet
//
//  Created by Francisco Jordano on 01/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation

@objc(ApiMagnetReact) class ApiMagnetReact: NSObject {
  private let api: ApiMagnet = ApiMagnet()
  
  @objc func get(path: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    api.get(path, callback: ApiCallback(success: { result in
        resolve(result.object)
      },
      error: { (error) in
        let errorMsg = "Error resolving \(path)"
        let err: NSError = NSError(domain: errorMsg, code: 0, userInfo: nil)
        reject("get_error", errorMsg, err)
    }))
  }
  
  @objc func post(path: String, data: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    api.post(path, data: data, callback: ApiCallback(success: { result in
        resolve(result.rawValue)
      },
      error: { (error) in
        let errorMsg = "Error resolving \(path) with \(data)"
        let err: NSError = NSError(domain: errorMsg, code: 0, userInfo: nil)
        reject("post_error", errorMsg, err)
    }))
  }
  
  @objc func postArray(path: String, data: NSArray, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    api.post(path, data: data, callback: ApiCallback(success: { result in
      resolve(result.rawValue)
      },
      error: { (error) in
        let errorMsg = "Error resolving \(path) with \(data)"
        let err: NSError = NSError(domain: errorMsg, code: 0, userInfo: nil)
        reject("postArray_error", errorMsg, err)
    }))
  }
  
  @objc func put(path: String, data: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    api.put(path, data: data, callback: ApiCallback(success: { result in
        resolve(result.rawValue)
      },
      error: { (error) in
        let errorMsg = "Error resolving \(path) with \(data)"
        let err: NSError = NSError(domain: errorMsg, code: 0, userInfo: nil)
        reject("put_error", errorMsg, err)
    }))
  }
  
  @objc func delete(path: String, data: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    api.delete(path, data: data, callback: ApiCallback(success: { result in
        resolve(result.rawValue)
      },
      error: { (error) in
        let errorMsg = "Error resolving \(path) with \(data)"
        let err: NSError = NSError(domain: errorMsg, code: 0, userInfo: nil)
        reject("delete_error", errorMsg, err)
    }))
  }
}
