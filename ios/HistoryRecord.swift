//
//  HistoryRecord.swift
//  magnet
//
//  History struct to hold data for a record.
//
//  Created by Francisco Jordano on 18/07/2016.
//

import Foundation

struct HistoryRecord {
  var id: Int64
  var url: String
  var lastSeen: Int64
  var firstSeen: Int64
}