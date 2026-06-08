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

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sync data with localStorage to persist user edits across reloads
  useEffect(() => {
    const savedConfig = localStorage.getItem('hugo_zen_config');
    const savedPosts = localStorage.getItem('hugo_zen_posts');
    const savedComments = localStorage.getItem('hugo_zen_comments');
    const savedLogin = localStorage.getItem('hugo_zen_is_logged_in');

    if (savedConfig) {
      try { setConfig(JSON.parse(savedConfig)); } catch (e) { console.error(e); }
    }
    if (savedPosts) {
      try { setPosts(JSON.parse(savedPosts)); } catch (e) { console.error(e); }
    }
    if (savedComments) {
      try { setComments(JSON.parse(savedComments)); } catch (e) { console.error(e); }
    }
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
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

  const handleDeleteComment = (id: string) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    localStorage.setItem('hugo_zen_comments', JSON.stringify(updated));
  };

  const handleUpdateCategoryGlobally = (oldName: string, newName: string) => {
    const updated = posts.map(post => {
      if (post.categories.includes(oldName)) {
        return {
          ...post,
          categories: post.categories.map(c => c === oldName ? newName : c)
        };
      }
      return post;
    });
    setPosts(updated);
    localStorage.setItem('hugo_zen_posts', JSON.stringify(updated));
  };

  const handleDeleteCategoryGlobally = (catName: string) => {
    const updated = posts.map(post => {
      return {
        ...post,
        categories: post.categories.filter(c => c !== catName)
      };
    });
    setPosts(updated);
    localStorage.setItem('hugo_zen_posts', JSON.stringify(updated));
  };

  const handleUpdateTagGlobally = (oldName: string, newName: string) => {
    const updated = posts.map(post => {
      if (post.tags.includes(oldName)) {
        const mappedTags = post.tags.map(t => t === oldName ? newName : t);
        return {
          ...post,
          // De-duplicate tags
          tags: Array.from(new Set(mappedTags))
        };
      }
      return post;
    });
    setPosts(updated);
    localStorage.setItem('hugo_zen_posts', JSON.stringify(updated));
  };

  const handleDeleteTagGlobally = (tagName: string) => {
    const updated = posts.map(post => {
      return {
        ...post,
        tags: post.tags.filter(t => t !== tagName)
      };
    });
    setPosts(updated);
    localStorage.setItem('hugo_zen_posts', JSON.stringify(updated));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('hugo_zen_is_logged_in');
    setActiveTab('preview');
  };

  const resetAllData = () => {
    if (confirm("是否确认还原所有文章、评论和配置文件至初始禅意预置状态？这会同时清除登录态。")) {
      localStorage.removeItem('hugo_zen_config');
      localStorage.removeItem('hugo_zen_posts');
      localStorage.removeItem('hugo_zen_comments');
      localStorage.removeItem('hugo_zen_is_logged_in');
      setIsLoggedIn(false);
      setConfig(defaultHugoConfig);
      setPosts(defaultPosts);
      setComments(defaultComments);
      setBlogLanguage('zh');
      setActiveTab('preview');
    }
  };

  return (
    <div className="bg-[#FBF9F5] min-h-screen text-[#2C2A29] font-sans antialiased relative">
      
      {/* Immersive Client-facing Preview / Admin Switcher wrapper */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {activeTab === 'preview' && (
            <div className="relative">
              {/* Invisible trigger to help revert demo state */}
              <div className="absolute top-2 left-4 select-none opacity-20 hover:opacity-100 flex items-center gap-2 transition-opacity z-50">
                <button
                  type="button"
                  onClick={resetAllData}
                  className="text-[10px] font-mono text-[#8C765C] bg-[#FAF8F5]/80 px-2 py-1 rounded border border-[#E3DEC9]"
                >
                  还原初始设定 (Reset Data)
                </button>
              </div>

              <BlogReader
                config={config}
                posts={posts}
                comments={comments}
                language={blogLanguage}
                setLanguage={setBlogLanguage}
                onAddComment={handleAddComment}
                isLoggedIn={isLoggedIn}
                onAdminClick={() => {
                  if (isLoggedIn) {
                    setActiveTab('admin');
                  } else {
                    setShowLoginModal(true);
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'admin' && isLoggedIn && (
            <AdminConsole
              config={config}
              updateConfig={handleUpdateConfig}
              posts={posts}
              savePost={handleSavePost}
              onAddPost={handleAddPost}
              onDeletePost={handleDeletePost}
              comments={comments}
              onDeleteComment={handleDeleteComment}
              onUpdateCategoryGlobally={handleUpdateCategoryGlobally}
              onDeleteCategoryGlobally={handleDeleteCategoryGlobally}
              onUpdateTagGlobally={handleUpdateTagGlobally}
              onDeleteTagGlobally={handleDeleteTagGlobally}
              onLogout={handleLogout}
              onBackToPreview={() => setActiveTab('preview')}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Elegant floating custom login modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Blurry dim background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowLoginModal(false);
                setLoginError('');
              }}
              className="absolute inset-0 bg-[#151312]/75 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-[#FCFAF6] text-[#2C2A29] rounded-lg border border-[#DDD5C2] w-full max-w-sm p-6 sm:p-8 space-y-6 shadow-2xl z-10"
            >
              {/* Close Icon button */}
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                  setUsernameInput('');
                  setPasswordInput('');
                }}
                className="absolute right-4 top-4 text-xl font-mono text-[#9C8F7F] hover:text-[#524436] transition-colors"
              >
                &times;
              </button>

              {/* Title Header area */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#8E7B65] flex items-center justify-center mx-auto shadow-inner">
                  <Feather className="w-5.5 h-5.5 text-[#FBF9F5]" />
                </div>
                <h3 className="font-serif font-medium text-lg tracking-tight text-[#1A1918]">
                  禅境后台管理员校验
                </h3>
                <p className="text-xs text-[#8A7E70]">
                  登入系统，管理文章、留言交互与多语言配置分类
                </p>
              </div>

              {loginError && (
                <div className="text-center text-xs bg-[#FBF0ED] text-red-700 p-2.5 rounded border border-red-200 font-medium">
                  {loginError}
                </div>
              )}

              {/* Password credentials verification Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (usernameInput.trim().toLowerCase() === 'admin' && passwordInput === 'zen2026') {
                    setIsLoggedIn(true);
                    localStorage.setItem('hugo_zen_is_logged_in', 'true');
                    setShowLoginModal(false);
                    setLoginError('');
                    setUsernameInput('');
                    setPasswordInput('');
                    setActiveTab('admin');
                  } else {
                    setLoginError('凭证错误，茶香虽温防微杜渐！');
                  }
                }}
                className="space-y-4 font-sans"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8C8172] tracking-wider uppercase">管理员账号</label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                    placeholder="请输入账号 admin"
                    className="w-full bg-[#FCFAF6] text-xs px-3.5 py-2.5 border border-[#E4DED3] rounded focus:ring-1 focus:ring-[#8E7B65] focus:border-[#8E7B65] outline-none placeholder-[#A39B8F]/75 transition-all text-[#2C2A29]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8C8172] tracking-wider uppercase">安全凭证密码</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    placeholder="请输入密码 zen2026"
                    className="w-full bg-[#FCFAF6] text-xs px-3.5 py-2.5 border border-[#E4DED3] rounded focus:ring-1 focus:ring-[#8E7B65] focus:border-[#8E7B65] outline-none placeholder-[#A39B8F]/75 transition-all text-[#2C2A29]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#8E7B65] hover:bg-[#7D6D58] text-white text-xs font-semibold rounded tracking-widest uppercase transition-colors shadow-xs hover:shadow-md cursor-pointer"
                >
                  签署长笺并入室
                </button>
              </form>

              {/* Helpful credential tip for validation and preview environment */}
              <div className="bg-[#FAF6F0] p-4 rounded border border-[#EFEAE0] text-[11px] text-[#8E8170] leading-relaxed select-none">
                <span className="font-semibold text-[#6C5E4E] block mb-1">💡 默认环境出入凭证：</span>
                <p>管理员账户：<code className="bg-[#EEE7DC] text-[#705F4B] px-1 py-0.2 rounded font-mono font-bold">admin</code></p>
                <p className="mt-1">预设密码：<code className="bg-[#EEE7DC] text-[#705F4B] px-1 py-0.2 rounded font-mono font-bold">zen2026</code></p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
