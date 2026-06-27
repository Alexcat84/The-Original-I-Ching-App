export {};

declare global {
  interface Window {
    __RN_APP_INFO?: {
      version: string;
      androidVersionCode: number | null;
      iosBuildNumber?: number | null;
      platform?: "ios" | "android";
    };
    ReactNativeWebView?: { postMessage(s: string): void };
    __rnBridgeInstalled?: boolean;
  }
}
