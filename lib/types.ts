export type NewsItem = {
  title: string;
  url: string;
  summary: string;
  details: string;
  source_meta?: string;
};

export type NewsSection = {
  name: string;
  items: NewsItem[];
};

export type NewsPayload = {
  fetched_at: string;
  category: string;
  tldr: string[];
  sections: NewsSection[];
};
