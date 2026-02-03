
// ใส่ LIFF ID ที่ได้จาก LINE Developers Console ที่นี่
const LIFF_ID: string = "2009043128-Ij3WfriJ"; 

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export const lineService = {
  /**
   * Initialize LIFF SDK
   */
  init: async (): Promise<boolean> => {
    // ป้องกัน Error หากยังไม่ได้ใส่ LIFF ID
    if (LIFF_ID === "YOUR_LIFF_ID" || !LIFF_ID) {
      console.warn("LIFF ID is not configured in services/lineService.ts. LINE integration is disabled.");
      return false;
    }

    try {
      // @ts-ignore
      if (window.liff) {
         // @ts-ignore
        await window.liff.init({ liffId: LIFF_ID });
        // @ts-ignore
        return window.liff.isLoggedIn();
      }
      return false;
    } catch (error) {
      console.error("LIFF Init Error:", error);
      return false;
    }
  },

  /**
   * Get User Profile from LINE
   */
  getProfile: async (): Promise<LineProfile | null> => {
    try {
      // @ts-ignore
      if (window.liff && window.liff.isLoggedIn()) {
        // @ts-ignore
        const profile = await window.liff.getProfile();
        return profile as LineProfile;
      }
      return null;
    } catch (error) {
      console.error("Get Profile Error:", error);
      return null;
    }
  },

  /**
   * Perform Login
   * Returns true if redirecting, false if skipped/mocking
   */
  login: (): boolean => {
    if (LIFF_ID === "YOUR_LIFF_ID" || !LIFF_ID) return false;

    // ตรวจสอบว่ารันอยู่ใน Iframe หรือไม่ (เช่น ในหน้า Preview ของ Editor)
    // LINE Login ไม่อนุญาตให้ Redirect ใน Iframe (X-Frame-Options: DENY)
    try {
        if (window.self !== window.top) {
            console.warn("LINE Login skipped: Cannot run inside an iframe (Preview Mode). Proceeding with mock login.");
            return false; 
        }
    } catch (e) {
        // หาก Access window.top ไม่ได้ (ติด CORS) ให้ถือว่าเป็น Iframe เช่นกัน
        return false;
    }

    // @ts-ignore
    if (window.liff && !window.liff.isLoggedIn()) {
      // @ts-ignore
      window.liff.login();
      return true; // Redirecting
    }
    return false; // Already logged in or something else
  },

  /**
   * Send message (Requires sharing permission) or open external link
   */
  openLink: (url: string) => {
    // @ts-ignore
    if (window.liff && window.liff.isInClient()) {
      // @ts-ignore
      window.liff.openWindow({ url, external: true });
    } else {
      window.open(url, '_blank');
    }
  }
};
