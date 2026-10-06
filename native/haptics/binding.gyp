{
  "targets": [
    {
      "target_name": "haptics",
      "conditions": [
        [
          "OS=='mac'",
          {
            "sources": ["haptics.mm"],
            "xcode_settings": {
              "OTHER_CFLAGS": ["-ObjC++"],
              "MACOSX_DEPLOYMENT_TARGET": "10.11"
            },
            "link_settings": {
              "libraries": ["-framework AppKit"]
            }
          }
        ]
      ]
    }
  ]
}
