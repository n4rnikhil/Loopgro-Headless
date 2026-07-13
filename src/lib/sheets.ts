import { cache } from 'react';

export interface BlogPost {
  title: string;
  author: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

// Fallback Mock Blog Posts
export const fallbackBlogs: BlogPost[] = [
  {
    title: "How to Choose the Perfect Snowboard Flex",
    author: "Hannah Ridge",
    date: "July 10, 2026",
    excerpt: "Understand the differences between soft, medium, and stiff flex, and which one fits your riding style best.",
    content: "Selecting the right snowboard flex can make or break your mountain experience. Beginner riders and park enthusiasts typically favor a softer flex because it is forgiving, easy to maneuver, and great for rails and butters. On the other end of the spectrum, freeriders and high-speed carvers require a stiff flex. Stiff boards provide superior edge hold, stability at speed, and instant response when charging down steep lines. In this guide, we break down each flex rating so you can confidently pick your next board.",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800",
  },
  {
    title: "Essential Snowboard Tuning & Waxing Tips",
    author: "Marcus Carver",
    date: "July 08, 2026",
    excerpt: "Keep your board fast and responsive with our step-by-step home maintenance guide.",
    content: "Waxing your snowboard is not just about speed; it also protects your base from drying out and extends the lifespan of your board. We recommend hot-waxing your snowboard every 3 to 4 days of riding. First, scrape off any old wax and clean the base. Apply a premium temperature-specific wax with a tuning iron, let it cool completely, scrape it thin, and buff it smooth. Additionally, maintaining sharp edges will give you the grip needed to hold carves on icy morning runs.",
    image: "https://images.unsplash.com/photo-1482867996988-2faec3cbb4f9?w=800",
  },
  {
    title: "Top 5 Winter Destinations for 2026/2027",
    author: "Chloe Powder",
    date: "June 25, 2026",
    excerpt: "From the deep powder of Japan to the steep peaks of the Swiss Alps, here are our top picks.",
    content: "If you're already dreaming of winter powder, it's time to start planning your next escape. This season, Niseko in Japan remains unmatched for consistent, deep powder snow. For stunning alpine views and vast interconnected ski areas, Zermatt in Switzerland offers an unforgettable European experience. Meanwhile, Whistler Blackcomb in Canada provides incredible terrain variety for all skill levels. Explore our complete guide to booking the best lodges and lift tickets.",
    image: "https://images.unsplash.com/photo-1482867996988-2faec3cbb4f9?w=800",
  }
];

// Fallback Mock FAQs
export const fallbackFAQs: FAQItem[] = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return window on all unused snowboards and gear. Items must be returned in their original packaging with all tags attached. Return shipping fees are covered by the buyer unless the item arrived damaged.",
    category: "Shipping & Returns"
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is processed and shipped from our warehouse, you will receive a shipping confirmation email containing a carrier tracking link. You can also view your order status directly inside your customer portal.",
    category: "Orders"
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 50 countries worldwide. International shipping rates, duties, and taxes will be computed automatically at checkout based on your destination address.",
    category: "Shipping & Returns"
  },
  {
    question: "Which size snowboard should I get?",
    answer: "Snowboard size depends primarily on your weight, boot size, and riding style rather than just height. Heavier riders and high-speed carvers should opt for longer boards, while lighter riders and park freestylers should choose shorter boards. Check our size chart on the product pages for specific weight ranges.",
    category: "Products"
  }
];

export function parseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let entry = "";

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        entry += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(entry.trim());
      entry = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(entry.trim());
      result.push(row);
      row = [];
      entry = "";
    } else {
      entry += char;
    }
  }
  if (row.length > 0 || entry !== "") {
    row.push(entry.trim());
    result.push(row);
  }
  return result;
}

/**
 * Fetch and parse blogs from a public Google Sheet CSV export.
 * Fallbacks to mock data if the environment variable is not defined or the fetch fails.
 */
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const sheetId = process.env.NEXT_PUBLIC_BLOGS_SHEET_ID;
  if (!sheetId) {
    console.warn("NEXT_PUBLIC_BLOGS_SHEET_ID is missing. Using fallback blog data.");
    return fallbackBlogs;
  }

  const url = sheetId.startsWith("https://")
    ? sheetId
    : `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Network response was not ok");
    const text = await response.text();
    const rows = parseCSV(text);

    // Skip header row and map rows to BlogPost
    if (rows.length <= 1) return fallbackBlogs;

    return rows.slice(1).map((row) => ({
      title: row[0] || "Untitled Post",
      author: row[1] || "Anonymous",
      date: row[2] || "Recently",
      excerpt: row[3] || "",
      content: row[4] || "",
      image: row[5] || "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800",
    }));
  } catch (error) {
    console.error("Failed to fetch blog posts from Google Sheets, using fallbacks:", error);
    return fallbackBlogs;
  }
});

/**
 * Fetch and parse FAQs from a public Google Sheet CSV export.
 * Fallbacks to mock data if the environment variable is not defined or the fetch fails.
 */
export const getFAQs = cache(async (): Promise<FAQItem[]> => {
  const sheetId = process.env.NEXT_PUBLIC_FAQS_SHEET_ID;
  if (!sheetId) {
    console.warn("NEXT_PUBLIC_FAQS_SHEET_ID is missing. Using fallback FAQ data.");
    return fallbackFAQs;
  }

  const url = sheetId.startsWith("https://")
    ? sheetId
    : `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Network response was not ok");
    const text = await response.text();
    const rows = parseCSV(text);

    // Skip header row and map rows to FAQItem
    if (rows.length <= 1) return fallbackFAQs;

    return rows.slice(1).map((row) => ({
      question: row[0] || "FAQ Question",
      answer: row[1] || "",
      category: row[2] || "General",
    }));
  } catch (error) {
    console.error("Failed to fetch FAQs from Google Sheets, using fallbacks:", error);
    return fallbackFAQs;
  }
});
