//
//  REAJsiModule.cpp
//  RNReanimated
//
//  Created by Christian Falch on 24/04/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//


#include "REAJsiModule.h"
#import <React/RCTBridge+Private.h>
#import "REAModule.h"
#import "REAJsiUtilities.h"

REAJsiModule::REAJsiModule(REAModule* reaModule)
: reamodule_(reaModule) {}

void REAJsiModule::install(REAModule *reaModule) {
    RCTCxxBridge *cxxBridge = (RCTCxxBridge *)reaModule.bridge;
    if (cxxBridge.runtime == nullptr) {
        return;
    }
    
    jsi::Runtime &runtime = *(jsi::Runtime *)cxxBridge.runtime;
    auto reaModuleName = "Reanimated";
    
    auto reaJsiModule = std::make_shared<REAJsiModule>(std::move(reaModule));
    auto object = jsi::Object::createFromHostObject(runtime, reaJsiModule);
    runtime.global().setProperty(runtime, reaModuleName, std::move(object));
}

jsi::Value REAJsiModule::get(jsi::Runtime &runtime, const jsi::PropNameID &name) {
    auto methodName = name.utf8(runtime);
    if (methodName == "createNode") {
        REAModule* reamodule = reamodule_;
        return jsi::Function::createFromHostFunction(runtime, name, 2, [reamodule](
                                                                            jsi::Runtime &runtime,
                                                                               const jsi::Value &thisValue,
                                                                               const jsi::Value *arguments,
                                                                               size_t count) -> jsi::Value {
            auto arg1 = &arguments[0];
            auto arg2 = &arguments[1];
            auto config = convertJSIObjectToNSDictionary(runtime, arg2->asObject(runtime));
            [reamodule createNode:[NSNumber numberWithDouble:arg1->asNumber()] config:(NSDictionary<NSString *, id>*)config];
            return jsi::Value::undefined();
        });
    }
    if (methodName == "connectNodes") {
        REAModule* reamodule = reamodule_;
        return jsi::Function::createFromHostFunction(runtime, name, 2, [reamodule](
                                                                                   jsi::Runtime &runtime,
                                                                                   const jsi::Value &thisValue,
                                                                                   const jsi::Value *arguments,
                                                                                   size_t count) -> jsi::Value {
            auto arg1 = &arguments[0];
            auto arg2 = &arguments[1];
            [reamodule connectNodes:[NSNumber numberWithDouble:(int)arg1->asNumber()] childTag:[NSNumber numberWithDouble:(int)arg2->asNumber()]];
            
            return jsi::Value::undefined();
        });
    }
    
    
    return jsi::Value::undefined();
}

