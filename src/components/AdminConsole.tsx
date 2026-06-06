import React, { useState } from 'react';
import { HugoConfig, Post } from '../types';
import { FileCode, Folder, FolderOpen, Save, FileText, PlusCircle, Trash, Copy, Check, Terminal, Play, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminConsoleProps {
  config: HugoConfig;
  updateConfig: (newConfig: HugoConfig) => void;
  posts: Post[];
  savePost: (post: Post) => void;
  onAddPost: (post: Post) => void;
  onDeletePost: (id: string) => void;
}

export default function AdminConsole({
  config,
  updateConfig,
  posts,
  savePost,
  onAddPost,
  onDeletePost
}: AdminConsoleProps) {
  const [selectedFile, setSelectedFile] = useState<string>('config.toml');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);

  // Editing post buffer state
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLanguage, setEditLanguage] = useState<'zh' | 'en'>('zh');
  const [editCategories, setEditCategories] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editReadTime, setEditReadTime] = useState('');

  // Editing config buffer state
  const [cfgTitle, setCfgTitle] = useState(config.title);
  const [cfgSubtitle, setCfgSubtitle] = useState(config.subtitle);
  const [cfgTheme, setCfgTheme] = useState(config.theme);
  const [cfgAuthorName, setCfgAuthorName] = useState(config.author.name);
  const [cfgAuthorBio, setCfgAuthorBio] = useState(config.author.bio);
  const [cfgAuthorAvatar, setCfgAuthorAvatar] = useState(config.author.avatar);
  const [cfgZenQuote, setCfgZenQuote] = useState(config.params.zenQuote);
  const [cfgComments, setCfgComments] = useState(config.params.enableComments);
  const [cfgSearch, setCfgSearch] = useState(config.params.enableSearch);
  const [cfgFooterText, setCfgFooterText] = useState(config.params.footerText);

  // Triggered when clicking a file in browser
  const handleSelectFile = (fileType: 'config' | 'post' | 'new-post', postId?: string) => {
    setSelectedFile(fileType === 'config' ? 'config.toml' : fileType === 'new-post' ? 'new_post.md' : 'post_file.md');
    
    if (fileType === 'config') {
      setSelectedPostId(null);
    } else if (fileType === 'new-post') {
      setSelectedPostId(null);
      // Fresh empty post data
      setEditTitle('新写心境 / New Whisperings');
      setEditSlug('new-zen-moment');
      setEditSummary('简叙一段空山静修背后的素简日常...');
      setEditContent('# 闲坐听雨声\n\n雨水滴落黛瓦，是山野间最寂静的鼓点。\n\n- 备一盏粗陶\n- 倾一壶冷泉\n- 看茶气静静氤氲...');
      setEditDate(new Date().toISOString().substring(0, 10));
      setEditLanguage('zh');
      setEditCategories('禅修 (Zen), 极简生活 (Minimalism)');
      setEditTags('静心, 青芽, 日常');
      setEditReadTime('3 min read');
    } else if (fileType === 'post' && postId) {
      setSelectedPostId(postId);
      const post = posts.find(p => p.id === postId);
      if (post) {
        setEditTitle(post.title);
        setEditSlug(post.slug);
        setEditSummary(post.summary);
        setEditContent(post.content);
        setEditDate(post.date);
        setEditLanguage(post.language);
        setEditCategories(post.categories.join(', '));
        setEditTags(post.tags.join(', '));
        setEditReadTime(post.readTime);
      }
    }
  };

  const handleSaveConfig = () => {
    const updated: HugoConfig = {
      title: cfgTitle,
      subtitle: cfgSubtitle,
      languageCode: editLanguage === 'zh' ? 'zh-cn' : 'en-us',
      defaultContentLanguage: editLanguage,
      theme: cfgTheme,
      author: {
        name: cfgAuthorName,
        bio: cfgAuthorBio,
        avatar: cfgAuthorAvatar
      },
      params: {
        zenQuote: cfgZenQuote,
        enableComments: cfgComments,
        enableSearch: cfgSearch,
        footerText: cfgFooterText
      }
    };
    updateConfig(updated);
    triggerBuildSimulation('Configured server variables reloaded.');
  };

  const handleSavePost = () => {
    if (!selectedPostId) return;
    const originalPost = posts.find(p => p.id === selectedPostId);
    if (!originalPost) return;

    const modified: Post = {
      ...originalPost,
      title: editTitle,
      slug: editSlug,
      summary: editSummary,
      content: editContent,
      date: editDate,
      language: editLanguage,
      categories: editCategories.split(',').map(s => s.trim()).filter(Boolean),
      tags: editTags.split(',').map(s => s.trim()).filter(Boolean),
      readTime: editReadTime
    };

    savePost(modified);
    triggerBuildSimulation(`Static translation compiled: content/post/${editSlug}.${editLanguage}.md`);
  };

  const handleCreatePost = () => {
    const newPost: Post = {
      id: 'post-' + Date.now(),
      title: editTitle,
      slug: editSlug || 'new-post-' + Date.now(),
      summary: editSummary,
      content: editContent,
      date: editDate || new Date().toISOString().substring(0, 10),
      language: editLanguage,
      categories: editCategories.split(',').map(s => s.trim()).filter(Boolean),
      tags: editTags.split(',').map(s => s.trim()).filter(Boolean),
      readTime: editReadTime || '3 min read',
      author: cfgAuthorName
    };

    onAddPost(newPost);
    handleSelectFile('post', newPost.id);
    triggerBuildSimulation(`Generated static webpage content at content/post/${newPost.slug}.${newPost.language}.md`);
  };

  // Simulates a gorgeous Unix Hugo Build compilation log in the terminal
  const triggerBuildSimulation = (actionMsg: string) => {
    setIsBuilding(true);
    setBuildLogs([
      `$ hugo --gc --minify`,
      `Start building sites ...`,
      `hugo v0.125.0-DEV456-with-zen-theme`,
      `[i18n] [zh] loading translation dictionary`,
      `[i18n] [en] loading translation dictionary`,
      `+ ${actionMsg}`,
      `Rendering layouts ...`,
      `Writing static HTML nodes in /public/ ...`,
      `Static comments database synched with local storage.`
    ]);

    setTimeout(() => {
      setBuildLogs(prev => [
        ...prev,
        `Built in 43ms`,
        `Static artifacts generated successfully! 🌴`,
        `Local dev host listening on port 3000.`
      ]);
      setIsBuilding(false);
    }, 850);
  };

  // Format code display for generated Hugo file artifacts
  const getGeneratedTOML = () => {
    return `baseURL = "https://example.org/"
title = "${cfgTitle}"
subtitle = "${cfgSubtitle}"
languageCode = "${config.defaultContentLanguage === 'zh' ? 'zh-cn' : 'en-us'}"
defaultContentLanguage = "${config.defaultContentLanguage}"
theme = "${cfgTheme}"

[author]
  name = "${cfgAuthorName}"
  bio = "${cfgAuthorBio}"
  avatar = "${cfgAuthorAvatar}"

[params]
  zenQuote = "${cfgZenQuote}"
  enableComments = ${cfgComments}
  enableSearch = ${cfgSearch}
  footerText = "${cfgFooterText}"

[[menu.main]]
  name = "Home"
  url = "/"
  weight = 1
`;
  };

  const getGeneratedPostMarkdown = () => {
    const yamlCategories = editCategories.split(',').map(s => s.trim()).filter(Boolean).map(c => `  - "${c}"`).join('\n');
    const yamlTags = editTags.split(',').map(s => s.trim()).filter(Boolean).map(t => `  - "${t}"`).join('\n');
    
    return `---
title: "${editTitle}"
date: ${editDate}
draft: false
slug: "${editSlug}"
summary: "${editSummary}"
readTime: "${editReadTime}"
language: "${editLanguage}"
categories:
${yamlCategories || "  - \"Uncategorized\""}
tags:
${yamlTags || "  - \"Zen\""}
---

${editContent}
`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="bg-[#1C1A19] text-[#DFDDD9] min-h-screen font-mono text-sm grid grid-cols-1 lg:grid-cols-12 border-t border-[#3C352E]">
      
      {/* 1. Hugo Folders Explorer Panel */}
      <aside className="lg:col-span-3 bg-[#151312] border-r border-[#2A2623] p-5 space-y-6">
        <div className="flex items-center justify-between border-b border-[#2D2A27] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8E7E6A] animate-pulse" />
            <h3 className="font-bold text-xs tracking-wider uppercase text-[#9C8F7F]">
              Hugo 工作区 (Workspace)
            </h3>
          </div>
          <button
            onClick={() => handleSelectFile('new-post')}
            className="text-xs text-[#BEA991] hover:text-[#DFDDD9] flex items-center gap-1 transition-all"
            title="创建一个新的 markdown 章节"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>新文章</span>
          </button>
        </div>

        {/* Hugo File Directory Tree */}
        <div className="space-y-4">
          
          {/* Config file */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase text-[#736A61] tracking-wider font-semibold px-2">文件系统配置</div>
            <button
              onClick={() => handleSelectFile('config')}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-left transition-all ${
                selectedFile === 'config.toml'
                  ? 'bg-[#2F2923] text-[#F3EFE9] border-l-2 border-[#BEA991]'
                  : 'text-[#8C847A] hover:bg-[#201C19] hover:text-[#C5BEB5]'
              }`}
            >
              <FileCode className="w-4 h-4 text-[#C19B7C]" />
              <span className="truncate">config.toml</span>
            </button>
          </div>

          {/* Posts folder */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between px-2 text-[10px] uppercase text-[#736A61] tracking-wider font-semibold">
              <span className="flex items-center gap-1">
                <FolderOpen className="w-3 h-3" />
                <span>content/post/</span>
              </span>
              <span>({posts.length})</span>
            </div>

            <div className="pl-3.5 space-y-1 max-h-[350px] overflow-y-auto pr-1">
              {posts.map(post => (
                <div key={post.id} className="group flex items-center justify-between">
                  <button
                    onClick={() => handleSelectFile('post', post.id)}
                    className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all text-xs ${
                      selectedPostId === post.id
                        ? 'bg-[#2F2923] text-[#F3EFE9] border-l border-[#BEA991]'
                        : 'text-[#877F75] hover:bg-[#201C19] hover:text-[#C5BEB5]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-[#BBAF9E]" />
                    <span className="truncate flex-1">
                      {post.slug}.{post.language}.md
                    </span>
                  </button>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确认要物理删除 content/post/${post.slug}.${post.language}.md 吗？`)) {
                        onDeletePost(post.id);
                        if (selectedPostId === post.id) {
                          handleSelectFile('config');
                        }
                        triggerBuildSimulation(`Deleted content/post/${post.slug}.${post.language}.md`);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#C46755] hover:text-red-400 transition-opacity"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Static directories */}
          <div className="space-y-1 pt-2 border-t border-[#23201E]">
            <div className="text-[10px] uppercase text-[#736A61] tracking-wider font-semibold px-2 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5" />
              <span>其它静态文件夹</span>
            </div>
            <div className="pl-3 space-y-1 text-xs text-[#6B635A]">
              <div className="px-2 py-1 flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-[#887C6C]" />
                <span>themes/hugo-zen-minimalist/</span>
              </div>
              <div className="px-2 py-1 flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-[#887C6C]" />
                <span>static/uploads/</span>
              </div>
            </div>
          </div>

        </div>

        {/* Informational Box */}
        <div className="bg-[#211E1D] border border-[#2F2A26] rounded-md p-4 space-y-2 mt-4 text-[11px] text-[#A69786] leading-relaxed">
          <div className="flex items-center gap-1.5 text-[#DFCEB3] font-semibold">
            <Info className="w-3.5 h-3.5 text-[#CBAE85]" />
            <span>Hugo 双语构建机制：</span>
          </div>
          <p>
            Hugo 依靠文章后缀（如 <code className="text-[#DFCEB3]">.zh.md</code> 与 <code className="text-[#DFCEB3]">.en.md</code>）来自动构建相应语言架构。我们在后台控制每一页的物理代码生成，前台博客会因此动态适配。
          </p>
        </div>
      </aside>

      {/* 2. Interactive Main Workspace Editor Panel */}
      <main className="lg:col-span-6 bg-[#161413] p-6 lg:p-8 flex flex-col justify-between border-r border-[#2A2623] space-y-6">
        
        <div className="space-y-6 flex-1">
          {/* Heading */}
          <div className="flex items-center justify-between border-b border-[#252220] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#EFEDE9] flex items-center gap-2">
                {selectedFile === 'config.toml' ? '🛠️ 正在编辑: config.toml' : '📝 正在编辑: content/post/' + (selectedPostId ? posts.find(p => p.id === selectedPostId)?.slug : 'new') + '.' + editLanguage + '.md'}
              </h2>
              <p className="text-xs text-[#8A7E73] mt-0.5">
                实时编译并同步映射到静态网页预览
              </p>
            </div>
            <button
              onClick={selectedFile === 'config.toml' ? handleSaveConfig : selectedFile === 'new_post.md' ? handleCreatePost : handleSavePost}
              className="flex items-center gap-1.5 bg-[#8E7E6A] hover:bg-[#A3927C] text-[#FAF8F5] px-4 py-2 rounded text-xs transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存并生成</span>
            </button>
          </div>

          {/* Form Editor fields dependent on selected file */}
          <div className="space-y-5 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2">
            
            {/* CONFIG.TOML fields */}
            {selectedFile === 'config.toml' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9B8F80] font-semibold">博客主标题 (title)</label>
                    <input
                      type="text"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                      value={cfgTitle}
                      onChange={(e) => setCfgTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9B8F80] font-semibold">博客副标题 (subtitle)</label>
                    <input
                      type="text"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                      value={cfgSubtitle}
                      onChange={(e) => setCfgSubtitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#201D1B] pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9B8F80] font-semibold">作者姓名 (author.name)</label>
                    <input
                      type="text"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                      value={cfgAuthorName}
                      onChange={(e) => setCfgAuthorName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs text-[#9B8F80] font-semibold">作者简介 (author.bio)</label>
                    <input
                      type="text"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                      value={cfgAuthorBio}
                      onChange={(e) => setCfgAuthorBio(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#9B8F80] font-semibold">作者头像链接 (author.avatar)</label>
                  <input
                    type="text"
                    className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                    value={cfgAuthorAvatar}
                    onChange={(e) => setCfgAuthorAvatar(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 border-t border-[#201D1B] pt-4">
                  <label className="text-xs text-[#9B8F80] font-semibold">首屏禅意名言 (params.zenQuote)</label>
                  <textarea
                    rows={2}
                    className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991] resize-none"
                    value={cfgZenQuote}
                    onChange={(e) => setCfgZenQuote(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#201D1B] pt-4">
                  <div className="bg-[#1C1917] p-3 rounded border border-[#2A2522] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#EFEDE9] font-semibold">启用全局评论?</div>
                      <div className="text-[10px] text-[#867B70]">params.enableComments</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cfgComments}
                      onChange={(e) => setCfgComments(e.target.checked)}
                      className="w-4 h-4 rounded text-[#8E7E6A] focus:ring-0"
                    />
                  </div>

                  <div className="bg-[#1C1917] p-3 rounded border border-[#2A2522] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#EFEDE9] font-semibold">启用本地检索?</div>
                      <div className="text-[10px] text-[#867B70]">params.enableSearch</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cfgSearch}
                      onChange={(e) => setCfgSearch(e.target.checked)}
                      className="w-4 h-4 rounded text-[#8E7E6A] focus:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-[#201D1B] pt-4">
                  <label className="text-xs text-[#9B8F80] font-semibold">页脚文字声明 (params.footerText)</label>
                  <input
                    type="text"
                    className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                    value={cfgFooterText}
                    onChange={(e) => setCfgFooterText(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* MARKDOWN POST Fields (Both Edit and New) */}
            {(selectedFile === 'post_file.md' || selectedFile === 'new_post.md') && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-[#9B8F80] font-semibold">文章标题 (title)</label>
                    <input
                      type="text"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="text-xs text-[#9B8F80] font-semibold">文章语言 (language)</label>
                    <div className="flex gap-2 h-9 p-0.5 bg-[#201C1A] border border-[#2D2825] rounded">
                      <button
                        type="button"
                        onClick={() => setEditLanguage('zh')}
                        className={`flex-1 rounded text-xs ${editLanguage === 'zh' ? 'bg-[#8E7E6A] text-[#FAF8F5]' : 'text-[#877E75] hover:text-[#C5BEB5]'}`}
                      >
                        中文 (zh)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditLanguage('en')}
                        className={`flex-1 rounded text-xs ${editLanguage === 'en' ? 'bg-[#8E7E6A] text-[#FAF8F5]' : 'text-[#877E75] hover:text-[#C5BEB5]'}`}
                      >
                        English (en)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#201D1B] pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9B8F80] font-semibold">英文静态代号 (slug / URL)</label>
                    <input
                      type="text"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991] font-mono"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                      disabled={selectedFile === 'post_file.md'} // Hugo slugs are immutable normally for consistency
                      title="代号是网页的物理路由标识"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9B8F80] font-semibold">发表日期 (date)</label>
                    <input
                      type="date"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9B8F80] font-semibold">预估阅读时间 (readTime)</label>
                    <input
                      type="text"
                      placeholder="e.g., 4 min read"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                      value={editReadTime}
                      onChange={(e) => setEditReadTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#201D1B] pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9B8F80] font-semibold">导航分类 (categories - 逗号分隔)</label>
                    <input
                      type="text"
                      placeholder="e.g., 茶道 (Tea Way), 冥想"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                      value={editCategories}
                      onChange={(e) => setEditCategories(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9B8F80] font-semibold">标签云集 (tags - 逗号分隔)</label>
                    <input
                      type="text"
                      placeholder="e.g., 极简, 留白, 见素"
                      className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-[#201D1B] pt-4">
                  <label className="text-xs text-[#9B8F80] font-semibold">文章短析摘要 (summary)</label>
                  <input
                    type="text"
                    className="w-full bg-[#201C1A] text-xs p-2.5 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs text-[#9B8F80] font-semibold">文章主体 Markdown (content)</label>
                  <textarea
                    rows={8}
                    className="w-full bg-[#201C1A] text-xs p-3 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991] font-mono leading-relaxed"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Console Execution Simulator Output */}
        <div className="border-t border-[#2E2925] pt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A7D70]">
            <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-[#BEA991]" />
              <span>Hugo 本地编译控制台</span>
            </span>
            <button
              onClick={() => triggerBuildSimulation('Manual static catalog rebuild initiated.')}
              disabled={isBuilding}
              className="px-2 py-0.5 bg-[#2B2521] hover:bg-[#382E28] transition-colors border border-[#3C342E] rounded text-[10px] text-[#C1B2A1] flex items-center gap-1"
            >
              <Play className="w-2.5 h-2.5 text-[#AC977F]" />
              {isBuilding ? '编译中...' : '启动 Hugo 重构'}
            </button>
          </div>

          <div className="bg-[#0C0B0A] rounded-md p-3.5 font-mono text-[11px] text-[#A6B29D] shadow-inner h-32 overflow-y-auto space-y-1 border border-[#1B1918]">
            {buildLogs.length === 0 ? (
              <span className="text-[#5A524A] italic">等待指令输入。保存修改或点击右侧“启动 Hugo 重构”按钮开始部署。</span>
            ) : (
              buildLogs.map((log, idx) => (
                <div key={idx} className={log.startsWith('$') ? 'text-[#C5BAA8]' : log.includes('Built in') || log.includes('successfully') ? 'text-[#8EAE74]' : 'text-[#8D887E]'}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* 3. Right-hand Side Code File Preview Panel (Actual output static text) */}
      <section className="lg:col-span-3 bg-[#11100F] p-5 space-y-5 flex flex-col justify-between">
        <div className="space-y-4 flex-grow">
          <div className="flex items-center justify-between border-b border-[#23201E] pb-3">
            <h4 className="text-xs uppercase tracking-wider text-[#91877C] font-semibold">
              代码预览
            </h4>
            <button
              onClick={() => copyToClipboard(selectedFile === 'config.toml' ? getGeneratedTOML() : getGeneratedPostMarkdown())}
              className="text-xs text-[#968978] hover:text-[#EFEDE9] flex items-center gap-1.5 transition-colors"
              title="一键拷贝此代码文件"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-bold">已复制!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复刻代码</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0A0A09] text-[#ADAEAF] rounded p-4 h-[350px] lg:h-[480px] overflow-auto border border-[#191817]">
            <pre className="text-[10px] sm:text-xs font-mono leading-relaxed select-all">
              <code>{selectedFile === 'config.toml' ? getGeneratedTOML() : getGeneratedPostMarkdown()}</code>
            </pre>
          </div>
        </div>

        {/* Bottom Educational instructions */}
        <div className="bg-[#1C1A19] border border-[#282522] rounded p-4 text-[11px] leading-relaxed text-[#8E8478] space-y-2">
          <div className="font-semibold text-[#C1B3A0] uppercase tracking-wider text-[10px] border-b border-[#2C2723] pb-1.5">
            如何用于本地 Hugo 项目：
          </div>
          <ol className="list-decimal pl-4.5 space-y-1.5 text-left">
            <li>
              运行本地命令行：<br />
              <code className="text-[#B9A387] bg-black/40 px-1 py-0.2 rounded font-mono text-[10px] break-all">hugo new site my-blog</code>
            </li>
            <li>
              复制左侧 <code className="text-[#B9A387]">config.toml</code> 至项目根目录。
            </li>
            <li>
              在命令行克隆禅意极简主题：<br />
              <code className="text-[#B9A387] bg-black/40 px-1 py-0.2 rounded font-mono text-[10px] break-all">git clone https://github.com/example/zen themes/zen</code>
            </li>
            <li>
              运行 <code className="text-[#B9A387] bg-black/40 px-1 py-0.2 rounded font-mono text-[10px]">hugo server -D</code> 启动极简之境！
            </li>
          </ol>
        </div>
      </section>

    </div>
  );
}
