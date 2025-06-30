
import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Package, Clipboard, Users, Settings, Ticket } from "lucide-react";

type MainLayoutProps = {
  children: ReactNode;
  isAdmin?: boolean;
};

export function MainLayout({ children, isAdmin = false }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close sidebar on small screens by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Call once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <CartProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Mobile */}
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <Link to="/" className="flex items-center">
                    <span className="text-pos-primary text-xl font-bold">Kasir Chain POS</span>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3">
                  <ul className="space-y-2">
                    <li>
                      <Link
                        to="/"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/" ? "bg-pos-primary/10 text-pos-primary" : ""
                          }`}
                      >
                        <Home className="mr-3 h-5 w-5" />
                        <span>POS</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/admin" ? "bg-pos-primary/10 text-pos-primary" : ""
                          }`}
                      >
                        <Users className="mr-3 h-5 w-5" />
                        <span>Admin</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/products"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/admin/products" ? "bg-pos-primary/10 text-pos-primary" : ""
                          }`}
                      >
                        <Package className="mr-3 h-5 w-5" />
                        <span>Products</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/orders"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/admin/orders" ? "bg-pos-primary/10 text-pos-primary" : ""
                          }`}
                      >
                        <Clipboard className="mr-3 h-5 w-5" />
                        <span>Orders</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/vouchers"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/vouchers" ? "bg-pos-primary/10 text-pos-primary" : ""
                          }`}
                      >
                        <Ticket className="mr-3 h-5 w-5" />
                        <span>Vouchers</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block bg-white border-r border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between h-16 px-4 border-b">
                  <Link to="/" className="flex items-center">
                    <span className="text-pos-primary text-xl font-bold">Kasir Chain POS</span>
                  </Link>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-2">
                  <Link
                    to="/"
                    className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/" ? "bg-pos-primary/10 text-pos-primary" : ""
                      }`}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    <span>POS</span>
                  </Link>
                  <Link
                    to="/admin"
                    className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/admin" ? "bg-pos-primary/10 text-pos-primary" : ""
                      }`}
                  >
                    <Users className="mr-3 h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                  <Link
                    to="/admin/products"
                    className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/admin/products" ? "bg-pos-primary/10 text-pos-primary" : ""
                      }`}
                  >
                    <Package className="mr-3 h-5 w-5" />
                    <span>Products</span>
                  </Link>
                  <Link
                    to="/admin/orders"
                    className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/admin/orders" ? "bg-pos-primary/10 text-pos-primary" : ""
                      }`}
                  >
                    <Clipboard className="mr-3 h-5 w-5" />
                    <span>Orders</span>
                  </Link>
                  <Link
                    to="/vouchers"
                    className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/vouchers" ? "bg-pos-primary/10 text-pos-primary" : ""
                      }`}
                  >
                    <Ticket className="mr-3 h-5 w-5" />
                    <span>Vouchers</span>
                  </Link>
                </nav>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              className="hidden lg:flex flex-col items-center py-4 bg-white border-r border-gray-200"
            >
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 mb-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center gap-6">
                <Link
                  to="/"
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/" ? "text-pos-primary bg-pos-primary/10" : "text-gray-500"
                    }`}
                >
                  <Home className="h-5 w-5" />
                </Link>
                <Link
                  to="/admin"
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/admin" ? "text-pos-primary bg-pos-primary/10" : "text-gray-500"
                    }`}
                >
                  <Users className="h-5 w-5" />
                </Link>
                <Link
                  to="/admin/products"
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/admin/products" ? "text-pos-primary bg-pos-primary/10" : "text-gray-500"
                    }`}
                >
                  <Package className="h-5 w-5" />
                </Link>
                <Link
                  to="/admin/orders"
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/admin/orders" ? "text-pos-primary bg-pos-primary/10" : "text-gray-500"
                    }`}
                >
                  <Clipboard className="h-5 w-5" />
                </Link>
                <Link
                  to="/vouchers"
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === "/vouchers" ? "text-pos-primary bg-pos-primary/10" : "text-gray-500"
                    }`}
                >
                  <Ticket className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Navbar */}
<header className="bg-white border-b border-gray-200 shadow-sm relative">
  <div className="px-4 flex items-center justify-between relative" style={{ paddingTop: '0.9rem', paddingBottom: '0.8rem' }}>

    {/* KIRI */}
    <div className="flex items-center z-10">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        {/* Icon Hamburger */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
    </div>

    {/* TENGAH */}
    <div className="absolute left-1/2 transform -translate-x-1/2">
      <h1 className="text-pos-primary text-xl font-bold font-semibold text-lg">
        {isAdmin ? "Kasir Chain POS Admin" : "Caffeine Corner Shop"}
      </h1>
    </div>

    {/* KANAN */}
    <div className="flex items-center gap-4 z-10">
      <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
        <Settings className="h-5 w-5" />
      </button>
    </div>

  </div>
</header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
