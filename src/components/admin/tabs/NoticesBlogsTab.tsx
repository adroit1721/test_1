import React, { useState } from 'react';
import { useSiteContent } from '../../../context/SiteContentContext';
import { NoticeItem, BlogItem } from '../../../types';
import { compressAndConvertToDataUrl } from '../../../utils/cloudinary';
import {
  FileText,
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Star,
  AlertCircle,
  Paperclip,
  UploadCloud,
  Calendar,
  User,
  Clock,
  ThumbsUp,
  Tag,
  CheckCircle2,
  Download,
  Filter,
} from 'lucide-react';

export const NoticesBlogsTab: React.FC = () => {
  const {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    blogs,
    addBlog,
    updateBlog,
    deleteBlog,
  } = useSiteContent();

  // Active sub-tab: 'notices' or 'blogs'
  const [activeSubTab, setActiveSubTab] = useState<'notices' | 'blogs'>('notices');

  // --- NOTICE STATE & FILTERS ---
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState('All');
  const [noticePriorityFilter, setNoticePriorityFilter] = useState('All');

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeItem | null>(null);

  const [noticeForm, setNoticeForm] = useState<Omit<NoticeItem, 'id'>>({
    title: '',
    circularNo: '',
    date: new Date().toISOString().split('T')[0],
    category: 'General Notice',
    priority: 'Medium',
    isImportant: false,
    author: 'Platoon HQ',
    summary: '',
    content: '',
    attachmentUrl: '',
    pdfUrl: '',
  });

  // --- BLOG STATE & FILTERS ---
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('All');

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<BlogItem | null>(null);

  const [blogForm, setBlogForm] = useState<Omit<BlogItem, 'id'>>({
    title: '',
    author: '',
    authorRole: 'Cadet',
    date: new Date().toISOString().split('T')[0],
    category: 'Cadet Life',
    imageUrl: '',
    readTime: '4 min read',
    summary: '',
    content: '',
    likes: 0,
  });

  // --- HANDLERS: NOTICE ---
  const handleStartAddNotice = () => {
    setEditingNotice(null);
    setNoticeForm({
      title: '',
      circularNo: `NGDC/BNCC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      category: 'General Notice',
      priority: 'Medium',
      isImportant: false,
      author: 'Platoon HQ Office',
      summary: '',
      content: '',
      attachmentUrl: '',
      pdfUrl: '',
    });
    setIsNoticeModalOpen(true);
  };

  const handleStartEditNotice = (item: NoticeItem) => {
    setEditingNotice(item);
    setNoticeForm({
      title: item.title || '',
      circularNo: item.circularNo || '',
      date: item.date || new Date().toISOString().split('T')[0],
      category: item.category || 'General Notice',
      priority: item.priority || 'Medium',
      isImportant: Boolean(item.isImportant),
      author: item.author || 'Platoon HQ Office',
      summary: item.summary || '',
      content: item.content || item.details || '',
      attachmentUrl: item.attachmentUrl || item.pdfUrl || '',
      pdfUrl: item.pdfUrl || item.attachmentUrl || '',
    });
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim()) return;

    if (editingNotice) {
      updateNotice(editingNotice.id, noticeForm);
    } else {
      addNotice(noticeForm);
    }
    setIsNoticeModalOpen(false);
    setEditingNotice(null);
  };

  const handleConfirmDeleteNotice = () => {
    if (noticeToDelete) {
      deleteNotice(noticeToDelete.id);
      setNoticeToDelete(null);
    }
  };

  const handleNoticeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.type.includes('image')) {
        const dataUrl = await compressAndConvertToDataUrl(file, 1200, 1200, 0.85);
        if (dataUrl) {
          setNoticeForm((prev) => ({ ...prev, attachmentUrl: dataUrl, pdfUrl: dataUrl }));
        }
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const resStr = reader.result as string;
          setNoticeForm((prev) => ({ ...prev, attachmentUrl: resStr, pdfUrl: resStr }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('File read error:', err);
    }
  };

  // --- HANDLERS: BLOG ---
  const handleStartAddBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      author: '',
      authorRole: 'Cadet Leader',
      date: new Date().toISOString().split('T')[0],
      category: 'Cadet Life',
      imageUrl: '',
      readTime: '5 min read',
      summary: '',
      content: '',
      likes: 0,
    });
    setIsBlogModalOpen(true);
  };

  const handleStartEditBlog = (item: BlogItem) => {
    setEditingBlog(item);
    setBlogForm({
      title: item.title || '',
      author: item.author || '',
      authorRole: item.authorRole || 'Cadet',
      date: item.date || new Date().toISOString().split('T')[0],
      category: item.category || 'Cadet Life',
      imageUrl: item.imageUrl || '',
      readTime: item.readTime || '4 min read',
      summary: item.summary || '',
      content: item.content || '',
      likes: item.likes || 0,
    });
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.author.trim()) return;

    if (editingBlog) {
      updateBlog(editingBlog.id, blogForm);
    } else {
      addBlog(blogForm);
    }
    setIsBlogModalOpen(false);
    setEditingBlog(null);
  };

  const handleConfirmDeleteBlog = () => {
    if (blogToDelete) {
      deleteBlog(blogToDelete.id);
      setBlogToDelete(null);
    }
  };

  const handleBlogCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressAndConvertToDataUrl(file, 1200, 800, 0.82);
      if (dataUrl) {
        setBlogForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      }
    } catch (err) {
      console.warn('Cover upload failed:', err);
    }
  };

  // --- FILTERED DATA ---
  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      (n.title || '').toLowerCase().includes(noticeSearch.toLowerCase()) ||
      (n.circularNo || '').toLowerCase().includes(noticeSearch.toLowerCase()) ||
      (n.summary || '').toLowerCase().includes(noticeSearch.toLowerCase());

    const matchesCategory =
      noticeCategoryFilter === 'All' ||
      (n.category || '').toLowerCase() === noticeCategoryFilter.toLowerCase();

    const matchesPriority =
      noticePriorityFilter === 'All'
        ? true
        : noticePriorityFilter === 'Important Only'
        ? Boolean(n.isImportant)
        : (n.priority || '').toLowerCase() === noticePriorityFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      (b.title || '').toLowerCase().includes(blogSearch.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(blogSearch.toLowerCase()) ||
      (b.summary || '').toLowerCase().includes(blogSearch.toLowerCase());

    const matchesCategory =
      blogCategoryFilter === 'All' ||
      (b.category || '').toLowerCase() === blogCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const noticeCategories = ['All', 'General Notice', 'Parade Routine', 'Camp & Training', 'Exam & Results', 'Recruitment Notice', 'Urgent Alert'];
  const blogCategories = ['All', 'Cadet Life', 'Leadership & Values', 'Camp Experience', 'Parade & Drill', 'Platoon Heritage', 'Academic & Service'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-tab Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Notices & Articles Management
            </h2>
          </div>
          <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-1">
            Publish official circulars, urgent announcements, and cadet blog posts for the platoon portal.
          </p>
        </div>

        {/* Sub-tab Switcher Pill */}
        <div className="flex items-center bg-[#eae3d2] dark:bg-[#2b2822] p-1.5 rounded-2xl border border-[#cdc6b3]/60 dark:border-[#3e392f] shrink-0">
          <button
            onClick={() => setActiveSubTab('notices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'notices'
                ? 'bg-white dark:bg-[#1a1916] text-[#6b5e10] dark:text-[#eedc82] shadow-sm'
                : 'text-[#615c4d] dark:text-[#a39c8c] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Official Notices</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82]">
              {notices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('blogs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'blogs'
                ? 'bg-white dark:bg-[#1a1916] text-[#6b5e10] dark:text-[#eedc82] shadow-sm'
                : 'text-[#615c4d] dark:text-[#a39c8c] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blogs & Articles</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82]">
              {blogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: OFFICIAL NOTICES MANAGEMENT                             */}
      {/* ==================================================================== */}
      {activeSubTab === 'notices' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Category Filter, Priority Filter, Add Button */}
          <div className="bg-white dark:bg-[#1f1e1a] p-4 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7c7767] dark:text-[#8c8575]" />
                <input
                  type="text"
                  placeholder="Search notices by title, circular no, or summary..."
                  value={noticeSearch}
                  onChange={(e) => setNoticeSearch(e.target.value)}
                  className="japandi-input pl-9 pr-3 py-2 text-xs w-full"
                />
              </div>

              {/* Category Filter */}
              <select
                value={noticeCategoryFilter}
                onChange={(e) => setNoticeCategoryFilter(e.target.value)}
                className="japandi-input py-2 text-xs text-[#1c1c18] dark:text-[#fcfbf7]"
              >
                {noticeCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={noticePriorityFilter}
                onChange={(e) => setNoticePriorityFilter(e.target.value)}
                className="japandi-input py-2 text-xs text-[#1c1c18] dark:text-[#fcfbf7]"
              >
                <option value="All">Priority: All</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
                <option value="Important Only">★ Important Flagged Only</option>
              </select>
            </div>

            {/* Add New Notice Button */}
            <button onClick={handleStartAddNotice} className="japandi-btn-primary shrink-0">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Publish New Notice</span>
            </button>
          </div>

          {/* Notice List Cards */}
          {filteredNotices.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1f1e1a] rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] p-6">
              <FileText className="w-12 h-12 text-[#7c7767] dark:text-[#695c4e] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">No Notices Found</h3>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-1 max-w-sm mx-auto">
                No official notices match your search or filter criteria. Click "Publish New Notice" to create one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredNotices.map((notice) => {
                const isHigh = notice.priority?.toLowerCase() === 'high';
                const isLow = notice.priority?.toLowerCase() === 'low';

                return (
                  <div
                    key={notice.id}
                    className={`bg-white dark:bg-[#1f1e1a] p-5 rounded-2xl border transition-all ${
                      notice.isImportant
                        ? 'border-amber-400/80 dark:border-amber-600/80 shadow-sm bg-amber-50/10 dark:bg-amber-950/10'
                        : 'border-[#dcd6c8] dark:border-[#3a352b] hover:border-[#b8af9c]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          {notice.isImportant && (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Important
                            </span>
                          )}

                          {notice.circularNo && (
                            <span className="font-mono font-semibold text-[#615c4d] dark:text-[#a39c8c] bg-[#f4f0e6] dark:bg-[#282620] px-2 py-0.5 rounded-md">
                              {notice.circularNo}
                            </span>
                          )}

                          <span className="text-[#6b5e10] dark:text-[#eedc82] bg-[#f7f3e8] dark:bg-[#2d2920] px-2 py-0.5 rounded-md font-medium">
                            {notice.category || 'General Notice'}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] ${
                              isHigh
                                ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                : isLow
                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {notice.priority || 'Medium'} Priority
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] leading-snug">
                          {notice.title}
                        </h3>

                        {/* Summary */}
                        {notice.summary && (
                          <p className="text-xs text-[#524e43] dark:text-[#c4bdad] line-clamp-2 leading-relaxed">
                            {notice.summary}
                          </p>
                        )}

                        {/* Details Footer */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#7c7767] dark:text-[#aca596] pt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                            {notice.date}
                          </span>

                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            Issued by: {notice.author || 'Platoon HQ'}
                          </span>

                          {(notice.attachmentUrl || notice.pdfUrl) && (
                            <a
                              href={notice.attachmentUrl || notice.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#6b5e10] dark:text-[#eedc82] hover:underline font-bold"
                            >
                              <Paperclip className="w-3.5 h-3.5" /> View Attachment / Circular
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-start shrink-0 pt-1 border-t sm:border-t-0 border-[#eee9dc] dark:border-[#2e2b23] sm:pt-0">
                        <button
                          onClick={() => handleStartEditNotice(notice)}
                          className="p-2 text-[#615c4d] dark:text-[#aca596] hover:text-[#6b5e10] dark:hover:text-[#eedc82] hover:bg-[#f4f0e6] dark:hover:bg-[#2b2822] rounded-xl transition-colors"
                          title="Edit Notice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setNoticeToDelete(notice)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: BLOGS & ARTICLES MANAGEMENT                             */}
      {/* ==================================================================== */}
      {activeSubTab === 'blogs' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Category Filter, Add Button */}
          <div className="bg-white dark:bg-[#1f1e1a] p-4 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7c7767] dark:text-[#8c8575]" />
                <input
                  type="text"
                  placeholder="Search blogs by title, author, or keyword..."
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  className="japandi-input pl-9 pr-3 py-2 text-xs w-full"
                />
              </div>

              <select
                value={blogCategoryFilter}
                onChange={(e) => setBlogCategoryFilter(e.target.value)}
                className="japandi-input py-2 text-xs text-[#1c1c18] dark:text-[#fcfbf7]"
              >
                {blogCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleStartAddBlog} className="japandi-btn-primary shrink-0">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Publish New Article</span>
            </button>
          </div>

          {/* Blogs Grid */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1f1e1a] rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] p-6">
              <BookOpen className="w-12 h-12 text-[#7c7767] dark:text-[#695c4e] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">No Blog Articles Found</h3>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-1 max-w-sm mx-auto">
                No cadet blogs match your search or filter options. Click "Publish New Article" to post a blog.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white dark:bg-[#1f1e1a] rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] overflow-hidden flex flex-col justify-between hover:border-[#b8af9c] transition-all shadow-xs group"
                >
                  {/* Cover Image */}
                  <div className="relative h-44 bg-[#f4f0e6] dark:bg-[#282620] overflow-hidden">
                    {blog.imageUrl ? (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#7c7767] dark:text-[#695c4e]">
                        <BookOpen className="w-10 h-10 mb-1 opacity-50" />
                        <span className="text-[11px] font-semibold">No Cover Image</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {blog.category || 'Cadet Life'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#7c7767] dark:text-[#aca596]">
                        <span className="flex items-center gap-1 font-semibold text-[#6b5e10] dark:text-[#eedc82]">
                          <User className="w-3.5 h-3.5" />
                          {blog.author} {blog.authorRole ? `(${blog.authorRole})` : ''}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {blog.readTime || '4 min read'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] leading-tight line-clamp-2">
                        {blog.title}
                      </h3>

                      {blog.summary && (
                        <p className="text-xs text-[#524e43] dark:text-[#c4bdad] line-clamp-2 leading-relaxed">
                          {blog.summary}
                        </p>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className="pt-3 border-t border-[#eee9dc] dark:border-[#2e2b23] flex items-center justify-between text-[11px]">
                      <span className="text-[#7c7767] dark:text-[#aca596] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {blog.date}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEditBlog(blog)}
                          className="px-3 py-1 bg-[#f4f0e6] dark:bg-[#2b2822] text-[#6b5e10] dark:text-[#eedc82] hover:bg-[#eedc82]/30 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setBlogToDelete(blog)}
                          className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT NOTICE                                            */}
      {/* ==================================================================== */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1916] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#eee9dc] dark:border-[#2e2b23] pb-4">
              <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>{editingNotice ? 'Edit Official Notice' : 'Publish New Official Notice'}</span>
              </h3>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="p-1.5 text-[#7c7767] hover:text-black dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Notice Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Winter Training Camp Instruction 2026"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Circular No */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Circular / Order No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NGDC/BNCC/2026/04"
                    value={noticeForm.circularNo}
                    onChange={(e) => setNoticeForm({ ...noticeForm, circularNo: e.target.value })}
                    className="japandi-input py-2 text-xs w-full font-mono"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={noticeForm.date}
                    onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Category
                  </label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="japandi-input py-2 text-xs w-full text-[#1c1c18] dark:text-[#fcfbf7]"
                  >
                    <option value="General Notice">General Notice</option>
                    <option value="Parade Routine">Parade Routine</option>
                    <option value="Camp & Training">Camp & Training</option>
                    <option value="Exam & Results">Exam & Results</option>
                    <option value="Recruitment Notice">Recruitment Notice</option>
                    <option value="Urgent Alert">Urgent Alert</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Priority Level
                  </label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="japandi-input py-2 text-xs w-full text-[#1c1c18] dark:text-[#fcfbf7]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                {/* Author / Issuer */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Platoon Commander / PUO Office"
                    value={noticeForm.author}
                    onChange={(e) => setNoticeForm({ ...noticeForm, author: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Important Toggle */}
                <div className="flex items-center pt-5">
                  <label className="relative inline-flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      checked={noticeForm.isImportant}
                      onChange={(e) => setNoticeForm({ ...noticeForm, isImportant: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-[#322f28] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-amber-600"></div>
                    <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Mark as Important Flagged
                    </span>
                  </label>
                </div>

                {/* Summary */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Short Summary (Displayed on notice cards)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief 2-3 line explanation of the notice content..."
                    value={noticeForm.summary}
                    onChange={(e) => setNoticeForm({ ...noticeForm, summary: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Full Details */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Full Notice Details / Directives
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Detailed notice text, instructions, cadet guidelines, reporting timing..."
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Attachment / PDF Link or File Upload */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Attachment / PDF Link / Document
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste PDF link or image URL..."
                      value={noticeForm.attachmentUrl}
                      onChange={(e) =>
                        setNoticeForm({ ...noticeForm, attachmentUrl: e.target.value, pdfUrl: e.target.value })
                      }
                      className="japandi-input py-2 text-xs flex-1"
                    />
                    <label className="japandi-btn-secondary cursor-pointer shrink-0 text-xs py-2 flex items-center justify-center">
                      <UploadCloud className="w-4 h-4 mr-1.5" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleNoticeFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {noticeForm.attachmentUrl && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Attachment loaded ({noticeForm.attachmentUrl.slice(0, 45)}...)
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eee9dc] dark:border-[#2e2b23]">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="japandi-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="japandi-btn-primary text-xs">
                  {editingNotice ? 'Save Notice Changes' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT BLOG                                              */}
      {/* ==================================================================== */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1916] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#eee9dc] dark:border-[#2e2b23] pb-4">
              <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>{editingBlog ? 'Edit Blog Article' : 'Publish New Blog Article'}</span>
              </h3>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="p-1.5 text-[#7c7767] hover:text-black dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lessons in Fortitude from Mahasthan Battalion Drill Camp"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CUO Rahat Mahmud"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Author Role */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Author Role / Rank
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cadet Under Officer / Platoon Sergeant / Ex-Cadet"
                    value={blogForm.authorRole}
                    onChange={(e) => setBlogForm({ ...blogForm, authorRole: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={blogForm.date}
                    onChange={(e) => setBlogForm({ ...blogForm, date: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Category
                  </label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="japandi-input py-2 text-xs w-full text-[#1c1c18] dark:text-[#fcfbf7]"
                  >
                    <option value="Cadet Life">Cadet Life</option>
                    <option value="Leadership & Values">Leadership & Values</option>
                    <option value="Camp Experience">Camp Experience</option>
                    <option value="Parade & Drill">Parade & Drill</option>
                    <option value="Platoon Heritage">Platoon Heritage</option>
                    <option value="Academic & Service">Academic & Service</option>
                  </select>
                </div>

                {/* Read Time */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Read Time Estimate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 min read"
                    value={blogForm.readTime}
                    onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Cover Image */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Cover Banner Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL or upload below..."
                      value={blogForm.imageUrl}
                      onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
                      className="japandi-input py-2 text-xs flex-1"
                    />
                    <label className="japandi-btn-secondary cursor-pointer shrink-0 text-xs py-2 flex items-center justify-center">
                      <UploadCloud className="w-4 h-4 mr-1.5" />
                      <span>Upload Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBlogCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {blogForm.imageUrl && (
                    <div className="mt-2 h-24 rounded-xl overflow-hidden border border-[#cdc6b3] dark:border-[#423e35]">
                      <img src={blogForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Short Excerpt / Summary
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief 2-3 sentence overview of the article..."
                    value={blogForm.summary}
                    onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Article Body */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Full Article Content
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Write full article content here..."
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eee9dc] dark:border-[#2e2b23]">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="japandi-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="japandi-btn-primary text-xs">
                  {editingBlog ? 'Save Article Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DELETE CONFIRMATION MODAL: NOTICE                                   */}
      {/* ==================================================================== */}
      {noticeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1916] border border-red-200 dark:border-red-900/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Confirm Notice Deletion</h3>
            </div>
            <p className="text-xs text-[#524e43] dark:text-[#c4bdad] leading-relaxed">
              Are you sure you want to permanently delete the notice{' '}
              <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                "{noticeToDelete.title}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNoticeToDelete(null)}
                className="japandi-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteNotice}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Yes, Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DELETE CONFIRMATION MODAL: BLOG                                     */}
      {/* ==================================================================== */}
      {blogToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1916] border border-red-200 dark:border-red-900/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Confirm Blog Deletion</h3>
            </div>
            <p className="text-xs text-[#524e43] dark:text-[#c4bdad] leading-relaxed">
              Are you sure you want to delete the blog article{' '}
              <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                "{blogToDelete.title}"
              </span>{' '}
              by {blogToDelete.author}?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBlogToDelete(null)}
                className="japandi-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteBlog}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Yes, Delete Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
