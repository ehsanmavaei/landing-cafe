export type StoryStep = {
  text: string;
  startProgress: number;
  endProgress: number;
};

export type MenuItem = {
  name: string;
  description: string;
  price: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export type GalleryImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type OpeningHours = {
  label: string;
  hours: string;
};

/** How hero frames are drawn for a frame set */
export type FrameFit = "cover" | "contain" | "contain-blur";

export type CafeConfig = {
  name: string;
  tagline: string;
  colors: {
    bg: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  frames: {
    extension: string;
    /** Pinned hero scroll distance in viewport heights (e.g. 2.5 = 250vh) */
    scrollLengthVh: {
      desktop: number;
      mobile: number;
    };
    scrub: number | boolean;
    mobile: {
      folder: string;
      frameCount: number;
      /** width / height (e.g. 9/16 portrait) */
      aspectRatio: number;
      fit: FrameFit;
      /** Scales the frame around its center on top of fit (0.8–2.0) */
      zoom: number;
      /** Horizontal focal point on the frame (0–1) */
      focusX: number;
      /** Vertical focal point on the frame (0–1) */
      focusY: number;
      /** Vertical shift as a fraction of viewport height (e.g. 0.05 = 5% down) */
      offsetY: number;
    };
    desktop: {
      folder: string;
      frameCount: number;
      /** width / height (e.g. 16/9 landscape) */
      aspectRatio: number;
      fit: FrameFit;
      zoom: number;
      focusX: number;
      focusY: number;
      offsetY: number;
    };
  };
  storySteps: StoryStep[];
  menu: MenuCategory[];
  about: string;
  openingHours: OpeningHours[];
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  whatsapp: string;
  instagram: string;
  googleMapsEmbedUrl: string;
  gallery: GalleryImage[];
  seo: {
    title: string;
    description: string;
    ogImage: string;
    siteUrl: string;
  };
};

export const cafeConfig: CafeConfig = {
  name: "Dope",
  tagline: "Freshly roasted. Slowly poured.",
  colors: {
    bg: "#2b1a12",
    text: "#f5ede3",
    accent: "#c8873a",
  },
  fonts: {
    heading: "Playfair Display",
    body: "Inter",
  },
  frames: {
    extension: "webp",
    scrollLengthVh: {
      desktop: 2.5,
      mobile: 2,
    },
    scrub: 0.1,
    mobile: {
      folder: "/frames-mobile",
      frameCount: 240,
      aspectRatio: 9 / 16,
      fit: "contain-blur",
      zoom: 2.4,
      focusX: 0.5,
      focusY: 0.5,
      offsetY: 0,
    },
    desktop: {
      folder: "/frames-desktop",
      frameCount: 240,
      aspectRatio: 16 / 9,
      fit: "cover",
      zoom: 1,
      focusX: 0.5,
      focusY: 0.5,
      offsetY: 0,
    },
  },
  storySteps: [
    { text: "Fresh beans", startProgress: 0.04, endProgress: 0.3 },
    { text: "Roasted with care", startProgress: 0.33, endProgress: 0.63 },
    { text: "Your cup is ready", startProgress: 0.67, endProgress: 0.95 },
  ],
  menu: [
    {
      id: "espresso",
      name: "Espresso",
      items: [
        {
          name: "Single Origin Espresso",
          description: "Rotating microlot, double shot",
          price: 3.5,
        },
        {
          name: "Cortado",
          description: "Espresso with silky steamed milk",
          price: 4.25,
        },
        {
          name: "Flat White",
          description: "Ristretto, microfoam, 6 oz",
          price: 4.75,
        },
        {
          name: "Cappuccino",
          description: "Classic foam cap, fair-trade cocoa dust",
          price: 4.5,
        },
      ],
    },
    {
      id: "cold",
      name: "Cold Drinks",
      items: [
        {
          name: "Cold Brew",
          description: "18-hour steep, served over ice",
          price: 5.0,
        },
        {
          name: "Iced Latte",
          description: "Double shot, oat or dairy milk",
          price: 5.25,
        },
        {
          name: "Espresso Tonic",
          description: "Bright tonic, orange peel, ice",
          price: 5.5,
        },
        {
          name: "Vanilla Affogato",
          description: "House gelato drowned in espresso",
          price: 6.0,
        },
      ],
    },
    {
      id: "pastries",
      name: "Pastries",
      items: [
        {
          name: "Almond Croissant",
          description: "Flaky layers, frangipane fill",
          price: 4.75,
        },
        {
          name: "Morning Bun",
          description: "Orange zest, cinnamon sugar",
          price: 4.25,
        },
        {
          name: "Banana Bread",
          description: "Walnut top, baked daily",
          price: 3.75,
        },
        {
          name: "Seasonal Tart",
          description: "Ask about today’s fruit filling",
          price: 5.5,
        },
      ],
    },
  ],
  about:
    "Dope is a small neighborhood roastery tucked on a leafy side street, where green beans arrive weekly and leave as something worth savoring. We roast in small batches on a vintage drum roaster, cup every lot, and serve only what we’d drink ourselves. Pull up a chair, breathe in the crema, and stay awhile.",
  openingHours: [{ label: "Monday – Sunday", hours: "8:00 – 22:00" }],
  address: {
    street: "42 Orchard Lane",
    city: "Brookfield",
    region: "CA",
    postalCode: "94107",
    country: "US",
  },
  phone: "+1 (415) 555-0198",
  whatsapp: "+14155550198",
  instagram: "https://instagram.com/dopecafe",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019234567890!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjYiTiAxMjLCsDI1JzA5LjgiVw!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus",
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
      alt: "Barista pouring latte art into a ceramic cup",
      width: 800,
      height: 1000,
    },
    {
      src: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
      alt: "Warm cafe interior with wooden tables and pendant lights",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80",
      alt: "Freshly roasted coffee beans in a burlap sack",
      width: 800,
      height: 800,
    },
    {
      src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
      alt: "Pastries displayed in a glass case at the counter",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
      alt: "Pour-over coffee brewing setup on a marble bar",
      width: 800,
      height: 1000,
    },
    {
      src: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80",
      alt: "Friends sharing coffee at a sunlit table",
      width: 800,
      height: 600,
    },
  ],
  seo: {
    title: "Dope | Freshly Roasted Coffee in Brookfield",
    description:
      "Dope — neighborhood roastery and café serving small-batch espresso, cold brew, and pastries. Open daily 8am–10pm on Orchard Lane.",
    ogImage: "/og.jpg",
    siteUrl: "https://dope.vercel.app",
  },
};
