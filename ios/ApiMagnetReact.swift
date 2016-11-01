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
  
  @objc func get(path: String,
                 resolver resolve: RCTPromiseResolveBlock,
                 rejecter reject: RCTPromiseRejectBlock) {
    
    api.get(path, callback: ApiCallback(success: { (result) in
        resolve(result)
      }, error: { (error) in
        let err = NSError(coder: NSCoder())
        reject("get_error", "Error resolving \(path)", err)
    }))
  }
  
  @objc func post(path: String,
                  data: AnyObject,
                  resolver resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) {
    
    api.post(path, data: data, callback: ApiCallback(success: { (result) in
      resolve(result)
      }, error: { (error) in
        let err = NSError(coder: NSCoder())
        reject("get_error", "Error resolving \(path) with \(data)", err)
    }))
  }
  
  @objc func put(path: String,
                 data: AnyObject,
                 resolver resolve: RCTPromiseResolveBlock,
                 rejecter reject: RCTPromiseRejectBlock) {
    
    api.put(path, data: data, callback: ApiCallback(success: { (result) in
      resolve(result)
      }, error: { (error) in
        let err = NSError(coder: NSCoder())
        reject("get_error", "Error resolving \(path) with \(data)", err)
    }))
  }
  
  @objc func delete(path: String,
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) {
    
    api.delete(path, callback: ApiCallback(success: { (result) in
      resolve(result)
      }, error: { (error) in
        let err = NSError(coder: NSCoder())
        reject("get_error", "Error resolving \(path)", err)
    }))
  }
}
