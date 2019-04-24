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

static NSDictionary *convertJSIObjectToNSDictionary(jsi::Runtime &runtime, const jsi::Object &value);

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
            [reamodule connectNodes:[NSNumber numberWithDouble:arg1->asNumber()] childTag:[NSNumber numberWithDouble:arg2->asNumber()]];
            
            return jsi::Value::undefined();
        });
    }
    
    
    return jsi::Value::undefined();
}

static NSString *convertJSIStringToNSString(jsi::Runtime &runtime, const jsi::String &value) {
    return [NSString stringWithUTF8String:value.utf8(runtime).c_str()];
}

static id convertJSIValueToObjCObject(jsi::Runtime &runtime, const jsi::Value &value);

static NSDictionary *convertJSIObjectToNSDictionary(jsi::Runtime &runtime, const jsi::Object &value) {
    jsi::Array propertyNames = value.getPropertyNames(runtime);
    size_t size = propertyNames.size(runtime);
    NSMutableDictionary *result = [NSMutableDictionary new];
    for (size_t i = 0; i < size; i++) {
        jsi::String name = propertyNames.getValueAtIndex(runtime, i).getString(runtime);
        NSString *k = convertJSIStringToNSString(runtime, name);
        id v = convertJSIValueToObjCObject(runtime, value.getProperty(runtime, name)) ?: (id)kCFNull;
        result[k] = v;
    }
    return [result copy];
}

static NSArray *convertJSIArrayToNSArray(jsi::Runtime &runtime, const jsi::Array &value) {
    size_t size = value.size(runtime);
    NSMutableArray *result = [NSMutableArray new];
    for (size_t i = 0; i < size; i++) {
        [result addObject:convertJSIValueToObjCObject(runtime, value.getValueAtIndex(runtime, i)) ?: (id)kCFNull];
    }
    return [result copy];
}

static id convertJSIValueToObjCObject(jsi::Runtime &runtime, const jsi::Value &value) {
    if (value.isUndefined() || value.isNull()) {
        return nil;
    }
    if (value.isBool()) {
        return @(value.getBool());
    }
    if (value.isNumber()) {
        return @(value.getNumber());
    }
    if (value.isString()) {
        return convertJSIStringToNSString(runtime, value.getString(runtime));
    }
    if (value.isObject()) {
        jsi::Object o = value.getObject(runtime);
        if (o.isArray(runtime)) {
            return convertJSIArrayToNSArray(runtime, o.getArray(runtime));
        }
        return convertJSIObjectToNSDictionary(runtime, o);
    }
    
    throw std::runtime_error("Unsupported jsi::jsi::Value kind");
}

