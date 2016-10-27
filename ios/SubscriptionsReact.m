#import "RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(SubscriptionsReact, NSObject);

RCT_EXTERN_METHOD(
                  add:(NSString *)channelName
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(
                  remove:(NSString *)channelName
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(
                  update:(NSString *)channelName
                  updates:(NSDictionary *)updates
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(
                  get:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
