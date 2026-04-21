export interface Podcast {
  id: number;
  title: string;
  author: string;
  image: string;
  description: string;
  url: string;
  categories: string[];
  lastEpisodeDate: number;
  language: string;
  link?: string;
  isPrivate?: boolean;
  feedUrl?: string;
}

export interface Episode {
  id: number;
  title: string;
  description: string;
  datePublished: number;
  duration: number;
  enclosureUrl: string;
  enclosureType: string;
  image: string;
  feedId: number;
  feedTitle: string;
  feedAuthor: string;
  feedImage: string;
}
