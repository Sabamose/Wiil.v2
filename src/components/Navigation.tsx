import { Home, BarChart3, MessageCircle, Bot, BookOpen } from "lucide-react";

const Navigation = () => {
  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-100 bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="text-lg font-semibold">Wiil</span>
          <span className="text-xs text-gray-500 font-normal">Preview Version</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>🌙</span>
          <span>Current balance: $3.00</span>
          <span>SM</span>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 py-6 overflow-y-auto">
        <a href="#" className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <span className="w-5 h-5 flex items-center justify-center">🏠</span>
          Home
        </a>
        <a href="#" className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <span className="w-5 h-5 flex items-center justify-center">📊</span>
          Analytics
        </a>
        <a href="#" className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <span className="w-5 h-5 flex items-center justify-center">💬</span>
          Conversations
        </a>
        <a href="#" className="flex items-center gap-3 px-6 py-3 text-blue-500 bg-blue-50 border-l-3 border-blue-500 font-medium">
          <span className="w-5 h-5 flex items-center justify-center">🤖</span>
          My Assistants
        </a>
        <a href="#" className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <span className="w-5 h-5 flex items-center justify-center">📚</span>
          Knowledge Base
        </a>
      </nav>
    </>
  );
};

export default Navigation;