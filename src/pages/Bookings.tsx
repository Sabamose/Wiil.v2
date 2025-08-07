import { useState } from "react";
import { Calendar, Clock, User, Phone, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock booking data
const mockBookings = [
  {
    id: "1",
    title: "Customer Support Call",
    assistant: "Sarah - Customer Support",
    time: "10:00 AM",
    duration: "30 min",
    customer: "John Smith",
    phone: "+1 (555) 123-4567",
    status: "confirmed",
    date: new Date(2024, 7, 15), // August 15, 2024
  },
  {
    id: "2", 
    title: "Sales Consultation",
    assistant: "Alex - Sales Assistant",
    time: "2:00 PM",
    duration: "45 min",
    customer: "Emma Johnson",
    phone: "+1 (555) 987-6543",
    status: "pending",
    date: new Date(2024, 7, 15),
  },
  {
    id: "3",
    title: "Product Demo",
    assistant: "Mike - Technical Support",
    time: "11:30 AM", 
    duration: "60 min",
    customer: "David Wilson",
    phone: "+1 (555) 456-7890",
    status: "confirmed",
    date: new Date(2024, 7, 16),
  },
  {
    id: "4",
    title: "Follow-up Call",
    assistant: "Sarah - Customer Support", 
    time: "3:30 PM",
    duration: "15 min",
    customer: "Lisa Brown",
    phone: "+1 (555) 234-5678",
    status: "completed",
    date: new Date(2024, 7, 14),
  },
];

const assistants = [
  { id: "all", name: "All Assistants" },
  { id: "sarah", name: "Sarah - Customer Support" },
  { id: "alex", name: "Alex - Sales Assistant" },
  { id: "mike", name: "Mike - Technical Support" },
];

const Bookings = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAssistant, setSelectedAssistant] = useState("all");
  const [currentView, setCurrentView] = useState<"calendar" | "list">("calendar");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = mockBookings.filter(booking => {
    const matchesAssistant = selectedAssistant === "all" || 
      booking.assistant.toLowerCase().includes(selectedAssistant);
    const matchesDate = !selectedDate || 
      booking.date.toDateString() === selectedDate.toDateString();
    
    return currentView === "list" ? matchesAssistant : matchesAssistant && matchesDate;
  });

  const todayBookings = mockBookings.filter(booking => 
    booking.date.toDateString() === new Date().toDateString()
  );

  const upcomingBookings = mockBookings.filter(booking => 
    booking.date > new Date() && booking.status === "confirmed"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="ml-60 mt-16 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bookings & Calendar</h1>
              <p className="text-gray-600">Manage your assistant appointments and availability</p>
            </div>
            <div className="flex gap-3">
              <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assistants.map(assistant => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayBookings.length}</div>
                <p className="text-xs text-muted-foreground">
                  {todayBookings.filter(b => b.status === "confirmed").length} confirmed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingBookings.length}</div>
                <p className="text-xs text-muted-foreground">
                  Next 7 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBookings.length}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "calendar" | "list")}>
            <TabsList>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Select Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      modifiers={{
                        booked: mockBookings.map(b => b.date)
                      }}
                      modifiersClassNames={{
                        booked: "bg-blue-100 text-blue-900 font-medium"
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Selected Date Bookings */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedDate ? `Bookings for ${selectedDate.toLocaleDateString()}` : "Select a date"}
                    </CardTitle>
                    <CardDescription>
                      {filteredBookings.length} appointment{filteredBookings.length !== 1 ? 's' : ''} scheduled
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredBookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No bookings for this date</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{booking.time}</span>
                                  <span className="text-sm text-gray-500">({booking.duration})</span>
                                </div>
                                <span className="text-sm text-gray-600">{booking.assistant}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="font-medium">{booking.title}</div>
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {booking.customer}
                                </div>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Bookings</CardTitle>
                  <CardDescription>
                    Complete list of assistant appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col">
                            <div className="font-medium">{booking.title}</div>
                            <div className="text-sm text-gray-600">{booking.assistant}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-medium">{booking.date.toLocaleDateString()}</div>
                            <div className="text-sm text-gray-600">{booking.time} ({booking.duration})</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{booking.customer}</div>
                            <div className="text-sm text-gray-600">{booking.phone}</div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Bookings;