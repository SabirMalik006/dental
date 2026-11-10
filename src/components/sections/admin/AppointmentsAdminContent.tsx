'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Search,
  CheckSquare,
  X,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  Trash2,
  Loader,
} from 'lucide-react';
import { Service, Doctor } from '@/types';
import PatientContactInfo from '@/components/shared/PatientContactInfo';

interface AppointmentsAdminContentProps {
  services: Service[];
  doctors: Doctor[];
}

export const AppointmentsAdminContent: React.FC<AppointmentsAdminContentProps> = ({ services, doctors }) => {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [activeStatus, setActiveStatus] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('confirmed');

  // Detail Drawer
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [detailStatus, setDetailStatus] = useState('pending');
  const [internalNote, setInternalNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (activeStatus !== 'all') params.set('status', activeStatus);
      if (selectedService !== 'all') params.set('serviceId', selectedService);
      if (selectedDoctor !== 'all') params.set('doctorId', selectedDoctor);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeStatus, selectedService, selectedDoctor]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleOpenDetail = async (item: any) => {
    setSelectedItem(item);
    setDetailStatus(item.status);
    setInternalNote(item.internalNote || '');

    if (!item.isRead) {
      try {
        await fetch(`/api/admin/appointments/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        });
        setAppointments((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, isRead: true } : a))
        );
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveDetail = async () => {
    if (!selectedItem) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/appointments/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: detailStatus,
          internalNote,
        }),
      });
      if (!res.ok) throw new Error('Failed to update appointment');
      const updated = await res.json();

      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setSelectedItem(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment request?')) return;
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(appointments.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'markRead' | 'updateStatus' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm(`Delete ${selectedIds.length} selected appointments?`)) return;

    try {
      const res = await fetch('/api/admin/appointments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action,
          status: action === 'updateStatus' ? bulkStatus : undefined,
        }),
      });

      if (!res.ok) throw new Error('Bulk action failed');
      setSelectedIds([]);
      fetchAppointments();
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-green-700 bg-green-50 border border-green-200/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'rescheduled':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-yellow-700 bg-yellow-50 border border-yellow-200/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            <RefreshCw className="w-3 h-3" /> Rescheduled
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 border border-red-200/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 border border-blue-200/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            <CheckSquare className="w-3 h-3" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-yellow-500" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans p-6 text-sm text-slate-800">
      {/* Page Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900">
            Appointment Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage online patient consultation requests and schedule assignments.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Requests
        </button>
      </header>

      {/* Filter Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-xs text-slate-600 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-xs text-slate-600 cursor-pointer"
            >
              <option value="all">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-xs text-slate-600 cursor-pointer"
            >
              <option value="all">All Specialists</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </form>
      </div>

      {/* Bulk Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 select-none">
          <span className="text-xs font-bold text-primary">
            {selectedIds.length} appointment(s) selected
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleBulkAction('markRead')}
              className="px-3.5 py-1.5 rounded-lg bg-white border text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Mark Read
            </button>

            <div className="flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white border text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <option value="confirmed">Confirmed</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => handleBulkAction('updateStatus')}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover cursor-pointer"
              >
                Apply Status
              </button>
            </div>

            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Data Table (CSS Grid) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 w-full">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[960px]">
            {/* Table Headings */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/75 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider select-none text-left">
              <div className="col-span-1 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={
                    appointments.length > 0 && selectedIds.length === appointments.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                />
              </div>
              <div className="col-span-1 text-center">Read</div>
              <div className="col-span-3">Patient Info</div>
              <div className="col-span-1">Service</div>
              <div className="col-span-1">Doctor</div>
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-50 overflow-y-auto max-h-[60vh] flex flex-col text-left font-sans">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-slate-400 text-xs">
                  <Loader className="w-4 h-4 animate-spin" /> Loading appointments...
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No appointment requests found matching filters.
                </div>
              ) : (
                appointments.map((a) => (
                  <div
                    key={a.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all ${
                      !a.isRead ? 'bg-primary-light/10 hover:bg-primary-light/20' : 'bg-white'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(a.id)}
                        onChange={() => handleSelectRow(a.id)}
                        className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>

                    {/* Read dot */}
                    <div className="col-span-1 flex justify-center">
                      {!a.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" title="Unread" />
                      )}
                    </div>

                    {/* Patient Info */}
                    <div 
                      onClick={() => handleOpenDetail(a)}
                      className="col-span-3 flex flex-col cursor-pointer"
                    >
                      <PatientContactInfo
                        name={a.patientName}
                        email={a.email}
                        phone={a.phone}
                        whatsapp={a.whatsapp || a.phone}
                      />
                    </div>

                    {/* Service */}
                    <div className="col-span-1 font-bold text-primary text-xs truncate" title={a.service?.title || a.serviceTitle || 'Unknown Service'}>
                      {a.service?.title || a.serviceTitle || 'Unknown Service'}
                    </div>

                    {/* Doctor */}
                    <div className="col-span-1 text-xs truncate">
                      {a.doctor ? (
                        <span className="font-semibold text-slate-900">{a.doctor.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Any</span>
                      )}
                    </div>

                    {/* Date & Time */}
                    <div className="col-span-2 text-xs">
                      {a.preferredDate ? (
                        <div className="font-semibold text-slate-800">
                          {new Date(a.preferredDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-slate-400 italic">No date</div>
                      )}
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {a.preferredTime || 'Any Time'}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 text-center">
                      {getStatusBadge(a.status)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 text-right flex justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(a)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="View full details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOne(a.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Delete appointment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL SLIDE-OVER DRAWER */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end text-slate-800">
          <div className="absolute inset-0" onClick={() => setSelectedItem(null)} />

          <div className="relative w-full max-w-lg bg-white h-screen flex flex-col shadow-2xl overflow-hidden animate-slide-in-right z-10 text-left">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Appointment Details
                </span>
                <h3 className="font-bold text-lg font-sans text-slate-900 leading-tight">
                  {selectedItem.patientName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Service</span>
                  <span className="font-bold text-primary text-sm mt-0.5 block">
                    {selectedItem.service?.title || selectedItem.serviceTitle}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Doctor</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {selectedItem.doctor ? selectedItem.doctor.name : 'No Preference'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Age</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {selectedItem.age ?? '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Gender</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {selectedItem.gender || '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>{selectedItem.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{selectedItem.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {selectedItem.preferredDate
                      ? new Date(selectedItem.preferredDate).toLocaleDateString()
                      : 'No date requested'}{' '}
                    ({selectedItem.preferredTime || 'Any Time'})
                  </span>
                </div>
              </div>

              {selectedItem.notes && (
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wide">Patient Notes</span>
                  <div className="p-4 bg-slate-50 border rounded-2xl text-xs leading-relaxed text-slate-700">
                    {selectedItem.notes}
                  </div>
                </div>
              )}

              {/* Status Selector */}
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <label className="font-bold text-slate-500 text-[10px] uppercase tracking-wide">Update Status</label>
                <select
                  value={detailStatus}
                  onChange={(e) => setDetailStatus(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-slate-800 cursor-pointer text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Internal Notes */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-500 text-[10px] uppercase tracking-wide">Internal Clinic Notes (Private)</label>
                <textarea
                  rows={3}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add private staff notes, appointment confirmation details..."
                  className="px-4 py-3 bg-[#F0F0F0] border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs resize-none"
                />
              </div>
            </div>

            <footer className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 border rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDetail}
                disabled={updating}
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-xs font-bold transition shadow cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsAdminContent;
