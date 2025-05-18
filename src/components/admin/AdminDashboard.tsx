
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: currentPath === "/admin",
    },
    {
      title: "Produk",
      icon: Package,
      href: "/admin/products",
      active: currentPath === "/admin/products",
    },
    {
      title: "Pesanan",
      icon: ShoppingCart,
      href: "/admin/orders",
      active: currentPath === "/admin/orders",
    },
    {
      title: "Pelanggan",
      icon: Users,
      href: "/admin/customers",
      active: currentPath === "/admin/customers",
    },
    {
      title: "Laporan",
      icon: BarChart,
      href: "/admin/reports",
      active: currentPath === "/admin/reports",
    },
    {
      title: "Pengaturan",
      icon: Settings,
      href: "/admin/settings",
      active: currentPath === "/admin/settings",
    },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-card">
          <div className="flex items-center h-16 px-6 border-b">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          <div className="flex-grow flex flex-col p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-md",
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.title}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center mr-3">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role === "admin" ? "Administrator" : "Staff"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-b bg-card">
        <div className="flex items-center h-16 px-6">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
        <div className="flex overflow-x-auto px-6 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                "flex flex-col items-center px-3 py-2 whitespace-nowrap",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 p-6">
        <Outlet />
      </div>
    </div>
  );
}
