//
//  REAJsiUtilities.cpp
//  RNReanimated
//
//  Created by Christian Falch on 25/04/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#include "REAJsiUtilities.h"

NSString *convertJSIStringToNSString(jsi::Runtime &runtime, const jsi::String &value) {
    return [NSString stringWithUTF8String:value.utf8(runtime).c_str()];
}

NSDictionary *convertJSIObjectToNSDictionary(jsi::Runtime &runtime, const jsi::Object &value) {
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

NSArray *convertJSIArrayToNSArray(jsi::Runtime &runtime, const jsi::Array &value) {
    size_t size = value.size(runtime);
    NSMutableArray *result = [NSMutableArray new];
    for (size_t i = 0; i < size; i++) {
        [result addObject:convertJSIValueToObjCObject(runtime, value.getValueAtIndex(runtime, i)) ?: (id)kCFNull];
    }
    return [result copy];
}

id convertJSIValueToObjCObject(jsi::Runtime &runtime, const jsi::Value &value) {
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

