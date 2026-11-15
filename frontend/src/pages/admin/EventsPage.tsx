import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  UserCheck,
} from 'lucide-react';
import { ClubEvent, EventStatus, RegistrationStatus } from '../../types';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAttendeesOpen, setIsAttendeesOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    location: '',
    startDateTime: '',
    endDateTime: '',
    maxAttendees: 50,
    fee: 0,
    status: 'UPCOMING' as EventStatus,
  });

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/events', { params });
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/events', {
        title: form.title,
        description: form.description,
        location: form.location,
        startDateTime: new Date(form.startDateTime).toISOString(),
        endDateTime: form.endDateTime ? new Date(form.endDateTime).toISOString() : undefined,
        maxAttendees: Number(form.maxAttendees),
        fee: Number(form.fee),
        status: form.status,
      });
      setIsAddOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/events/${form.id}`, {
        title: form.title,
        description: form.description,
        location: form.location,
        startDateTime: new Date(form.startDateTime).toISOString(),
        endDateTime: form.endDateTime ? new Date(form.endDateTime).toISOString() : undefined,
        maxAttendees: Number(form.maxAttendees),
        fee: Number(form.fee),
        status: form.status,
      });
      setIsEditOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await apiClient.delete(`/events/${id}`);
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const openAttendees = async (id: string) => {
    try {
      const res = await apiClient.get(`/events/${id}`);
      setSelectedEvent(res.data);
      setIsAttendeesOpen(true);
    } catch (err) {
      console.error('Failed to load attendees');
    }
  };

  const handleCheckIn = async (registrationId: string, currentStatus: RegistrationStatus) => {
    const nextStatus = currentStatus === 'ATTENDED' ? 'REGISTERED' : 'ATTENDED';
    try {
      await apiClient.patch(`/events/registrations/${registrationId}/status`, {
        status: nextStatus,
      });
      // Refresh attendees view
      if (selectedEvent) {
        openAttendees(selectedEvent.id);
      }
    } catch (err) {
      alert('Failed to update attendance status');
    }
  };

  const openEdit = (evt: ClubEvent) => {
    setForm({
      id: evt.id,
      title: evt.title,
      description: evt.description || '',
      location: evt.location,
      startDateTime: evt.startDateTime ? evt.startDateTime.substring(0, 16) : '',
      endDateTime: evt.endDateTime ? evt.endDateTime.substring(0, 16) : '',
      maxAttendees: evt.maxAttendees,
      fee: evt.fee,
      status: evt.status,
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setForm({
      id: '',
      title: '',
      description: '',
      location: '',
      startDateTime: '',
      endDateTime: '',
      maxAttendees: 50,
      fee: 0,
      status: 'UPCOMING',
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Events & Activities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize tournaments, galas, workshops, and manage attendee rosters.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" /> Create New Event
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
          Status:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Events</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No club events found.
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {evt.fee > 0 ? `Entry: $${evt.fee}` : 'Free Attendance'}
                  </span>
                  <Badge status={evt.status} />
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mt-3 leading-snug">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {evt.description || 'No description provided.'}
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>
                      {new Date(evt.startDateTime).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{evt.location}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      {evt._count?.registrations || 0} / {evt.maxAttendees} Enrolled
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => openAttendees(evt.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold rounded-xl transition"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Attendees ({evt._count?.registrations || 0})
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(evt)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(evt.id, evt.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Event Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        title={isEditOpen ? 'Edit Club Event' : 'Create New Club Event'}
      >
        <form onSubmit={isEditOpen ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Championship Dinner"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location / Venue</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Grand Ballroom or Tennis Court 1"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={form.startDateTime}
                onChange={(e) => setForm({ ...form, startDateTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={form.endDateTime}
                onChange={(e) => setForm({ ...form, endDateTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Max Capacity</label>
              <input
                type="number"
                min="1"
                required
                value={form.maxAttendees}
                onChange={(e) => setForm({ ...form, maxAttendees: parseInt(e.target.value) || 50 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fee ($ USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-sky-500"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Event details, agenda, and dress code..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
            >
              {isEditOpen ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Attendees Roster & Check-In Modal */}
      <Modal
        isOpen={isAttendeesOpen}
        onClose={() => setIsAttendeesOpen(false)}
        title={selectedEvent ? `Attendee Roster — ${selectedEvent.title}` : 'Attendee Roster'}
        maxWidth="max-w-2xl"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 p-3 bg-slate-50 rounded-xl">
              <span>Venue: {selectedEvent.location}</span>
              <span>
                Total Registered: {selectedEvent.registrations?.length || 0} / {selectedEvent.maxAttendees}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">Member</th>
                    <th className="px-4 py-2.5">Code</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedEvent.registrations?.map((r: any) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {r.member?.firstName} {r.member?.lastName}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {r.member?.memberCode}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleCheckIn(r.id, r.status)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                            r.status === 'ATTENDED'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-sky-600 text-white hover:bg-sky-700'
                          }`}
                        >
                          {r.status === 'ATTENDED' ? 'Checked-In ✓' : 'Mark Checked-In'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!selectedEvent.registrations || selectedEvent.registrations.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 italic">
                        No members have registered for this event yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
