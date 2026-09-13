import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { TrainingAnnouncement, CustomFormSubmission } from '../../../types';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  Award,
  Filter,
  Eye,
  FileCheck,
  User,
  Users,
  Building,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const TrainingTab: React.FC = () => {
  const {
    trainingAnnouncements,
    addTrainingAnnouncement,
    updateTrainingAnnouncement,
    deleteTrainingAnnouncement,
    trainingSubmissions,
    updateTrainingSubmissionStatus,
    deleteTrainingSubmission,
  } = useAdminData();

  // Sub-tab switcher: 'announcements' or 'submissions'
  const [activeSubTab, setActiveSubTab] = useState<'announcements' | 'submissions'>('announcements');

  // --- ANNOUNCEMENTS STATE & FILTERS ---
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [announcementStatusFilter, setAnnouncementStatusFilter] = useState('All');
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState('All');

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<TrainingAnnouncement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<TrainingAnnouncement | null>(null);

  const [announcementForm, setAnnouncementForm] = useState<Omit<TrainingAnnouncement, 'id'>>({
    title: '',
    status: 'Upcoming',
    category: 'Weekly Drill Parade',
    date: new Date().toISOString().split('T')[0],
    time: '07:30 AM - 10:30 AM',
    venue: 'NGDC Parade Ground Room 123 HQ',
    uniform: 'BNCC Khaki Uniform & Beret',
    instructor: 'Platoon Officer & PUO',
    description: '',
    hasRegistrationForm: true,
  });

  // --- SUBMISSIONS STATE & FILTERS ---
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState('All');
  const [selectedSubmissionForView, setSelectedSubmissionForView] = useState<CustomFormSubmission | null>(null);
  const [submissionToDelete, setSubmissionToDelete] = useState<CustomFormSubmission | null>(null);

  // --- HANDLERS: ANNOUNCEMENTS ---
  const handleStartAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: '',
      status: 'Upcoming',
      category: 'Weekly Drill Parade',
      date: new Date().toISOString().split('T')[0],
      time: '07:30 AM - 10:30 AM',
      venue: 'NGDC Parade Ground Room 123 HQ',
      uniform: 'BNCC Khaki Uniform & Beret',
      instructor: 'Platoon Commander & PUO',
      description: '',
      hasRegistrationForm: true,
    });
    setIsAnnouncementModalOpen(true);
  };

  const handleStartEditAnnouncement = (ann: TrainingAnnouncement) => {
    setEditingAnnouncement(ann);
    setAnnouncementForm({
      title: ann.title || '',
      status: ann.status || 'Upcoming',
      category: ann.category || 'Weekly Drill Parade',
      date: ann.date || new Date().toISOString().split('T')[0],
      time: ann.time || '07:30 AM - 10:30 AM',
      venue: ann.venue || 'NGDC Parade Ground',
      uniform: ann.uniform || ann.dressCode || 'BNCC Khaki Uniform',
      instructor: ann.instructor || 'Platoon Officer',
      description: ann.description || '',
      hasRegistrationForm: Boolean(ann.hasRegistrationForm),
    });
    setIsAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim()) return;

    if (editingAnnouncement) {
      updateTrainingAnnouncement(editingAnnouncement.id, announcementForm);
    } else {
      addTrainingAnnouncement(announcementForm);
    }
    setIsAnnouncementModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleConfirmDeleteAnnouncement = () => {
    if (announcementToDelete) {
      deleteTrainingAnnouncement(announcementToDelete.id);
      setAnnouncementToDelete(null);
    }
  };

  // --- HANDLERS: SUBMISSIONS ---
  const handleConfirmDeleteSubmission = () => {
    if (submissionToDelete) {
      deleteTrainingSubmission(submissionToDelete.id);
      setSubmissionToDelete(null);
    }
  };

  // --- FILTERED DATA ---
  const filteredAnnouncements = trainingAnnouncements.filter((ann) => {
    const matchesSearch =
      (ann.title || '').toLowerCase().includes(announcementSearch.toLowerCase()) ||
      (ann.venue || '').toLowerCase().includes(announcementSearch.toLowerCase()) ||
      (ann.description || '').toLowerCase().includes(announcementSearch.toLowerCase());

    const matchesStatus =
      announcementStatusFilter === 'All' ||
      (ann.status || '').toLowerCase() === announcementStatusFilter.toLowerCase();

    const matchesCategory =
      announcementCategoryFilter === 'All' ||
      (ann.category || '').toLowerCase() === announcementCategoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredSubmissions = trainingSubmissions.filter((sub) => {
    const searchLow = submissionSearch.toLowerCase();
    const dataStr = JSON.stringify(sub.data || {}).toLowerCase();

    const matchesSearch =
      (sub.formTitle || '').toLowerCase().includes(searchLow) ||
      (sub.id || '').toLowerCase().includes(searchLow) ||
      dataStr.includes(searchLow);

    const subStatus = sub.status || 'Pending';
    const matchesStatus =
      submissionStatusFilter === 'All' ||
      subStatus.toLowerCase() === submissionStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const categoriesList = ['All', 'Weekly Drill Parade', 'Battalion Winter Camp', 'Firing & Range Training', 'Physical Fitness Test', 'Disaster Management', 'Special Event'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-tab Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Training & Events Management
            </h2>
          </div>
          <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-1">
            Manage BNCC parade schedules, battalion winter camps, firing drills, and cadet attendance submissions.
          </p>
        </div>

        {/* Sub-tab Switcher Pill */}
        <div className="flex items-center bg-[#eae3d2] dark:bg-[#2b2822] p-1.5 rounded-2xl border border-[#cdc6b3]/60 dark:border-[#3e392f] shrink-0">
          <button
            onClick={() => setActiveSubTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'announcements'
                ? 'bg-white dark:bg-[#1a1916] text-[#6b5e10] dark:text-[#eedc82] shadow-sm'
                : 'text-[#615c4d] dark:text-[#a39c8c] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Training & Events</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82]">
              {trainingAnnouncements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'submissions'
                ? 'bg-white dark:bg-[#1a1916] text-[#6b5e10] dark:text-[#eedc82] shadow-sm'
                : 'text-[#615c4d] dark:text-[#a39c8c] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Cadet Submissions</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82]">
              {trainingSubmissions.length}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: ANNOUNCEMENTS MANAGEMENT                                 */}
      {/* ==================================================================== */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Filters, Add Button */}
          <div className="bg-white dark:bg-[#1f1e1a] p-4 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7c7767] dark:text-[#8c8575]" />
                <input
                  type="text"
                  placeholder="Search events by title, venue, description..."
                  value={announcementSearch}
                  onChange={(e) => setAnnouncementSearch(e.target.value)}
                  className="japandi-input pl-9 pr-3 py-2 text-xs w-full"
                />
              </div>

              {/* Status Filter */}
              <select
                value={announcementStatusFilter}
                onChange={(e) => setAnnouncementStatusFilter(e.target.value)}
                className="japandi-input py-2 text-xs text-[#1c1c18] dark:text-[#fcfbf7]"
              >
                <option value="All">Status: All</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Category Filter */}
              <select
                value={announcementCategoryFilter}
                onChange={(e) => setAnnouncementCategoryFilter(e.target.value)}
                className="japandi-input py-2 text-xs text-[#1c1c18] dark:text-[#fcfbf7]"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Announcement Button */}
            <button onClick={handleStartAddAnnouncement} className="japandi-btn-primary shrink-0">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Training Event</span>
            </button>
          </div>

          {/* Announcements List */}
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1f1e1a] rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] p-6">
              <Calendar className="w-12 h-12 text-[#7c7767] dark:text-[#695c4e] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">No Training Events Found</h3>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-1 max-w-sm mx-auto">
                No parade or training announcements match your search criteria. Click "Add Training Event" to create one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAnnouncements.map((ann) => {
                const statusLow = (ann.status || 'Upcoming').toLowerCase();
                const isOngoing = statusLow === 'ongoing';
                const isCompleted = statusLow === 'completed';

                return (
                  <div
                    key={ann.id}
                    className="bg-white dark:bg-[#1f1e1a] p-5 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] hover:border-[#b8af9c] transition-all flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div className="space-y-3">
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isOngoing
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse'
                              : isCompleted
                              ? 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          ● {ann.status || 'Upcoming'}
                        </span>

                        <span className="text-[11px] font-semibold text-[#6b5e10] dark:text-[#eedc82] bg-[#f7f3e8] dark:bg-[#2d2920] px-2.5 py-0.5 rounded-md">
                          {ann.category || 'Weekly Parade'}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] leading-tight">
                        {ann.title}
                      </h3>

                      {/* Event Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#524e43] dark:text-[#c4bdad] pt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                          <span className="font-semibold">{ann.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                          <span>{ann.time || '07:30 AM'}</span>
                        </div>

                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                          <span className="line-clamp-1">{ann.venue || 'NGDC Parade Ground'}</span>
                        </div>

                        {(ann.uniform || ann.dressCode) && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Award className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                            <span>Rig/Uniform: {ann.uniform || ann.dressCode}</span>
                          </div>
                        )}

                        {ann.instructor && (
                          <div className="flex items-center gap-2 sm:col-span-2 text-[11px] text-[#7c7767] dark:text-[#aca596]">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span>Instructor: {ann.instructor}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {ann.description && (
                        <p className="text-xs text-[#615c4d] dark:text-[#a39c8c] line-clamp-2 leading-relaxed pt-1 border-t border-[#eee9dc] dark:border-[#2e2b23]">
                          {ann.description}
                        </p>
                      )}
                    </div>

                    {/* Footer & Actions */}
                    <div className="pt-3 border-t border-[#eee9dc] dark:border-[#2e2b23] flex items-center justify-between text-[11px]">
                      {/* Registration Toggle Status */}
                      <div>
                        {ann.hasRegistrationForm ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Registration Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#7c7767] dark:text-[#8c8575] bg-[#f4f0e6] dark:bg-[#282620] px-2 py-0.5 rounded-md">
                            Registration Closed
                          </span>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEditAnnouncement(ann)}
                          className="px-3 py-1 bg-[#f4f0e6] dark:bg-[#2b2822] text-[#6b5e10] dark:text-[#eedc82] hover:bg-[#eedc82]/30 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setAnnouncementToDelete(ann)}
                          className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
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
      {/* SECTION 2: TRAINING SUBMISSIONS & ATTENDANCE REVIEW                 */}
      {/* ==================================================================== */}
      {activeSubTab === 'submissions' && (
        <div className="space-y-6">
          {/* Controls Bar: Search & Status Filter */}
          <div className="bg-white dark:bg-[#1f1e1a] p-4 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7c7767] dark:text-[#8c8575]" />
                <input
                  type="text"
                  placeholder="Filter cadet submissions by cadet name, cadet number, or form title..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="japandi-input pl-9 pr-3 py-2 text-xs w-full"
                />
              </div>

              <select
                value={submissionStatusFilter}
                onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                className="japandi-input py-2 text-xs text-[#1c1c18] dark:text-[#fcfbf7]"
              >
                <option value="All">Review Status: All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1f1e1a] rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] p-6">
              <FileCheck className="w-12 h-12 text-[#7c7767] dark:text-[#695c4e] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">No Submissions Found</h3>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-1 max-w-sm mx-auto">
                No cadet training or parade attendance submissions match your search parameters.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1f1e1a] rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f7f3e8] dark:bg-[#28251e] border-b border-[#dcd6c8] dark:border-[#3a352b] text-[#615c4d] dark:text-[#aca596] font-bold">
                      <th className="p-3.5">Submission Ref</th>
                      <th className="p-3.5">Form / Event Title</th>
                      <th className="p-3.5">Submitted At</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee9dc] dark:divide-[#2e2b23]">
                    {filteredSubmissions.map((sub) => {
                      const status = sub.status || 'Pending';
                      const isApproved = status === 'Approved';
                      const isRejected = status === 'Rejected';

                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-[#fcf9f3] dark:hover:bg-[#25231c] transition-colors"
                        >
                          <td className="p-3.5 font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                            {sub.id}
                          </td>
                          <td className="p-3.5 font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                            {sub.formTitle || 'Training Attendance Form'}
                          </td>
                          <td className="p-3.5 text-[#7c7767] dark:text-[#aca596]">
                            {sub.submittedAt || 'N/A'}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : isRejected
                                  ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Approve / Reject Buttons */}
                              <button
                                onClick={() => updateTrainingSubmissionStatus(sub.id, 'Approved')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
                                title="Approve Submission"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateTrainingSubmissionStatus(sub.id, 'Rejected')}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                                title="Reject Submission"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedSubmissionForView(sub)}
                                className="p-1.5 text-[#6b5e10] dark:text-[#eedc82] hover:bg-[#eedc82]/20 rounded-lg"
                                title="View Submission Answers"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSubmissionToDelete(sub)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT TRAINING ANNOUNCEMENT                              */}
      {/* ==================================================================== */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1916] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#eee9dc] dark:border-[#2e2b23] pb-4">
              <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>{editingAnnouncement ? 'Edit Training Event' : 'Add New Training Event'}</span>
              </h3>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-1.5 text-[#7c7767] hover:text-black dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Event / Parade Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekly Battalion Drill & Physical Parade 04"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Category
                  </label>
                  <select
                    value={announcementForm.category}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                    className="japandi-input py-2 text-xs w-full text-[#1c1c18] dark:text-[#fcfbf7]"
                  >
                    <option value="Weekly Drill Parade">Weekly Drill Parade</option>
                    <option value="Battalion Winter Camp">Battalion Winter Camp</option>
                    <option value="Firing & Range Training">Firing & Range Training</option>
                    <option value="Physical Fitness Test">Physical Fitness Test</option>
                    <option value="Disaster Management">Disaster Management</option>
                    <option value="Special Event">Special Event</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Event Status
                  </label>
                  <select
                    value={announcementForm.status}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, status: e.target.value })}
                    className="japandi-input py-2 text-xs w-full text-[#1c1c18] dark:text-[#fcfbf7]"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={announcementForm.date}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, date: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Timing
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 07:30 AM - 10:30 AM"
                    value={announcementForm.time}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, time: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Venue / Reporting Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NGDC Parade Ground / Room 123 HQ"
                    value={announcementForm.venue}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, venue: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Dress Code / Uniform */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Uniform / Dress Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BNCC Khaki Uniform, Beret & Belt"
                    value={announcementForm.uniform}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, uniform: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Instructor */}
                <div>
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Instructor / Officer in Charge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Platoon Officer & PUO"
                    value={announcementForm.instructor}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, instructor: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>

                {/* Registration Enabled Toggle */}
                <div className="flex items-center pt-5">
                  <label className="relative inline-flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      checked={announcementForm.hasRegistrationForm}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, hasRegistrationForm: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-[#322f28] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-emerald-600"></div>
                    <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      Enable Public Cadet Registration Form
                    </span>
                  </label>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Event Instructions & Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed instructions regarding parade reporting time, gear to bring, drill syllabus..."
                    value={announcementForm.description}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
                    className="japandi-input py-2 text-xs w-full"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eee9dc] dark:border-[#2e2b23]">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="japandi-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="japandi-btn-primary text-xs">
                  {editingAnnouncement ? 'Save Event Changes' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: VIEW SUBMISSION DETAILS                                      */}
      {/* ==================================================================== */}
      {selectedSubmissionForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1916] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#eee9dc] dark:border-[#2e2b23] pb-3">
              <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Submission Details ({selectedSubmissionForView.id})</span>
              </h3>
              <button
                onClick={() => setSelectedSubmissionForView(null)}
                className="p-1 text-[#7c7767] hover:text-black dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#7c7767] dark:text-[#aca596] block">Form Title:</span>
                <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                  {selectedSubmissionForView.formTitle || 'Training Attendance Form'}
                </span>
              </div>

              <div>
                <span className="font-bold text-[#7c7767] dark:text-[#aca596] block">Submitted At:</span>
                <span className="text-[#1c1c18] dark:text-[#fcfbf7]">
                  {selectedSubmissionForView.submittedAt || 'N/A'}
                </span>
              </div>

              {/* Data JSON / Answers */}
              <div>
                <span className="font-bold text-[#7c7767] dark:text-[#aca596] block mb-1">Submitted Answers:</span>
                <div className="bg-[#f7f3e8] dark:bg-[#25231c] p-3 rounded-xl border border-[#dcd6c8] dark:border-[#3a352b] space-y-1.5 font-mono text-[11px]">
                  {selectedSubmissionForView.data && typeof selectedSubmissionForView.data === 'object' ? (
                    Object.entries(selectedSubmissionForView.data).map(([k, v]) => (
                      <div key={k} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#eee9dc] dark:border-[#2e2b23] pb-1 last:border-0 last:pb-0">
                        <span className="font-bold text-[#6b5e10] dark:text-[#eedc82]">{k}:</span>
                        <span className="text-[#1c1c18] dark:text-[#fcfbf7]">{String(v)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">No additional form data</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eee9dc] dark:border-[#2e2b23]">
              <button
                onClick={() => setSelectedSubmissionForView(null)}
                className="japandi-btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DELETE CONFIRMATION MODAL: ANNOUNCEMENT                              */}
      {/* ==================================================================== */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1916] border border-red-200 dark:border-red-900/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Confirm Event Deletion</h3>
            </div>
            <p className="text-xs text-[#524e43] dark:text-[#c4bdad] leading-relaxed">
              Are you sure you want to delete the training event{' '}
              <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                "{announcementToDelete.title}"
              </span>
              ?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAnnouncementToDelete(null)}
                className="japandi-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAnnouncement}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Yes, Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DELETE CONFIRMATION MODAL: SUBMISSION                                */}
      {/* ==================================================================== */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1916] border border-red-200 dark:border-red-900/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Confirm Submission Deletion</h3>
            </div>
            <p className="text-xs text-[#524e43] dark:text-[#c4bdad] leading-relaxed">
              Are you sure you want to delete submission record{' '}
              <span className="font-bold font-mono text-[#1c1c18] dark:text-[#fcfbf7]">
                {submissionToDelete.id}
              </span>
              ?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSubmissionToDelete(null)}
                className="japandi-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSubmission}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
