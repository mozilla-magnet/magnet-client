//
//  RNMagnetWebView.m
//  IosCustomComponents
//
//  Created by Wilson Page on 05/05/2016.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "RCTViewManager.h"

@interface RCT_EXTERN_MODULE(MagnetWebViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(source, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(onMagnetWebViewLoaded, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)

@end
