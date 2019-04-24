#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerObserverCoordinator.h>
#import <React/RCTUIManagerUtils.h>

#import "REAValueNode.h"

@interface REAModule : RCTEventEmitter <RCTBridgeModule, RCTEventDispatcherObserver, RCTUIManagerObserver>
-(void) createNode:(nonnull NSNumber *)nodeID config:(NSDictionary<NSString *, id> *_Nullable)config;
-(void) connectNodes:(nonnull NSNumber *)parentID childTag:(nonnull NSNumber *)childID;
@end
