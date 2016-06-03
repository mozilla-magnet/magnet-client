//
//  RNMagnetWebView.swift
//  IosCustomComponents
//
//  Created by Wilson Page on 05/05/2016.
//  Copyright © 2016 Facebook. All rights reserved.
//

import Foundation

class MagnetWebView : UIWebView, UIWebViewDelegate {
  @objc var onMagnetWebViewLoaded: RCTDirectEventBlock?
  
  @objc var source: [String: String]? {
    didSet {
      print("source did set \(source)")
      guard source != nil else { return }
      if let html = source!["html"] {
        loadHtml(html, baseUrl: source!["baseUrl"])
      } else if let uri = source!["uri"] {
        loadUri(uri)
      }
    }
  }

  @objc var scrollEnabled: Bool = false {
    didSet {
      setScrollable(scrollEnabled)
    }
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    setScrollable(scrollEnabled)
    self.delegate = self
  }

  func setScrollable(value: Bool) {
    scrollView.scrollEnabled = value
  }
  
  func loadUri(uri: String) {
    print("load uri: \(uri)")
    guard let url = NSURL(string: uri) else { return }
    let request = NSURLRequest(URL: url)
    guard request.URL != self.request?.URL else { return }
    loadRequest(NSURLRequest(URL: url))
  }
  
  func loadHtml(html: String, baseUrl: String?) {
    print("load html: \(html) \(baseUrl)")
    let url = NSURL(string: baseUrl ?? "about:blank");
    loadHTMLString(html, baseURL: url)
  }
  
  func webViewDidFinishLoad(webview: UIWebView) {
    guard !webview.loading else { return }
    let contentHeight = scrollView.contentSize.height
    onMagnetWebViewLoaded?(["height": contentHeight])
    print("webview loaded")
  }
  
  required init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  func webView(webView: UIWebView, shouldStartLoadWithRequest request: NSURLRequest, navigationType: UIWebViewNavigationType) -> Bool {
    if navigationType == UIWebViewNavigationType.LinkClicked {
      UIApplication.sharedApplication().openURL(request.URL!)
      return false
    }
    return true
  }
}
