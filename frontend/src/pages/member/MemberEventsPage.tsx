import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';

export const MemberEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_EVENTS'>('ALL');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const [eventsRes, dashRes] = await Promise.all([
        apiClient.get('/events?status=UPCOMING'),
        apiClient.get('/dashboard/member'),
      ]);
      setEvents(eventsRes.data || []);

      const enrolledIds: Record<string, boolean> = {};
      dashRes.data?.enrolledEvents?.forEach((r: any) => {
        if (r.status === 'REGISTERED') {
          enrolledIds[r.eventId] = true;
        }
      });
      setEnrolledMap(enrolledIds);
    } catch (err) {
      console.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      await apiClient.post(`/events/${eventId}/register`);
      setEnrolledMap((prev) => ({ ...prev, [eventId]: true }));
      loadEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to RSVP');
    }
  };

  const handleCancel = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to cancel your RSVP?')) return;
    try {
      await apiClient.post(`/events/${eventId}/cancel-registration`);
      setEnrolledMap((prev) => ({ ...prev, [eventId]: false }));
      loadEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const displayedEvents =
    activeTab === 'MY_EVENTS'
      ? events.filter((e) => enrolledMap[e.id])
      : events;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Club Events & Activities
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore upcoming social galas, sports tournaments, seminars, and manage your RSVPs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === 'ALL'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Upcoming Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('MY_EVENTS')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === 'MY_EVENTS'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My RSVPs ({Object.values(enrolledMap).filter(Boolean).length})
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            {activeTab === 'MY_EVENTS'
              ? "You haven't RSVP'd to any upcoming events yet."
              : 'No upcoming club events scheduled.'}
          </div>
        ) : (
          displayedEvents.map((evt) => {
            const isRegistered = enrolledMap[evt.id];
            const isFull = (evt._count?.registrations || 0) >= evt.maxAttendees;

            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {evt.fee > 0 ? `Entry Fee: $${evt.fee}` : 'Free Attendance'}
                    </span>
                    {isRegistered ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        RSVP Confirmed ✓
                      </span>
                    ) : (
                      <Badge status={evt.status} />
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mt-3 leading-snug">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3">
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
                      <span>
                        {evt._count?.registrations || 0} / {evt.maxAttendees} Attending
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {isRegistered ? (
                    <button
                      onClick={() => handleCancel(evt.id)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                    >
                      Cancel RSVP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(evt.id)}
                      disabled={isFull}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition disabled:opacity-50"
                    >
                      {isFull ? 'Event Fully Booked' : 'RSVP / Register'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
