import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Booking } from '@/types/booking';
import { Search } from 'lucide-react';

interface BookingCalendarProps {
  bookings: Booking[];
  assistants: { id: string; name: string }[];
  onBookingSelect: (booking: Booking) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  onBookingSelect,
}) => {
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'list'>('list');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Apply filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(booking => {
        return activeFilters.some(filter => {
          if (filter === 'needs-confirmation') return booking.status === 'pending';
          return booking.source === filter;
        });
      });
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [bookings, activeFilters, searchQuery]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const renderListView = () => {
    const sortedBookings = [...filteredBookings].sort((a, b) => 
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBookings.map((booking) => {
              const statusHTML = booking.status === 'pending' ? (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                  Needs Confirmation
                </span>
              ) : (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Confirmed
                </span>
              );

              const sourceHTML = booking.source === 'website' ? (
                <span>💬 Website</span>
              ) : (
                <span>📞 Phone/SMS</span>
              );

              return (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onBookingSelect(booking)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.start_time).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.customer_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                     {booking.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sourceHTML}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {statusHTML}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className="text-sky-600 hover:text-sky-900">View</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPlaceholderView = (viewName: string) => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <p className="text-gray-500">{viewName} view coming soon</p>
        <p className="text-sm text-gray-400 mt-2">Use List view to see all appointments</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        {/* Filters */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Button
            onClick={() => toggleFilter('needs-confirmation')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-1.5 ${
              activeFilters.includes('needs-confirmation')
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'text-amber-800 bg-amber-100 border-amber-200'
            } border`}
            variant="outline"
          >
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            <span>Needs Follow-up</span>
          </Button>
          <Button
            onClick={() => toggleFilter('phone')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full ${
              activeFilters.includes('phone')
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'text-gray-600 bg-gray-100 border-gray-200'
            } border`}
            variant="outline"
          >
            📞 Phone & SMS Bookings
          </Button>
          <Button
            onClick={() => toggleFilter('website')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full ${
              activeFilters.includes('website')
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'text-gray-600 bg-gray-100 border-gray-200'
            } border`}
            variant="outline"
          >
            💬 Website Bookings
          </Button>
        </div>

        {/* Search and View Toggles */}
        <div className="flex items-center space-x-4">
          <div className="relative w-full max-w-xs">
            <Input
              type="text"
              placeholder="Search customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-1.5 w-full text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center border border-gray-300 rounded-full text-sm">
            {['month', 'week', 'day', 'list'].map((view) => (
              <Button
                key={view}
                onClick={() => setCurrentView(view as any)}
                className={`px-4 py-1.5 ${
                  currentView === view ? 'bg-gray-200 font-semibold' : ''
                } ${view === 'month' ? 'rounded-l-full' : ''} ${
                  view === 'list' ? 'rounded-r-full' : ''
                }`}
                variant="ghost"
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Views Container */}
      <div>
        {currentView === 'month' && (
          <div>
            {renderPlaceholderView('Month')}
          </div>
        )}
        {currentView === 'week' && (
          <div>
            {renderPlaceholderView('Week')}
          </div>
        )}
        {currentView === 'day' && (
          <div>
            {renderPlaceholderView('Day')}
          </div>
        )}
        {currentView === 'list' && renderListView()}
      </div>
    </div>
  );
};