import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // url: placeholder đến khi gắn domain thật ở Phase 4
    url: "https://blog.pages.dev/",
    title: "Tech Blog",
    description: "Ghi chép kỹ thuật và kinh nghiệm thực chiến.",
    author: "Author",
    profile: "",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Asia/Ho_Chi_Minh",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    // placeholder — điền link thật khi chốt branding
    { name: "github", url: "https://github.com/username" },
    { name: "mail",   url: "mailto:you@example.com" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});