#import "RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(MagnetScannerReact, NSObject);

RCT_EXTERN_METHOD(
                  start:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(
                  stop:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
