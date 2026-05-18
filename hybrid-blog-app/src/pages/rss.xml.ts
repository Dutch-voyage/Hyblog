import rss from "@astrojs/rss";
import { getEntryHref, getPublishedEntries } from "@/lib/content";
import siteConfig from "@/lib/site";

export async function GET(context: { site: URL }) {
  const entries = await getPublishedEntries();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: getEntryHref(entry),
    })),
  });
}
