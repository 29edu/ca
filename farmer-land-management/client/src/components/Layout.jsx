import Sidebar from './Sidebar'; // Import the new component

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar (Fixed Left) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header (Optional - good for user profile or titles) */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
          <h2 className="text-gray-500 text-sm font-medium">
             Admin Portal
          </h2>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">
                A
             </div>
             <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;