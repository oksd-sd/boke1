import React, { useState, useRef, useEffect } from 'react';
import { HugoConfig, Post, Comment } from '../types';
import { FileCode, Folder, FolderOpen, Save, FileText, PlusCircle, Trash, Copy, Check, Terminal, Play, Info, MessageSquare, Tag, LogOut, ArrowLeft, Heart, Eye, Sparkles, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { renderMarkdown } from '../utils/markdown';

interface AdminConsoleProps {
  config: HugoConfig;
  updateConfig: (newConfig: HugoConfig) => void;
  posts: Post[];
  savePost: (post: Post) => void;
  onAddPost: (post: Post) => void;
  onDeletePost: (id: string) => void;
  comments: Comment[];
  onDeleteComment: (id: string) => void;
  onUpdateCategoryGlobally: (oldName: string, newName: string) => void;
  onDeleteCategoryGlobally: (name: string) => void;
  onUpdateTagGlobally: (oldName: string, newName: string) => void;
  onDeleteTagGlobally: (name: string) => void;
  onLogout: () => void;
  onBackToPreview: () => void;
}

const TYPOGRAPHY_TEMPLATES = [
  {
    name: '🌸 古风诗篇',
    description: '适合禅意古诗、佛家短偈或禅修小句。对称居中排版，清雅脱俗。',
    content: `# 寒山钟鸣\n\n~ 《宿业师山房待丁大不至》\n~ 孟浩然\n\n~ 夕阳度西岭，群壑倏已暝。\n~ 松月生夜凉，风泉满清听。\n~ 樵人归欲尽，烟鸟栖初定。\n~ 之子期宿来，孤琴候萝径。\n\n◇ ◇ ◇\n\n> 独处空山，听松竹摇曳，心水自平。夜色微凉，有月光入户，满室澄明。\n`
  },
  {
    name: '🍵 烹茶听雨随笔',
    description: '首字沉降大括号、重点分明对比框与禅宗对话引用。',
    content: `# 粗陶一盏待幽人\n\n**【 茗 • 录 】** 尝闻古人以雪水烹茗，清冷之气直入肌骨。今备粗陶一盏，倾一壶山野冷泉，听火候细细吐纳，自有一种素简欢喜。\n\n## 💡 修心二则\n\n- **世俗营求：** 身陷喧闹，随波逐流，身心日渐枯竭而不知。\n- **山野独往：** 煮水烹茶，扫雪锄园，虽无长物却意态从容。\n\n◇ ◇ ◇\n\n> ”万物皆有回音，如茶气氤氲，终归于太虚之境。“\n\n### 岁时小记\n芒种前后，山中多雨。竹床之上翻阅古卷，湿润的泥土气息混合着古书纸墨的香气，正是极静之时。\n`
  },
  {
    name: '🏮 枯山水意境行脚',
    description: '极简意趣、枯山水砂石哲学叙写，自带双层缩进诗。',
    content: `# 寂地行脚\n\n**【 寂 • 境 】** 行至枯山水庭前，细砂为水，乱石为山。立于其间，能见万物枯荣不惊的气象，是写意，更是内省。\n\n## 一步之遥\n\n~ 若心有微澜，\n~ 处处皆是风暴；\n~ 若心如古井，\n~ 闹市亦是寂林。\n\n◇ ◇ ◇\n\n* **扫径：** 除去昨日落叶，还原心地澄莹。\n* **观石：** 静看顽石不语，阅尽百年风雨。\n`
  }
];

export default function AdminConsole({
  config,
  updateConfig,
  posts,
  savePost,
  onAddPost,
  onDeletePost,
  comments,
  onDeleteComment,
  onUpdateCategoryGlobally,
  onDeleteCategoryGlobally,
  onUpdateTagGlobally,
  onDeleteTagGlobally,
  onLogout,
  onBackToPreview
}: AdminConsoleProps) {
  const [selectedFile, setSelectedFile] = useState<string>('config.toml');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);

  // Advanced Typography UI controls
  const [isCodePreviewExpanded, setIsCodePreviewExpanded] = useState(false);
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit');

  const insertTextAtCursor = (before: string, after: string) => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      setEditContent(prev => prev + before + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = before + (selected || '') + after;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setEditContent(newContent);

    // Refocus and place cursor in ideal spot
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + (selected ? selected.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

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

  // Dropdown states for categories
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  // Close categories dropdown on layout outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setShowCatDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCategory = (cat: string) => {
    let current = editCategories.split(',').map(s => s.trim()).filter(Boolean);
    if (current.includes(cat)) {
      current = current.filter(c => c !== cat);
    } else {
      current.push(cat);
    }
    setEditCategories(current.join(', '));
  };

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

  // Editing category local state
  const [editingCategoryIdx, setEditingCategoryIdx] = useState<string | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  // Editing tag local state
  const [editingTagIdx, setEditingTagIdx] = useState<string | null>(null);
  const [tagNameInput, setTagNameInput] = useState('');

  // Extract dynamically
  const categoriesSet = new Set<string>();
  posts.forEach(p => p.categories.forEach(c => categoriesSet.add(c)));
  const availableCategories = Array.from(categoriesSet);

  const tagsSet = new Set<string>();
  posts.forEach(p => p.tags.forEach(t => tagsSet.add(t)));
  const availableTags = Array.from(tagsSet);

  // Triggered when clicking a file in browser
  const handleSelectFile = (fileType: 'config' | 'post' | 'new-post' | 'comments' | 'categories' | 'tags', postId?: string) => {
    setEditorTab('edit');
    if (fileType === 'config') {
      setSelectedFile('config.toml');
      setSelectedPostId(null);
    } else if (fileType === 'comments') {
      setSelectedFile('comments.json');
      setSelectedPostId(null);
    } else if (fileType === 'categories') {
      setSelectedFile('categories.json');
      setSelectedPostId(null);
    } else if (fileType === 'tags') {
      setSelectedFile('tags.json');
      setSelectedPostId(null);
    } else if (fileType === 'new-post') {
      setSelectedFile('new_post.md');
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
      setSelectedFile('post_file.md');
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
    triggerBuildSimulation('Configured server variables reloaded (config.toml modified).');
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
      `Statically compiling XML feeds and sitemaps ...`,
      `Statically generated site data re-indexed.`
    ]);

    setTimeout(() => {
      setBuildLogs(prev => [
        ...prev,
        `Built in 39ms`,
        `Static artifacts generated successfully! 🌴`,
        `Local dev host listening on port 3000.`
      ]);
      setIsBuilding(false);
    }, 600);
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
${yamlCategories ? yamlCategories : "  - \"Uncategorized\""}
tags:
${yamlTags ? yamlTags : "  - \"Zen\""}
---

${editContent}
`;
  };

  const getGeneratedCommentsJSON = () => {
    return JSON.stringify(comments, null, 2);
  };

  const getGeneratedCategoriesTOML = () => {
    let toml = `# Hugo Taxonomies Category Table Map\n[taxonomies]\n  category = "categories"\n\n[categories]\n`;
    availableCategories.forEach(cat => {
      const cnt = posts.filter(p => p.categories.includes(cat)).length;
      toml += `  "${cat}" = { count = ${cnt} }\n`;
    });
    return toml;
  };

  const getGeneratedTagsTOML = () => {
    let toml = `# Hugo Taxonomies Tag Table Map\n[taxonomies]\n  tag = "tags"\n\n[tags]\n`;
    availableTags.forEach(tag => {
      const cnt = posts.filter(p => p.tags.includes(tag)).length;
      toml += `  "${tag}" = { count = ${cnt} }\n`;
    });
    return toml;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="bg-[#1C1A19] text-[#DFDDD9] min-h-screen font-mono text-sm flex flex-col">
      
      {/* 1. Dynamic Master Admin Toolbar */}
      <header className="bg-[#141211] border-b border-[#2D2622] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8E7E6A] animate-pulse" />
          <div className="text-xs font-bold tracking-wider text-[#EBE6DF] font-mono flex items-center gap-2">
            <span>HUGO 后台管理</span>
            <span className="text-[10px] bg-[#2E2823] text-[#BEA991] px-2 py-0.5 rounded-sm">管理员</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBackToPreview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25211E] hover:bg-[#302B27] text-xs text-[#EFEDE9] border border-[#3D352F] rounded-md transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#AC9F8E]" />
            <span>返回前台</span>
          </button>
          
          <button
            onClick={() => {
              if (confirm('确认要退出管理员后台吗？')) {
                onLogout();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3B1914] hover:bg-[#4E211A] text-xs text-red-100 border border-red-950/40 rounded-md transition-all font-sans"
            title="安全退出"
          >
            <LogOut className="w-3.5 h-3.5 text-red-300" />
            <span>退出管理</span>
          </button>
        </div>
      </header>

      {/* 2. Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-grow border-t border-[#231F1C]">
        
        {/* Hugo Folders Explorer Panel */}
        <aside className="lg:col-span-3 bg-[#151312] border-r border-[#2A2623] p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-[#2D2A27] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8E7E6A]" />
              <h3 className="font-bold text-xs tracking-wider uppercase text-[#9C8F7F]">
                博客目录
              </h3>
            </div>
            <button
              onClick={() => handleSelectFile('new-post')}
              className="text-xs text-[#BEA991] hover:text-[#DFDDD9] flex items-center gap-1 transition-all"
              title="写一份微小的 Markdown 文章"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>写文章</span>
            </button>
          </div>

          {/* Hugo File Directory Tree */}
          <div className="space-y-4">
            
            {/* System settings and parameters metadata config.toml, categories, tags, comments */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase text-[#736A61] tracking-wider font-semibold px-2">系统配置</div>
              
              {/* index.toml */}
              <button
                onClick={() => handleSelectFile('config')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-all text-xs ${
                  selectedFile === 'config.toml'
                    ? 'bg-[#2F2923] text-[#F3EFE9] border-l-2 border-[#BEA991]'
                    : 'text-[#8C847A] hover:bg-[#201C19] hover:text-[#C5BEB5]'
                }`}
              >
                <FileCode className="w-4 h-4 text-[#C19B7C]" />
                <span className="truncate">基础配置 (config.toml)</span>
              </button>

              {/* categories.toml */}
              <button
                onClick={() => handleSelectFile('categories')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-all text-xs ${
                  selectedFile === 'categories.json'
                    ? 'bg-[#2F2923] text-[#F3EFE9] border-l-2 border-[#BEA991]'
                    : 'text-[#8C847A] hover:bg-[#201C19] hover:text-[#C5BEB5]'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-[#BEA991]" />
                <span className="truncate">分类管理 (categories.toml)</span>
              </button>

              {/* tags.toml */}
              <button
                onClick={() => handleSelectFile('tags')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-all text-xs ${
                  selectedFile === 'tags.json'
                    ? 'bg-[#2F2923] text-[#F3EFE9] border-l-2 border-[#BEA991]'
                    : 'text-[#8C847A] hover:bg-[#201C19] hover:text-[#C5BEB5]'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-[#A1B39D]" />
                <span className="truncate">标签管理 (tags.toml)</span>
              </button>

              {/* comments.json */}
              <button
                onClick={() => handleSelectFile('comments')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-all text-xs ${
                  selectedFile === 'comments.json'
                    ? 'bg-[#2F2923] text-[#F3EFE9] border-l-2 border-[#BEA991]'
                    : 'text-[#8C847A] hover:bg-[#201C19] hover:text-[#C5BEB5]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#C27E74]" />
                <span className="truncate">评论管理 (comments.json)</span>
              </button>
            </div>

            {/* Posts folder */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between px-2 text-[10px] uppercase text-[#736A61] tracking-wider font-semibold">
                <span className="flex items-center gap-1">
                  <FolderOpen className="w-3 h-3 text-[#A89884]" />
                  <span>content/post/</span>
                </span>
                <span>({posts.length})</span>
              </div>

              <div className="pl-3.5 space-y-1 max-h-[280px] overflow-y-auto pr-1">
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
                        if (confirm(`确认要删除文章 "${post.title}" 吗？该操作不可撤销！`)) {
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
                <span>系统支撑目录</span>
              </div>
              <div className="pl-3 space-y-1 text-xs text-[#6B635A]">
                <div className="px-2 py-1 flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-[#887C6C]" />
                  <span>themes/zen-minimalist/</span>
                </div>
                <div className="px-2 py-1 flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-[#887C6C]" />
                  <span>layouts/partials/</span>
                </div>
              </div>
            </div>

          </div>

          {/* Informational Box */}
          <div className="bg-[#211E1D] border border-[#2F2A26] rounded-md p-4 space-y-2 text-[11px] text-[#A69786] leading-relaxed select-none">
            <div className="flex items-center gap-1.5 text-[#DFCEB3] font-semibold">
              <Info className="w-3.5 h-3.5 text-[#CBAE85]" />
              <span>关于 Hugo 编译：</span>
            </div>
            <p>
              修改任何配置、文章或分类之后，系统会自动捕获更改并生成对应文件，实现零延迟实时热更新刷新，您也可以拷贝导出的物理代码。
            </p>
          </div>
        </aside>

        {/* Interactive Main Workspace Editor Panel */}
        <main className={`${isCodePreviewExpanded ? 'lg:col-span-6 border-r border-[#2A2623]' : 'lg:col-span-9'} bg-[#161413] p-6 lg:p-8 flex flex-col justify-between space-y-6 transition-all duration-300`}>
          
          <div className="space-y-6 flex-1">
            {/* Heading */}
            <div className="flex items-center justify-between border-b border-[#252220] pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#EFEDE9] flex items-center gap-2">
                  {selectedFile === 'config.toml' 
                    ? '🛠️ 正在编辑: config.toml' 
                    : selectedFile === 'comments.json'
                    ? '💬 正在管理: comments.json (文章评论)'
                    : selectedFile === 'categories.json'
                    ? '📁 正在管理: categories.toml (栏目分类)'
                    : selectedFile === 'tags.json'
                    ? '🏷️ 正在管理: tags.toml (文章标签)'
                    : '📝 正在编辑: content/post/' + (selectedPostId ? posts.find(p => p.id === selectedPostId)?.slug : 'new') + '.' + editLanguage + '.md'}
                </h2>
                <p className="text-xs text-[#8A7E73] mt-0.5">
                  修改后可通过右上角保存，或实现实时动态重编译
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Collapsible toggle button for Hugo physical files */}
                <button
                  type="button"
                  onClick={() => setIsCodePreviewExpanded(!isCodePreviewExpanded)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all border font-sans cursor-pointer ${
                    isCodePreviewExpanded 
                      ? 'bg-[#3A332C] text-[#E5D7C6] border-[#5E5144]' 
                      : 'bg-[#211E1C] text-[#8C847A] border-[#2D2825] hover:text-[#C5BEB5]'
                  }`}
                  title={isCodePreviewExpanded ? "点击隐藏 Hugo 物理文件代码预览" : "点击展开 Hugo 物理文件代码预览"}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{isCodePreviewExpanded ? '精简主视图' : '查看物理代码'}</span>
                </button>

                {(selectedFile === 'config.toml' || selectedFile === 'post_file.md' || selectedFile === 'new_post.md') ? (
                  <button
                    onClick={selectedFile === 'config.toml' ? handleSaveConfig : selectedFile === 'new_post.md' ? handleCreatePost : handleSavePost}
                    className="flex items-center gap-1.5 bg-[#8E7E6A] hover:bg-[#A3927C] text-[#FAF8F5] px-4 py-1.5 rounded text-xs transition-colors shadow-xs font-semibold cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存并生成</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-[#8EAF74] font-mono flex items-center gap-1.5 bg-[#142813] border border-[#254A25] px-3 py-1.5 rounded select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                    <span>实时重编译</span>
                  </span>
                )}
              </div>
            </div>

            {/* Form Editor fields dependent on selected file */}
            <div className="space-y-5 max-h-[52vh] lg:max-h-[62vh] overflow-y-auto pr-2">
              
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
                    <label className="text-xs text-[#9B8F80] font-semibold">首屏禅意语录 (params.zenQuote)</label>
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

              {/* COMMENTS.JSON / BACKEND COMMENTS MANAGEMENT */}
              {selectedFile === 'comments.json' && (
                <div className="space-y-4">
                  <div className="text-xs text-[#8A7E73] bg-[#1C1917] p-3 rounded border border-[#2D2825] leading-relaxed">
                    提示：此处列出全部读者的文章评论。点击“删除”按钮即可从数据库中永久清除对应的玩家留言。
                  </div>

                  <div className="space-y-2.5">
                    {comments.length === 0 ? (
                      <div className="text-center py-12 text-xs italic text-[#5A524A] bg-[#0E0D0C] border border-dashed border-[#2D2825] rounded">
                        静水无波，当前博客中暂无任何评论留声。
                      </div>
                    ) : (
                      comments.map(com => {
                        const associatedPost = posts.find(p => p.slug === com.postSlug);
                        return (
                          <div key={com.id} className="bg-[#1C1917] hover:bg-[#201C1A] p-4 rounded border border-[#2D2825] transition-all flex items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1 select-text">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-[#EFEDE9] font-semibold">{com.author}</span>
                                <span className="text-[10px] text-[#867B70] font-mono">{com.date}</span>
                                <span className="text-[10px] bg-[#2E2823] text-[#BEA991] px-2 py-0.5 rounded font-mono truncate max-w-[200px]" title="所属文章IDslug">
                                  ➔ {associatedPost ? associatedPost.title : com.postSlug}
                                </span>
                              </div>
                              <p className="text-xs text-[#C5BBAE] leading-relaxed whitespace-pre-wrap">{com.content}</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`确认要删除读者 "${com.author}" 的这条评论吗？删除后不可撤销。`)) {
                                  onDeleteComment(com.id);
                                  triggerBuildSimulation(`Removed comment ID ${com.id}.`);
                                }
                              }}
                              className="p-1.5 px-3 bg-[#3B1914] hover:bg-[#52241C] text-red-300 hover:text-red-100 rounded text-xs transition-all flex items-center gap-1"
                              title="删除评论"
                            >
                              <Trash className="w-3 h-3" />
                              <span>删除</span>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* CATEGORIES.JSON / GLOBAL CATEGORIES MANAGEMENT */}
              {selectedFile === 'categories.json' && (
                <div className="space-y-6">
                  <div className="text-xs text-[#8A7E73] bg-[#1C1917] p-3 rounded border border-[#2D2825] leading-relaxed">
                    提示：在此可以查看全站文章的所有分类。您可以直接更名，或者将其从对应的文章中删除。
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-[#9C8F7F] tracking-wider px-1">
                      当前全站分类 ({availableCategories.length})
                    </div>
                    
                    {availableCategories.length === 0 ? (
                      <div className="text-center py-12 text-xs italic text-[#5A524A] bg-[#0E0D0C] border border-dashed border-[#2D2825] rounded">
                        空山寂寂。暂无任何分类栏目。请先在文章编辑中设定分类。
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {availableCategories.map((cat, idx) => {
                          const isEditing = editingCategoryIdx === cat;
                          const usageCount = posts.filter(p => p.categories.includes(cat)).length;
                          
                          return (
                            <div key={idx} className="bg-[#1C1917] p-4 rounded border border-[#2D2825] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              {isEditing ? (
                                <div className="flex-grow flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={categoryNameInput}
                                    onChange={(e) => setCategoryNameInput(e.target.value)}
                                    className="flex-1 bg-[#201C1A] text-xs p-2 rounded border border-[#BEA991] text-[#DFDDD9] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const trimmed = categoryNameInput.trim();
                                      if (!trimmed) return;
                                      if (trimmed === cat) {
                                        setEditingCategoryIdx(null);
                                        return;
                                      }
                                      if (confirm(`确认要将所有文章中的分类「${cat}」一键更名为「${trimmed}」吗？`)) {
                                        onUpdateCategoryGlobally(cat, trimmed);
                                        setEditingCategoryIdx(null);
                                        triggerBuildSimulation(`Static router updated: category renamed from "${cat}" to "${trimmed}".`);
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-[#8E7E6A] hover:bg-[#A3927C] text-white rounded text-xs transition-colors"
                                  >
                                    保存
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCategoryIdx(null)}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
                                  >
                                    取消
                                  </button>
                                </div>
                              ) : (
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#EFEDE9] font-bold text-sm truncate">{cat}</span>
                                    <span className="text-[10px] bg-[#2E2823] text-[#BEA991] px-2.5 py-0.5 rounded font-mono">
                                      {usageCount} 篇博文使用
                                    </span>
                                  </div>
                                </div>
                              )}

                              {!isEditing && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCategoryIdx(cat);
                                      setCategoryNameInput(cat);
                                    }}
                                    className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors cursor-pointer"
                                  >
                                    重命名
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`确认要从所有文章中移除「${cat}」分类吗？该操作不会删除文章内容。`)) {
                                        onDeleteCategoryGlobally(cat);
                                        triggerBuildSimulation(`Unlinked category: "${cat}" globally.`);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-[#3B1914] hover:bg-[#52241C] text-red-300 rounded text-xs transition-colors border border-red-950/40 cursor-pointer"
                                  >
                                    删除
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAGS.JSON / GLOBAL TAGS MANAGEMENT */}
              {selectedFile === 'tags.json' && (
                <div className="space-y-6">
                  <div className="text-xs text-[#8A7E73] bg-[#1C1917] p-3 rounded border border-[#2D2825] leading-relaxed font-sans">
                    提示：在此可以统一管理文章的标签。更名后的标签如果与现有标签同名，会自动合并。
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-[#9C8F7F] tracking-wider px-1">
                      当前全站标签 ({availableTags.length})
                    </div>
                    
                    {availableTags.length === 0 ? (
                      <div className="text-center py-12 text-xs italic text-[#5A524A] bg-[#0E0D0C] border border-dashed border-[#2D2825] rounded">
                        微澜不惊。暂无任何标签云集。请在书写文章时填加。
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {availableTags.map((tag, idx) => {
                          const isEditing = editingTagIdx === tag;
                          const usageCount = posts.filter(p => p.tags.includes(tag)).length;
                          
                          return (
                            <div key={idx} className="bg-[#1C1917] p-4 rounded border border-[#2D2825] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              {isEditing ? (
                                <div className="flex-grow flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={tagNameInput}
                                    onChange={(e) => setTagNameInput(e.target.value)}
                                    className="flex-1 bg-[#201C1A] text-xs p-2 rounded border border-[#BEA991] text-[#DFDDD9] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const trimmed = tagNameInput.trim();
                                      if (!trimmed) return;
                                      if (trimmed === tag) {
                                        setEditingTagIdx(null);
                                        return;
                                      }
                                      if (confirm(`确认要将全站文章中的标签「${tag}」全局更名为「${trimmed}」吗？`)) {
                                        onUpdateTagGlobally(tag, trimmed);
                                        setEditingTagIdx(null);
                                        triggerBuildSimulation(`Static metadata update: tag "${tag}" merged or renamed to "${trimmed}".`);
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-[#8E7E6A] hover:bg-[#A3927C] text-white rounded text-xs transition-colors"
                                  >
                                    保存
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingTagIdx(null)}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
                                  >
                                    取消
                                  </button>
                                </div>
                              ) : (
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#EFEDE9] font-semibold text-sm truncate">#{tag}</span>
                                    <span className="text-[10px] bg-[#222E22] text-[#8EAF74] px-2.5 py-0.5 rounded font-mono border border-green-950/20">
                                      {usageCount} 篇博文
                                    </span>
                                  </div>
                                </div>
                              )}

                              {!isEditing && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTagIdx(tag);
                                      setTagNameInput(tag);
                                    }}
                                    className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors cursor-pointer"
                                  >
                                    重命名
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`确认要将标签「#${tag}」从所有文章中移除吗？`)) {
                                        onDeleteTagGlobally(tag);
                                        triggerBuildSimulation(`Unlinked tag: "#${tag}" globally.`);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-[#3B1914] hover:bg-[#4E211A] text-red-300 rounded text-xs transition-colors border border-red-950/40 cursor-pointer"
                                  >
                                    删除
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                          className={`flex-1 rounded text-xs transition-colors ${editLanguage === 'zh' ? 'bg-[#8E7E6A] text-[#FAF8F5]' : 'text-[#877E75] hover:text-[#C5BEB5]'}`}
                        >
                          中文 (zh)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditLanguage('en')}
                          className={`flex-1 rounded text-xs transition-colors ${editLanguage === 'en' ? 'bg-[#8E7E6A] text-[#FAF8F5]' : 'text-[#877E75] hover:text-[#C5BEB5]'}`}
                        >
                          English (en)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#201D1B] pt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#9B8F80] font-semibold">英文静态路由 (slug / URL)</label>
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
                    <div className="space-y-1.5 relative select-none" ref={catDropdownRef}>
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-[#9B8F80] font-semibold">导航分类 (categories - 逗号分隔)</label>
                        {availableCategories.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowCatDropdown(!showCatDropdown)}
                            className="text-[10px] text-[#BEA991] hover:text-[#DFCEB3] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>选择已有分类</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showCatDropdown ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g., 茶道 (Tea Way), 禅修 (Zen)"
                          className="w-full bg-[#201C1A] text-xs p-2.5 pr-8 rounded border border-[#2D2825] text-[#DFDDD9] focus:outline-none focus:border-[#BEA991]"
                          value={editCategories}
                          onChange={(e) => setEditCategories(e.target.value)}
                          onFocus={() => setShowCatDropdown(true)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCatDropdown(!showCatDropdown)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C847A] hover:text-[#C5BEB5] p-1 cursor-pointer"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCatDropdown ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {showCatDropdown && (
                        <div className="absolute z-[60] w-full mt-1 bg-[#1A1816] border border-[#3A332C] rounded shadow-2xl p-2 max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
                          <div className="text-[10px] text-[#7E7468] pb-1 border-b border-[#2C2723] px-1 select-none flex justify-between">
                            <span>点击切换选择已有分类：</span>
                            <span className="font-mono text-[9px] bg-[#2E2822] text-[#DFCEB3] px-1 rounded">
                              {availableCategories.length} 个可用
                            </span>
                          </div>
                          {availableCategories.length === 0 ? (
                            <div className="text-[11px] text-[#8C8274] italic p-1.5">
                              暂无已设置分类，可直接输入新建
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1 pt-1">
                              {availableCategories.map((cat) => {
                                const isSelected = editCategories
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                                  .includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleCategory(cat)}
                                    className={`w-full text-left text-xs px-2 py-1.5 rounded transition-all flex items-center justify-between gap-1 cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#3E352C] border border-[#55473A] text-[#DFCEB3] font-medium'
                                        : 'bg-[#151312] border border-[#231F1D] text-[#8C847A] hover:text-[#C5BEB5] hover:bg-[#201C1B]'
                                    }`}
                                  >
                                    <span className="truncate">{cat}</span>
                                    {isSelected && <Check className="w-3 h-3 text-[#A3B29E] flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[#9B8F80] font-semibold">标签云集 (tags - 逗号分隔)</label>
                      <input
                        type="text"
                        placeholder="e.g., 静心, 见素, 极简生活"
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

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-[#9B8F80]">
                      <label className="font-semibold">文章主体与排版设计 (content)</label>
                      <span className="text-[10px] text-[#716A61] font-mono">支持标准 Markdown + 宿山雅韵拓展</span>
                    </div>

                    <div className="border border-[#2C2723] rounded-lg overflow-hidden bg-[#1D1A18] shadow-lg">
                      
                      {/* Advanced Post Typography Toolbar */}
                      <div className="bg-[#1E1B19] border-b border-[#2C2723] px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Basic Typo Modifiers */}
                          <button
                            type="button"
                            onClick={() => insertTextAtCursor('**', '**')}
                            className="p-1 px-2.5 bg-[#25211E] hover:bg-[#342D28] text-[#BEA991] rounded border border-[#3C342E] transition-colors font-bold text-[11px] cursor-pointer"
                            title="粗体 (Bold)"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTextAtCursor('*', '*')}
                            className="p-1 px-2.5 bg-[#25211E] hover:bg-[#342D28] text-[#BEA991] rounded border border-[#3C342E] transition-colors italic text-[11px] cursor-pointer"
                            title="斜体 (Italic)"
                          >
                            I
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTextAtCursor('`', '`')}
                            className="p-1 px-2 bg-[#25211E] hover:bg-[#342D28] text-[#BEA991] rounded border border-[#3C342E] transition-colors font-mono text-[10px] cursor-pointer"
                            title="行内代码 (Inline Code)"
                          >
                            &lt;/&gt;
                          </button>
                          
                          <span className="w-px h-4 bg-[#2C2723] mx-1" />

                          {/* Structured Text Modifiers */}
                          <button
                            type="button"
                            onClick={() => insertTextAtCursor('# ', '')}
                            className="p-1 px-2 bg-[#25211E] hover:bg-[#342D28] text-[#A3B29E] rounded border border-[#3C342E] transition-colors font-sans text-[10px] cursor-pointer"
                            title="一级大标题"
                          >
                            H1
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTextAtCursor('## ', '')}
                            className="p-1 px-2 bg-[#25211E] hover:bg-[#342D28] text-[#A3B29E] rounded border border-[#3C342E] transition-colors font-sans text-[10px] cursor-pointer"
                            title="二级子标题"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTextAtCursor('> ', '')}
                            className="p-1 px-2.5 bg-[#25211E] hover:bg-[#342D28] text-[#C1B3A0] rounded border border-[#3C342E] transition-colors text-[10px] cursor-pointer"
                            title="山谷引语框 (Blockquote)"
                          >
                            “ ” 引语
                          </button>

                          <span className="w-px h-4 bg-[#2C2723] mx-1" />

                          {/* Special Zen Layout Helpers */}
                          <button
                            type="button"
                            onClick={() => insertTextAtCursor('\n~ ', '')}
                            className="p-1 px-2 bg-[#2E2822] hover:bg-[#3E352C] text-[#DFCEB3] rounded border border-[#4F4031] transition-colors text-[10px] flex items-center gap-1 cursor-pointer font-sans"
                            title="在行首添加波浪号 ~ ，该行在正文中将完美对称居中，采用雅致衬线体，字距放宽"
                          >
                            <span>🌸 诗歌居中</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => insertTextAtCursor('\n◇ ◇ ◇\n', '')}
                            className="p-1 px-2 bg-[#2E2822] hover:bg-[#3E352C] text-[#DFCEB3] rounded border border-[#4F4031] transition-colors text-[10px] flex items-center gap-1 cursor-pointer font-sans"
                            title="在新行插入雅洁的三珠落砂分割线"
                          >
                            <span>◇ 禅意分割</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => insertTextAtCursor('**【 禅 • 语 】** ', '')}
                            className="p-1 px-2 bg-[#2E2822] hover:bg-[#3E352C] text-[#DFCEB3] rounded border border-[#4F4031] transition-colors text-[10px] flex items-center gap-1 cursor-pointer font-sans"
                            title="添加首字下沉或引言放大装饰前缀，彰显纸质书籍排版气息"
                          >
                            <span className="font-serif">A⁺ 首字放大</span>
                          </button>
                        </div>

                        {/* Switch editor mode tabs */}
                        <div className="flex bg-[#12100F] p-0.5 rounded border border-[#2D2825] select-none">
                          <button
                            type="button"
                            onClick={() => setEditorTab('edit')}
                            className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer font-sans ${
                              editorTab === 'edit'
                                ? 'bg-[#8E7E6A] text-[#FAF8F5] font-semibold'
                                : 'text-[#877E75] hover:text-[#C5BEB5]'
                            }`}
                          >
                            Markdown 源码
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditorTab('preview')}
                            className={`px-2.5 py-1 text-xs rounded transition-all flex items-center gap-1 cursor-pointer font-sans ${
                              editorTab === 'preview'
                                ? 'bg-[#8E7E6A] text-[#FAF8F5] font-semibold'
                                : 'text-[#877E75] hover:text-[#C5BEB5]'
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>美化排版预览</span>
                          </button>
                        </div>

                      </div>

                      {/* Editor space vs custom reactive render sheet */}
                      <div className="relative">
                        {editorTab === 'edit' ? (
                          <textarea
                            id="post-content-textarea"
                            rows={10}
                            className="w-full bg-[#161413] text-xs p-3.5 focus:bg-[#1A1816] text-[#EFECE8] focus:outline-none font-mono leading-relaxed"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="在此挥毫，支持 Markdown 与上方禅意排版工具插注。点击右侧「美化排版预览」查看实时印刷级渲染..."
                          />
                        ) : (
                          <div className="bg-[#FBF9F5] text-[#2C2A29] p-5 sm:p-7 h-[252px] overflow-y-auto select-text font-sans scrollbar-thin rounded-b border border-t border-[#EBE6E0]">
                            <div className="max-w-2xl mx-auto border border-[#EBE6E0] bg-[#FCFAF6] p-5 rounded shadow-sm text-left">
                              {/* Decors paper look */}
                              <div className="border-b border-[#EBE6E0] pb-3 mb-4 select-none">
                                <h1 className="text-lg sm:text-xl font-serif font-semibold tracking-tight text-[#1A1918]">
                                  {editTitle || '无标题之心境'}
                                </h1>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] mt-2 text-[#8C7F6E] font-mono">
                                  <span>📅 {editDate || '今日'}</span>
                                  <span>⏱️ {editReadTime || '2 min read'}</span>
                                  <span>📁 {editCategories || '虚怀若谷'}</span>
                                </div>
                              </div>
                              
                              {/* Embedded micro custom markdown output */}
                              <div className="prose prose-stone font-sans text-sm text-[#4A4744] leading-relaxed">
                                {editContent ? renderMarkdown(editContent) : <em className="text-[#A29D97] italic">书卷尚未提笔，请在「Markdown 源码」标签中静心书写。</em>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Master preset design templates bar */}
                      <div className="bg-[#1C1816] px-3.5 py-2 border-t border-[#2C2723] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-[11px]">
                        <div className="flex items-center gap-1 text-[#8E8376] select-none">
                          <Sparkles className="w-3.5 h-3.5 text-[#C5B49D] animate-pulse" />
                          <span>一键注入排版手帖套版：</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {TYPOGRAPHY_TEMPLATES.map((tmpl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (confirm(`确认要将当前编辑器内所有内容覆盖，替换为「${tmpl.name}」模版范作吗？`)) {
                                  setEditContent(tmpl.content);
                                  setEditorTab('preview');
                                  triggerBuildSimulation(`Applied premium layout book: ${tmpl.name}`);
                                }
                              }}
                              className="px-2.5 py-1 bg-[#251E1C] hover:bg-[#342A26] hover:text-[#EFEDE9] text-[#DFCEB3] border border-[#3C322E] rounded transition-all text-[10px] select-none cursor-pointer"
                              title={tmpl.description}
                            >
                              {tmpl.name}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Console Execution Simulator Output */}
          <div className="border-t border-[#2E2925] pt-5 space-y-2 select-none">
            <div className="flex items-center justify-between text-xs text-[#8A7D70]">
              <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-[#BEA991]" />
                <span>Hugo Statically Loaded Compiler Console</span>
              </span>
              <button
                onClick={() => triggerBuildSimulation('Manual static catalog rebuild initiated.')}
                disabled={isBuilding}
                className="px-2 py-0.5 bg-[#2B2521] hover:bg-[#382E28] transition-all border border-[#3C342E] rounded text-[10px] text-[#C1B2A1] flex items-center gap-1"
              >
                <Play className="w-2.5 h-2.5 text-[#AC977F]" />
                {isBuilding ? '编译中...' : '启动 Hugo 重构'}
              </button>
            </div>

            <div className="bg-[#0C0B0A] rounded-md p-3.5 font-mono text-[11px] text-[#A6B29D] shadow-inner h-32 overflow-y-auto space-y-1 border border-[#1B1918]">
              {buildLogs.length === 0 ? (
                <span className="text-[#5A524A] italic">等待指令输入。保存修改、删除评论或合并标签后，此控制台能将更改映射到 public/ 文件目录结构下，并完成热更新。</span>
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

        {/* Right-hand Side Code File Preview Panel */}
        {isCodePreviewExpanded && (
          <section className="lg:col-span-3 bg-[#11100F] p-5 space-y-5 flex flex-col justify-between transition-all duration-300">
            <div className="space-y-4 flex-grow border-b border-[#1E1C1A] lg:border-b-0">
              <div className="flex items-center justify-between border-b border-[#23201E] pb-3 select-none">
                <h4 className="text-xs uppercase tracking-wider text-[#91877C] font-semibold">
                  代码预览
                </h4>
                <button
                  onClick={() => copyToClipboard(
                    selectedFile === 'config.toml' ? getGeneratedTOML() : 
                    selectedFile === 'comments.json' ? getGeneratedCommentsJSON() :
                    selectedFile === 'categories.json' ? getGeneratedCategoriesTOML() :
                    selectedFile === 'tags.json' ? getGeneratedTagsTOML() :
                    getGeneratedPostMarkdown()
                  )}
                  className="text-xs text-[#968978] hover:text-[#EFEDE9] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="一键拷贝此物理文件代码"
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
                  <code>
                    {selectedFile === 'config.toml' ? getGeneratedTOML() : 
                     selectedFile === 'comments.json' ? getGeneratedCommentsJSON() :
                     selectedFile === 'categories.json' ? getGeneratedCategoriesTOML() :
                     selectedFile === 'tags.json' ? getGeneratedTagsTOML() :
                     getGeneratedPostMarkdown()}
                  </code>
                </pre>
              </div>
            </div>

            {/* Bottom Educational instructions */}
            <div className="bg-[#1C1A19] border border-[#282522] rounded p-4 text-[11px] leading-relaxed text-[#8E8478] space-y-2 select-none">
              <div className="font-semibold text-[#C1B3A0] uppercase tracking-wider text-[10px] border-b border-[#2C2723] pb-1.5">
                如何部署静态代码：
              </div>
              <ol className="list-decimal pl-4.5 space-y-1.5 text-left text-[10px]">
                <li>
                  直接点击上方<strong>[复刻代码]</strong>按钮拷贝配置和 Markdown 博文。
                </li>
                <li>
                  粘贴到您本地的 Hugo 项目对应路径（如 <code className="text-[#B9A387]">config.toml</code> 和 <code className="text-[#B9A387]">content/post/...</code>）。
                </li>
                <li>
                  通过命令行运行 <code className="text-[#B9A387] bg-black/40 px-1 py-0.2 rounded font-mono text-[10px]">hugo</code> 编译出轻巧快速的多语言静态 HTML，托管入 GitHub Pages，实现极简之境！
                </li>
              </ol>
            </div>
          </section>
        )}

      </div>

    </div>
  );
}
