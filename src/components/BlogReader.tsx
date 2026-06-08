import React, { useState } from 'react';
import { Post, Comment, HugoConfig } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { Search, Globe, ChevronLeft, MessageSquare, Send, Calendar, Clock, Tag, Folder, Heart, Sparkles, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlogReaderProps {
  config: HugoConfig;
  posts: Post[];
  comments: Comment[];
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
  onAddComment: (comment: Comment) => void;
  onAdminClick: () => void;
  isLoggedIn: boolean;
}

export default function BlogReader({
  config,
  posts,
  comments,
  language,
  setLanguage,
  onAddComment,
  onAdminClick,
  isLoggedIn
}: BlogReaderProps) {
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Comment inputs
  const [authorName, setAuthorName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Get active translation dictionary for layout items
  const t = {
    zh: {
      searchPlaceholder: "在寂静中搜索文章...",
      allCategory: "全部文章",
      categoriesLabel: "分类",
      tagsLabel: "标签",
      authorSection: "一期一会",
      backToList: "返回博客目录",
      commentsTitle: "草木微澜 · 读书纪",
      commentPlaceholder: "汲水煮茶，亦可留白。在此留下您的感言...",
      namePlaceholder: "雅号 / 称呼",
      commentButton: "投递长笺",
      commentsCount: "条回音",
      readTimeLabel: "阅读时间",
      noPosts: "空山寂寂，未寻得相关文章。",
      footerNotice: "当前预览搭载了 Hugo-zen-minimalist 禅意主题。所有内容均可通过工作台进行实时控制与多语言生成。",
      metaWrittenBy: "作者",
      likeButton: "赞赏心照",
      likedText: "已心照",
      metaDate: "发布于"
    },
    en: {
      searchPlaceholder: "Search posts in quietness...",
      allCategory: "All Posts",
      categoriesLabel: "Categories",
      tagsLabel: "Tags",
      authorSection: "About the Writer",
      backToList: "Back to Blog Index",
      commentsTitle: "Echoes & Musings",
      commentPlaceholder: "Brewing tea, leaving gaps. Leave your comment here...",
      namePlaceholder: "Your Name / Title",
      commentButton: "Send Message",
      commentsCount: "Responses",
      readTimeLabel: "Read Time",
      noPosts: "Quiet mountains. No corresponding articles found.",
      footerNotice: "This preview runs under the Hugo-zen-minimalist theme. All contents are fully adjustable in real-time with dual-language support.",
      metaWrittenBy: "By",
      likeButton: "Appreciate",
      likedText: "Appreciated",
      metaDate: "Published on"
    }
  }[language];

  // Filtering posts by language
  const languagePosts = posts.filter(post => post.language === language);

  // Extract all categories & tags from the language-specific posts
  const categoriesSet = new Set<string>();
  const tagsSet = new Set<string>();
  languagePosts.forEach(post => {
    post.categories.forEach(c => categoriesSet.add(c));
    post.tags.forEach(t => tagsSet.add(t));
  });
  const availableCategories = Array.from(categoriesSet);
  const availableTags = Array.from(tagsSet);

  // Filter posts by selected category, tag, and search query
  const filteredPosts = languagePosts.filter(post => {
    const matchesCategory = selectedCategory ? post.categories.includes(selectedCategory) : true;
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    const matchesSearch = searchQuery
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesTag && matchesSearch;
  });

  const activePost = languagePosts.find(p => p.slug === selectedPostSlug);
  const activePostComments = comments.filter(c => c.postSlug === selectedPostSlug);

  const handlePostClick = (slug: string) => {
    setSelectedPostSlug(slug);
    // Scroll to reader top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentContent.trim() || !selectedPostSlug) return;

    const colors = [
      'bg-[#E6DFD3] text-[#7A6B56]',
      'bg-[#DDD8D0] text-[#695D4A]',
      'bg-[#EDE9E2] text-[#857662]',
      'bg-[#E0DACF] text-[#6D6151]'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newComment: Comment = {
      id: 'comment-' + Date.now(),
      postSlug: selectedPostSlug,
      author: authorName.trim(),
      content: commentContent.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      avatarColor: randomColor
    };

    onAddComment(newComment);
    setCommentContent('');
  };

  const toggleLike = (slug: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2C2A29] font-sans selection:bg-[#E8E3DD]">
      {/* Top Banner Theme Decorator */}
      <div className="h-1 bg-gradient-to-r from-[#D7CEBF] via-[#B8A994] to-[#8C7B65]" />

      {/* Grid container */}
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-16">
        
        {/* Navigation & Brand Header */}
        <header className="border-b border-[#EBE6E0] pb-8 mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-widest text-[#8C7F6E] uppercase font-mono">Hugo Zen Theme</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8A994]" />
              <span className="text-xs tracking-widest text-[#8C7F6E] uppercase font-mono">{config.theme}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight font-medium text-[#1A1918] cursor-pointer" onClick={() => { setSelectedPostSlug(null); clearFilters(); }}>
              {config.title}
            </h1>
            <p className="text-sm font-sans text-[#706B64] italic">
              {config.subtitle}
            </p>
          </div>

          {/* Quick Menu Toggles */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Box inside reader */}
            {config.params.enableSearch && !selectedPostSlug && (
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-64 bg-[#F2EDE5] text-xs px-3.5 py-1.5 pl-9 rounded-md border border-transparent focus:border-[#C4B7A5] focus:bg-[#FAF6F0] outline-none text-[#2C2A29] placeholder-[#8E877D]/70 transition-all font-sans"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8E877D]" />
              </div>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => {
                setLanguage(language === 'zh' ? 'en' : 'zh');
                setSelectedPostSlug(null);
                clearFilters();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEE7DC] hover:bg-[#E5DBCB] text-xs text-[#5F5547] rounded-md transition-all font-mono"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? 'EN / 英文' : 'ZH / 中文'}</span>
            </button>

            {/* Admin console trigger */}
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8C7B65] hover:bg-[#766753] text-[#FAF8F5] text-xs rounded-md font-sans transition-all cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>{isLoggedIn ? '后台控制台' : '管理员'}</span>
            </button>
          </div>
        </header>

        {/* Floating Zen Quote in high design simplicity */}
        {config.params.zenQuote && !selectedPostSlug && (
          <div className="mb-12 bg-[#FAF6F0] border-l-2 border-[#BEB09A] p-5 text-center italic text-[#6B6152] text-sm tracking-wide rounded-r-md">
            “ {config.params.zenQuote} ”
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Column */}
          <main className="lg:col-span-3 space-y-12">
            <AnimatePresence mode="wait">
              {activePost ? (
                /* 1. Article Reader Mode */
                <motion.article
                  key="reader"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Back Link */}
                  <button
                    onClick={() => setSelectedPostSlug(null)}
                    className="group flex items-center gap-1.5 text-xs text-[#8C7F6E] hover:text-[#4F4538] transition-all font-mono uppercase tracking-wider"
                  >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>{t.backToList}</span>
                  </button>

                  {/* Header metadata */}
                  <div className="space-y-4 border-b border-[#EBE6E0] pb-6">
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#1A1918]">
                      {activePost.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-[#8C7F6E]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t.metaDate} {activePost.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{activePost.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{t.metaWrittenBy}: {activePost.author || config.author.name}</span>
                      </div>
                    </div>

                    {/* Taxonomy displays under title */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {activePost.categories.map(cat => (
                        <span key={cat} className="flex items-center gap-1 text-[11px] font-sans px-2 py-0.5 bg-[#EFECE5] text-[#7A6E5C] rounded-sm">
                          <Folder className="w-3 h-3 text-[#B5A895]" />
                          <span>{cat}</span>
                        </span>
                      ))}
                      {activePost.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-[11px] font-sans px-2 py-0.5 border border-[#E3DEC9] text-[#8A7C68] rounded-sm bg-white/50">
                          <Tag className="w-3 h-3 text-[#BEB594]" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rich Markdown content */}
                  <div className="prose text-[#3D3A37] prose-stone max-w-none [line-height:1.8]">
                    {renderMarkdown(activePost.content)}
                  </div>

                  {/* Appreciation Section */}
                  <div className="flex justify-center py-8 border-y border-[#EDEBE5] my-12">
                    <button
                      onClick={() => toggleLike(activePost.slug)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm font-sans ${
                        likedPosts[activePost.slug]
                          ? 'bg-[#C27E74] text-white border-transparent shadow-sm'
                          : 'bg-[#F2ECE0] text-[#705F4B] border-[#DCD3C1] hover:bg-[#EAE1D0]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedPosts[activePost.slug] ? 'fill-white' : ''}`} />
                      <span>{likedPosts[activePost.slug] ? t.likedText : t.likeButton}</span>
                    </button>
                  </div>

                  {/* 2. Unified Comments Module */}
                  {config.params.enableComments && (
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between border-b border-[#EBE6E0] pb-3">
                        <h3 className="font-serif text-lg font-medium text-[#2C2A29] flex items-center gap-2">
                          <MessageSquare className="w-4.5 h-4.5 text-[#8C7F6E]" />
                          <span>{t.commentsTitle} ({activePostComments.length} {t.commentsCount})</span>
                        </h3>
                      </div>

                      {/* Display Comments */}
                      <div className="space-y-4">
                        {activePostComments.length === 0 ? (
                          <div className="text-center py-8 text-xs italic text-[#999288] bg-[#F7F4EE] border border-dashed border-[#E3DEC9] rounded-md">
                            心之所归，无言即是灵犀。期待您的第一卷长书。
                          </div>
                        ) : (
                          activePostComments.map((com, index) => (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              key={com.id}
                              className="bg-white/80 border border-[#ECE9DF] p-5 rounded-md shadow-xs space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${com.avatarColor}`}>
                                    {com.author.slice(0, 1).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-medium text-[#2C2A29]">{com.author}</span>
                                </div>
                                <span className="text-[11px] font-mono text-[#999184]">{com.date}</span>
                              </div>
                              <p className="text-sm text-[#524E4A] leading-relaxed pl-9 whitespace-pre-wrap">
                                {com.content}
                              </p>
                            </motion.div>
                          ))
                        )}
                      </div>

                      {/* Comment Input Box */}
                      <form onSubmit={handleCommentSubmit} className="bg-[#FAF8F5] border border-[#E9E4DB] p-5 rounded-md space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder={t.namePlaceholder}
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            required
                            className="w-full bg-white text-sm px-4 py-2 border border-[#E4DED3] rounded focus:ring-1 focus:ring-[#C4B7A5] focus:border-[#C4B7A5] outline-none text-[#2C2A29] placeholder-[#A39B8F] font-sans"
                          />
                        </div>
                        <textarea
                          placeholder={t.commentPlaceholder}
                          rows={3}
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          required
                          className="w-full bg-white text-sm px-4 py-2 border border-[#E4DED3] rounded focus:ring-1 focus:ring-[#C4B7A5] focus:border-[#C4B7A5] outline-none text-[#2C2A29] placeholder-[#A39B8F] font-sans resize-none"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#8C7B65] hover:bg-[#7D6D58] text-white text-xs font-sans rounded shadow-xs focus:outline-none transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{t.commentButton}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </motion.article>
              ) : (
                /* 2. Article Catalog Listing Mode */
                <motion.div
                  key="catalog"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  {/* Current Active Category / Tag Status */}
                  {(selectedCategory || selectedTag || searchQuery) && (
                    <div className="bg-[#F2ECE0] border border-[#E1D8C6] px-4 py-3 rounded-md flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#5C5141] font-sans">
                        <Sparkles className="w-3.5 h-3.5 text-[#BBA480]" />
                        <span>已筛选：</span>
                        {selectedCategory && (
                          <span className="font-semibold bg-white/70 px-2 py-0.5 rounded">{t.categoriesLabel}: {selectedCategory}</span>
                        )}
                        {selectedTag && (
                          <span className="font-semibold bg-white/70 px-2 py-0.5 rounded">{t.tagsLabel}: {selectedTag}</span>
                        )}
                        {searchQuery && (
                          <span className="font-semibold bg-white/70 px-2 py-0.5 rounded">检索: "{searchQuery}"</span>
                        )}
                      </div>
                      <button
                        onClick={clearFilters}
                        className="text-xs font-mono text-[#8C7B65] hover:text-[#4F4131] underline decoration-dotted transition-colors"
                      >
                        清除归档
                      </button>
                    </div>
                  )}

                  {/* Post Loop Items */}
                  <div className="divide-y divide-[#EBE6E0] space-y-10">
                    {filteredPosts.length === 0 ? (
                      <div className="text-center py-20">
                        <p className="text-sm font-sans text-[#8C7F6E] italic mb-2">
                          {t.noPosts}
                        </p>
                        <button
                          onClick={clearFilters}
                          className="text-xs font-mono text-[#897355] underline"
                        >
                          显示全部
                        </button>
                      </div>
                    ) : (
                      filteredPosts.map((post, index) => (
                        <motion.article
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          key={post.id}
                          className={`pt-10 first:pt-0 group`}
                        >
                          <div className="space-y-4">
                            {/* Date + categories */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-mono text-[#8C7F6E]">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{post.date}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{post.readTime}</span>
                              </span>
                              {post.categories.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#8C7F6E] flex items-center gap-0.5 cursor-pointer hover:text-[#524430]" onClick={() => setSelectedCategory(post.categories[0])}>
                                    <Folder className="w-3 h-3 text-[#B0A594]" />
                                    <span>{post.categories[0]}</span>
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Post Title */}
                            <h3
                              onClick={() => handlePostClick(post.slug)}
                              className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#1A1918] group-hover:text-[#8C7B65] transition-colors cursor-pointer"
                            >
                              {post.title}
                            </h3>

                            {/* Summary description */}
                            <p className="text-sm sm:text-base text-[#5C5853] font-sans leading-relaxed">
                              {post.summary}
                            </p>

                            {/* Row footer: More link + tags */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                              <span
                                onClick={() => handlePostClick(post.slug)}
                                className="text-xs font-mono font-semibold tracking-wider text-[#8A7A66] border-b border-transparent group-hover:border-[#8A7A66] transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                {language === 'zh' ? '闲步细读 ➔' : 'Read More ➔'}
                              </span>

                              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                {post.tags.slice(0, 3).map(tag => (
                                  <span
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className="cursor-pointer font-sans px-2 py-0.5 bg-[#FAF6EE] hover:bg-[#F2EADB] text-[#7A6E5D] transition-colors rounded-sm flex items-center gap-0.5 border border-[#ECE6D9]"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-[#C0B49F]" />
                                    <span>{tag}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Right Column (Minimalist Widgets) */}
          <aside className="lg:col-span-1 space-y-10 border-t lg:border-t-0 lg:border-l border-[#EBE6E0] pt-10 lg:pt-0 lg:pl-8">
            
            {/* Writer Bio Widget */}
            <section className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-[#8C7F6E] font-mono border-b border-[#EBE6E0] pb-2 font-semibold">
                {t.authorSection}
              </h4>
              <div className="space-y-3.5 text-center sm:text-left">
                <img
                  src={config.author.avatar}
                  alt={config.author.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full mx-auto sm:mx-0 object-cover border-2 border-[#EAE2D5] grayscale hover:grayscale-0 transition-all duration-500 shadow-xs"
                />
                <div className="space-y-1">
                  <h5 className="font-serif font-medium text-[#1A1918]">
                    {config.author.name}
                  </h5>
                  <p className="text-xs text-[#706B64] font-sans leading-relaxed">
                    {config.author.bio}
                  </p>
                </div>
              </div>
            </section>

            {/* Configured Categories Drawer */}
            {availableCategories.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-[#8C7F6E] font-mono border-b border-[#EBE6E0] pb-2 font-semibold flex items-center justify-between">
                  <span>{t.categoriesLabel}</span>
                  {selectedCategory && (
                    <span onClick={() => setSelectedCategory(null)} className="text-[10px] text-[#A69785] cursor-pointer hover:underline normal-case tracking-normal">
                      重置
                    </span>
                  )}
                </h4>
                <div className="flex flex-col gap-1">
                  {availableCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat === selectedCategory ? null : cat); setSelectedTag(null); setSelectedPostSlug(null); }}
                      className={`text-left text-xs font-sans py-1 px-1.5 rounded transition-all flex items-center justify-between ${
                        cat === selectedCategory
                          ? 'bg-[#E3DCCE] text-[#3D3524] font-semibold'
                          : 'text-[#615C55] hover:bg-[#F2ECE0] hover:text-[#2C2A29]'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span className="font-mono text-[10px] text-[#8F887C] bg-black/5 px-1.5 py-0.2 rounded-sm ml-1.5">
                        {languagePosts.filter(p => p.categories.includes(cat)).length}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Configured Tags cloud */}
            {availableTags.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-[#8C7F6E] font-mono border-b border-[#EBE6E0] pb-2 font-semibold flex items-center justify-between">
                  <span>{t.tagsLabel}</span>
                  {selectedTag && (
                    <span onClick={() => setSelectedTag(null)} className="text-[10px] text-[#A69785] cursor-pointer hover:underline normal-case tracking-normal">
                      重置
                    </span>
                  )}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setSelectedTag(tag === selectedTag ? null : tag); setSelectedCategory(null); setSelectedPostSlug(null); }}
                      className={`text-xs font-sans px-2.5 py-1 border transition-all rounded ${
                        tag === selectedTag
                          ? 'bg-[#8C7B65] text-white border-transparent'
                          : 'border-[#E4DEC9] bg-white text-[#6E6454] hover:bg-[#F2ECE0]'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </section>
            )}

          </aside>
        </div>

        {/* Dynamic Reader Footer */}
        <footer className="border-t border-[#EBE6E0] mt-20 pt-8 text-center text-xs font-sans text-[#968F84] space-y-4">
          <p className="max-w-xl mx-auto leading-relaxed">
            {t.footerNotice}
          </p>
          <div className="text-mono tracking-wider font-semibold text-[#8C7E6A] select-none text-[11px]">
            {config.params.footerText}
          </div>
        </footer>

      </div>
    </div>
  );
}
