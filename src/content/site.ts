/** Teks header desktop (Figma 06, instance "Header" di frame BROWSER 1440, mis. node 56:8716). */
export const siteNav = {
  logoMark: "A→Ω",
  brand: "ATO",
  links: [
    { id: "lite", label: "Lite", href: "/lite" },
    { id: "soul", label: "Soul", href: "/soul" },
    { id: "tentang", label: "Tentang", href: "/tentang" },
  ],
  cta: {
    lite: { label: "Mulai A20 Lite", href: "/lite" },
    soul: { label: "Mulai A20 Soul", href: "/soul" },
  },
} as const;

export type NavId = (typeof siteNav.links)[number]["id"];
