/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { defaultHugoConfig, defaultPosts, defaultComments } from './data';
import { HugoConfig, Post, Comment, ViewState } from './types';
import BlogReader from './components/BlogReader';
import AdminConsole from './components/AdminConsole';
import { Eye, Terminal, BookOpen, Feather, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewState>('preview');
  const [config, setConfig] = useState<HugoConfig>(defaultHugoConfig);
  const [posts, setPosts] = useState<Post[]>(defaultPosts);
  const [comments, setComments] = useState<Comment[]>(defaultComments);
  const [blogLanguage, setBlogLanguage] = useState<'zh' | 'en'>('zh');

  // Sync data with localStorage to persist user edits across reloads
  useEffect(() => {
    const savedConfig = localStorage.getItem('hugo_zen_config');
    const savedPosts = localStorage.getItem('hugo_zen_posts');
    const savedComments = localStorage.getItem('hugo_zen_comments');

    if (savedConfig) {
      try { setConfig(JSON.parse(savedConfig)); } catch (e) { console.error(e); }
    }
    if (savedPosts) {
      try { setPosts(JSON.parse(savedPosts)); } catch (e) { console.error(e); }
    }
    if (savedComments) {
      try { setComments(JSON.parse(savedComments)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleUpdateConfig = (newCfg: HugoConfig) => {
    setConfig(newCfg);
    localStorage.setItem('hugo_zen_config', JSON.stringify(newCfg));
  };

  const handleSavePost = (updatedPost: Post) => {
    const updated = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    setPosts(updated);
    localStorage.setItem('hugo_zen_posts', JSON.stringify(updated));
  };

  const handleAddPost = (newPost: Post) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem('hugo_zen_posts', JSON.stringify(updated));
  };

  const handleDeletePost = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem('hugo_zen_posts', JSON.stringify(updated));
  };

  const handleAddComment = (newComment: Comment) => {
    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem('hugo_zen_comments', JSON.stringify(updated));
  };

  const resetAllData = () => {
    if (confirm("是否确认还原所有文章、评论和配置文件至初始禅意预置状态？")) {
      localStorage.removeItem('hugo_zen_config');
      localStorage.removeItem('hugo_zen_posts');
      localStorage.removeItem('hugo_zen_comments');
      setConfig(defaultHugoConfig);
      setPosts(defaultPosts);
      setComments(defaultComments);
      setBlogLanguage('zh');
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#2C2A29] font-sans antialiased">
      
      {/* Visual Header Controller Bar */}
      <nav className="sticky top-0 z-50 bg-[#F5F2EC] border-b border-[#E3DEC9] px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs select-none">
        
        {/* Logo and Core Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#8E7B65] flex items-center justify-center shadow-xs">
            <Feather className="w-4 h-4 text-[#FBF9F5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-serif font-semibold text-sm tracking-tight text-[#1A1918]">ZenBlog Hugo Designer</span>
              <span className="text-[9px] bg-[#EBE4D5] text-[#7A6C58] px-1.5 py-0.5 rounded font-mono font-bold">STATION</span>
            </div>
            <p className="text-[10px] text-[#8C8172] font-sans mt-0.5 uppercase tracking-wider font-semibold">
              静水禅境 · 静态博客构建工坊
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-[#EAE3D4]/80 p-1 rounded-lg border border-[#DDD5C2] shadow-inner">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'preview'
                ? 'bg-[#8E7B65] text-[#FAF8F5] shadow-xs'
                : 'text-[#6B5E4F] hover:text-[#2C2A29]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>前台预览 (Preview)</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'admin'
                ? 'bg-[#8E7B65] text-[#FAF8F5] shadow-xs'
                : 'text-[#6B5E4F] hover:text-[#2C2A29]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>静态工作台 (Hugo Studio)</span>
          </button>

          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'readme'
                ? 'bg-[#8E7B65] text-[#FAF8F5] shadow-xs'
                : 'text-[#6B5E4F] hover:text-[#2C2A29]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>设计指南 (Guides)</span>
          </button>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetAllData}
            className="text-[10px] font-mono text-[#8C765C] border border-[#DDD5C2] hover:bg-[#EAE3D4] px-2.5 py-1.5 rounded transition-colors bg-white/50"
          >
            还原初始设定
          </button>
        </div>
      </nav>

      {/* Main Tab Render Window */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'preview' && (
            <BlogReader
              config={config}
              posts={posts}
              comments={comments}
              language={blogLanguage}
              setLanguage={setBlogLanguage}
              onAddComment={handleAddComment}
            />
          )}

          {activeTab === 'admin' && (
            <AdminConsole
              config={config}
              updateConfig={handleUpdateConfig}
              posts={posts}
              savePost={handleSavePost}
              onAddPost={handleAddPost}
              onDeletePost={handleDeletePost}
            />
          )}

          {activeTab === 'readme' && (
            <section className="max-w-3xl mx-auto px-6 py-12 md:py-16 space-y-12">
              {/* Introduction header */}
              <div className="space-y-4 border-b border-[#E3DEC9] pb-8">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8C765C] uppercase tracking-wider font-semibold">
                  <Sparkles className="w-4 h-4 text-[#C1AA89]" />
                  <span>禅意极简美学原则 & Hugo 编译原理</span>
                </div>
                <h2 className="text-3xl font-serif font-medium tracking-tight text-[#1A1918]">
                  静行大地，无欲而实
                </h2>
                <p className="text-sm font-sans text-[#6B655C] leading-relaxed">
                  本工坊旨在将经典的 **Hugo 静态博客框架编译机制** 与 **东方禅道留白美学** 融合，向您展示如何在不需要数据库、不需要复杂的后端服务器的情况下，只靠 Markdown 语法和 YAML 配置文件来搭建一个极美、极快、极轻、高安全度的多语言博客。
                </p>
              </div>

              {/* Grid bento layout for key components */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Style guidelines card */}
                <div className="bg-[#FAF6EE] border border-[#EBE3D0] p-6 rounded-md space-y-4">
                  <h3 className="font-serif text-lg font-medium text-[#2C2A29] border-b border-[#EBE3D0] pb-2">
                    🍃 禅意极简设计精髓
                  </h3>
                  <ul className="space-y-3.5 text-xs text-[#5C5346] leading-relaxed">
                    <li>
                      <strong>大地之色：</strong> 使用温润的米白色（#FBF9F5）作为画布基底，避免高饱和色彩，全站点呈现温暖温和的护眼观感。
                    </li>
                    <li>
                      <strong>东方留白 (Ma)：</strong> 为标题、文章主体提供大量的空间，不添加无关和未被要求的侧边装饰栏，目光得以专注。
                    </li>
                    <li>
                      <strong>文人墨客感：</strong> 正文采用典雅的 Serif 衬线体（搭配精简 Sans 索引），让长文阅读如阅竹简古籍般舒适。
                    </li>
                    <li>
                      <strong>一物两译：</strong> 通过后缀结构对同一话题进行深厚的中文与英文配译，呈现跨越语境的宁静共鸣。
                    </li>
                  </ul>
                </div>

                {/* Technical mechanisms card */}
                <div className="bg-[#FAF6EE] border border-[#EBE3D0] p-6 rounded-md space-y-4">
                  <h3 className="font-serif text-lg font-medium text-[#2C2A29] border-b border-[#EBE3D0] pb-2">
                    ⚡ Hugo 静态多语言构建
                  </h3>
                  <ul className="space-y-3.5 text-xs text-[#5C5346] leading-relaxed">
                    <li>
                      <strong>Markdown 原生载入：</strong> 每一篇博文都是一个纯文本 <code className="text-[#8C765C] bg-[#EDE7DA] px-1 rounded text-[11px] font-mono">.md</code> 文件，通过 Front Matter (YML/TOML标头) 元数据表达分类。
                    </li>
                    <li>
                      <strong>多语言目录映射：</strong> Hugo 会检索后缀 <code className="text-[#8C765C] bg-[#EDE7DA] px-1 rounded text-[11px] font-mono">post.zh.md</code> 和 <code className="text-[#8C765C] bg-[#EDE7DA] px-1 rounded text-[11px] font-mono">post.en.md</code>。在极简部署中无需服务器路由。
                    </li>
                    <li>
                      <strong>静态搜索缓存：</strong> 全文检索在静态编译时由 Hugo 输出诸如 <code className="text-[#8C765C] bg-[#EDE7DA] px-1 rounded text-[11px] font-mono">index.json</code> 的倒排索引文件，浏览器加载极速，无需网络检索后端。
                    </li>
                    <li>
                      <strong>无服务器评论：</strong> 我们模拟了完整的评论接收架构。真实部署中，您可以使用 Waline / Disqus / Giscus (托管在 GitHub Disussions) 等来实现100%全静态零成本维护。
                    </li>
                  </ul>
                </div>

              </div>

              {/* Blockquote decoration */}
              <div className="py-6 border-y border-[#E3DEC9] text-center italic text-sm text-[#7A6E5C] font-serif">
                “ 井枯水竭，风不息时，坐看闲叶随流。世事虽繁，有一方安宁桌台足矣。 ”
              </div>

              {/* Steps for quick deployment */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-[#1A1918]">
                  🚀 快速发布您的极简世界：
                </h3>
                <div className="space-y-3.5 text-xs sm:text-sm text-[#5C5346] leading-relaxed">
                  <p>
                    1. 在顶部的<strong>“静态工作台”</strong>调整博客名称、作者简介与您认同的禅言。
                  </p>
                  <p>
                    2. 新增或修改各语言下的 Markdown 内容，点击保存将使本地控制台自动编译最新静态库。
                  </p>
                  <p>
                    3. 在<strong>“前台预览”</strong>里点击各分类与多国语言，真实调试访客视角。
                  </p>
                  <p>
                    4. 点击工作台右侧的<strong>“复刻代码 (Copy)”</strong>，将生成的 TOML 与 MD 直接保存在您本地的 Hugo 项目中，零差错极速上线！
                  </p>
                </div>
              </div>

            </section>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
