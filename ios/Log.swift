//
//  Log.swift
//  Magnet
//
//  Created by Francisco Jordano on 08/11/2016.
//  Copyright © 2016 Mozilla. All rights reserved.
//

import Foundation

@objc(Log) class Log: NSObject {
  
  @objc static func l(message: String, filename: String = #file, line: Int = #line, funcname: String = #function) {
    #if DEBUG
      let file = ("\(filename)" as NSString).lastPathComponent as String
      Bugfender.logLineNumber(line, method: funcname, file: file, level: BFLogLevel.Default, tag: nil, message: message)
    #endif
  }
  
  @objc static func log(message: String) {
    #if DEBUG
      Log.l(message)
    #endif
  }
    
  @objc static func w(message: String, filename: String = #file, line: Int = #line, funcname: String = #function) {
    #if DEBUG
      let file = ("\(filename)" as NSString).lastPathComponent as String
      Bugfender.logLineNumber(line, method: funcname, file: file, level: BFLogLevel.Warning, tag: nil, message: message)
    #endif
  }
  
}
