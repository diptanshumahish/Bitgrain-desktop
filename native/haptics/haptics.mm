#include <node_api.h>
#import <AppKit/AppKit.h>

// Maps the JS pattern id to an NSHapticFeedbackPattern and performs it on the
// Force Touch trackpad. No-ops on hardware without an actuator (feature-detected
// by the OS). Patterns: 0 generic, 1 alignment (snap), 2 level change (step).
static napi_value Perform(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value args[1];
  napi_get_cb_info(env, info, &argc, args, NULL, NULL);

  int32_t pattern = 0;
  if (argc >= 1) {
    napi_get_value_int32(env, args[0], &pattern);
  }

  NSHapticFeedbackPattern resolved = NSHapticFeedbackPatternGeneric;
  if (pattern == 1) {
    resolved = NSHapticFeedbackPatternAlignment;
  } else if (pattern == 2) {
    resolved = NSHapticFeedbackPatternLevelChange;
  }

  id<NSHapticFeedbackPerformer> performer =
      [NSHapticFeedbackManager defaultPerformer];
  [performer performFeedbackPattern:resolved
                    performanceTime:NSHapticFeedbackPerformanceTimeNow];

  return NULL;
}

static napi_value Init(napi_env env, napi_value exports) {
  napi_value perform;
  napi_create_function(env, "perform", NAPI_AUTO_LENGTH, Perform, NULL, &perform);
  napi_set_named_property(env, exports, "perform", perform);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
