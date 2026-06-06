export interface HugoConfig {
  title: string;
  subtitle: string;
  languageCode: string;
  defaultContentLanguage: string;
  theme: string;
  author: {
    name: string;
    bio: string;
    avatar: string;
  };
  params: {
    zenQuote: string;
    enableComments: boolean;
    enableSearch: boolean;
    footerText: string;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  date: string;
  categories: string[];
  tags: string[];
  language: 'zh' | 'en';
  readTime: string;
  author: string;
}

export interface Comment {
  id: string;
  postSlug: string;
  author: string;
  content: string;
  date: string;
  avatarColor: string;
}

export type ViewState = 'preview' | 'admin' | 'config' | 'readme';
