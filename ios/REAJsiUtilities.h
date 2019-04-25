
#import <Foundation/Foundation.h>
#import <jsi/jsi.h>

using namespace facebook;

NSDictionary *convertJSIObjectToNSDictionary(jsi::Runtime &runtime, const jsi::Object &value);
id convertJSIValueToObjCObject(jsi::Runtime &runtime, const jsi::Value &value);
NSString *convertJSIStringToNSString(jsi::Runtime &runtime, const jsi::String &value);
NSArray *convertJSIArrayToNSArray(jsi::Runtime &runtime, const jsi::Array &value);
id convertJSIValueToObjCObject(jsi::Runtime &runtime, const jsi::Value &value);
