import { Home, MessageCircle, Bot, BookOpen, Phone, BarChart3, Zap, Users, FileText, Globe, CreditCard } from "lucide-react";

const Navigation = () => {
  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-100 bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="text-lg font-semibold">Wiil</span>
          <span className="text-xs text-gray-500 font-normal">Preview Version</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="w-5 h-5 text-gray-600">🌙</span>
          <span>Current balance: $3.00</span>
          <span>SM</span>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 py-6 overflow-y-auto">
        {/* HOME Section */}
        <div className="mb-6">
          <div className="px-6 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">HOME</h3>
          </div>
          <a href="#" className="flex items-center gap-3 px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <BarChart3 className="w-5 h-5" />
            Analytics
          </a>
          <a href="#" className="flex items-center gap-3 px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <MessageCircle className="w-5 h-5" />
            Conversations
          </a>
        </div>

        {/* ASSISTANTS Section */}
        <div className="mb-6">
          <div className="px-6 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ASSISTANTS</h3>
          </div>
          <a href="#" className="flex items-center gap-3 px-6 py-2 text-emerald-600 hover:bg-gray-50 transition-all">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <Zap className="w-5 h-5" />
            Quick Setup
            <div className="w-2 h-2 bg-emerald-500 rounded-full ml-auto"></div>
          </a>
          <a href="#" className="flex items-center justify-between px-6 py-2 text-gray-900 bg-gray-100 border-l-3 border-gray-900 font-medium">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5" />
              My Assistants
            </div>
            <span className="text-sm text-gray-500">5</span>
          </a>
          <a href="#" className="flex items-center justify-between px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              Assistant Roles
            </div>
            <span className="text-sm text-gray-500">4</span>
          </a>
          <a href="#" className="flex items-center justify-between px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              Knowledge Base
            </div>
            <span className="text-sm text-gray-500">3</span>
          </a>
        </div>

        {/* COMMUNICATION CHANNELS Section */}
        <div className="mb-6">
          <div className="px-6 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">COMMUNICATION CHANNELS</h3>
          </div>
          <a href="/phone-numbers" className="flex items-center justify-between px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              Phone Numbers
            </div>
            <span className="text-sm text-gray-500">8</span>
          </a>
          <a href="#" className="flex items-center justify-between px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5" />
              Website
            </div>
            <span className="text-sm text-gray-500">1</span>
          </a>
        </div>

        {/* BILLING Section */}
        <div>
          <div className="px-6 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">BILLING</h3>
          </div>
          <a href="#" className="flex items-center gap-3 px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <CreditCard className="w-5 h-5" />
            Billing
          </a>
        </div>
      </nav>
    </>
  );
};

export default Navigation;