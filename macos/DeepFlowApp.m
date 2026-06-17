#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#import <stdio.h>

@interface AppDelegate : NSObject <NSApplicationDelegate, WKNavigationDelegate>
@property(nonatomic, strong) NSWindow *window;
@property(nonatomic, strong) WKWebView *webView;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
  fprintf(stderr, "DeepFlow: applicationDidFinishLaunching\n");
  WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
  configuration.websiteDataStore = [WKWebsiteDataStore defaultDataStore];
  configuration.preferences.javaScriptCanOpenWindowsAutomatically = YES;

  self.webView = [[WKWebView alloc] initWithFrame:NSZeroRect configuration:configuration];
  self.webView.navigationDelegate = self;

  NSRect frame = NSMakeRect(0, 0, 1180, 820);
  self.window = [[NSWindow alloc]
      initWithContentRect:frame
                styleMask:(NSWindowStyleMaskTitled | NSWindowStyleMaskClosable |
                           NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable)
                  backing:NSBackingStoreBuffered
                    defer:NO];
  self.window.title = @"DeepFlow";
  self.window.minSize = NSMakeSize(900, 640);
  self.window.contentView = self.webView;
  [self.window center];
  [self.window makeKeyAndOrderFront:nil];

  [NSApp activateIgnoringOtherApps:YES];
  [self loadDeepFlow];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
  return YES;
}

- (void)loadDeepFlow {
  fprintf(stderr, "DeepFlow: loadDeepFlow\n");
  NSURL *resourceURL = [[NSBundle mainBundle] resourceURL];
  if (!resourceURL) {
    [self showLoadError:@"无法读取应用资源目录。"];
    return;
  }

  NSURL *appDirectory = [resourceURL URLByAppendingPathComponent:@"DeepFlowWeb" isDirectory:YES];
  NSURL *indexURL = [appDirectory URLByAppendingPathComponent:@"index.html"];

  if ([[NSFileManager defaultManager] fileExistsAtPath:indexURL.path]) {
    fprintf(stderr, "DeepFlow: loading %s\n", indexURL.path.UTF8String);
    [self.webView loadFileURL:indexURL allowingReadAccessToURL:appDirectory];
  } else {
    [self showLoadError:@"没有找到 DeepFlow 入口文件。"];
  }
}

- (void)showLoadError:(NSString *)message {
  NSString *html = [NSString stringWithFormat:
      @"<!doctype html><html lang=\"zh-CN\"><meta charset=\"utf-8\">"
       "<body style=\"font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:40px;\">"
       "<h1>DeepFlow 暂时无法打开</h1><p>%@</p></body></html>",
      message];
  [self.webView loadHTMLString:html baseURL:nil];
}

@end

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    fprintf(stderr, "DeepFlow: main\n");
    NSApplication *app = [NSApplication sharedApplication];
    AppDelegate *delegate = [[AppDelegate alloc] init];
    app.delegate = delegate;
    [app setActivationPolicy:NSApplicationActivationPolicyRegular];
    [app run];
  }
  return 0;
}
