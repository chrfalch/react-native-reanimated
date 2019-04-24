//
//  REAJsiModule.hpp
//  RNReanimated
//
//  Created by Christian Falch on 24/04/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//
#import <jsi/jsi.h>

using namespace facebook;

@class REAModule;

class JSI_EXPORT REAJsiModule : public jsi::HostObject {
public:
    REAJsiModule(REAModule* reaModule);
    
    static void install(REAModule *reaModule);
    
    /*
     * `jsi::HostObject` specific overloads.
     */
    jsi::Value get(jsi::Runtime &runtime, const jsi::PropNameID &name) override;
    
private:
    REAModule* reamodule_;
};
