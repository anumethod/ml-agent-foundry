import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { 
  Bot, 
  Gauge, 
  ServerCog, 
  Library,
  ListTodo, 
  CheckCheck, 
  BarChart3, 
  Shield, 
  Crown,
  Menu,
  X,
  Settings,
  User,
  Zap
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Gauge },
  { name: "Agent Factory", href: "/agents", icon: ServerCog },
  { name: "Agent Library", href: "/library", icon: Library },
  { name: "National Reserve", href: "/national-reserve", icon: Crown },
  { name: "Data Flywheel", href: "/data-flywheel", icon: Zap },
  { name: "Task Queue", href: "/tasks", icon: ListTodo },
  { name: "Approvals", href: "/approvals", icon: CheckCheck },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Security", href: "/security", icon: Shield },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { connectionStatus } = useWebSocket();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md shadow-lg"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 z-40",
        // Mobile styles
        "fixed lg:relative h-full",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        // Desktop styles
        isCollapsed ? "lg:w-16" : "lg:w-64",
        // Mobile always full width when open
        "w-64"
      )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="text-white text-lg" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Agent Factory</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Neurodivergence Framework</p>
              </div>
            )}
          </div>
          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 rounded-lg transition-colors",
                  isCollapsed ? "justify-center" : "space-x-3",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary text-gray-700 dark:text-white font-medium"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.name}</span>
                    {item.name === "Task Queue" && (
                      <span className="ml-auto bg-warning text-white text-xs px-2 py-1 rounded-full">
                        12
                      </span>
                    )}
                    {item.name === "Approvals" && (
                      <span className="ml-auto bg-error text-white text-xs px-2 py-1 rounded-full">
                        5
                      </span>
                    )}
                    {item.name === "Security" && (
                      <div className={cn(
                        "ml-auto w-2 h-2 rounded-full",
                        connectionStatus === "connected" ? "bg-secure" : "bg-error"
                      )} />
                    )}
                  </>
                )}
              </a>
            </Link>
          );
        })}
        
        <Link href="/settings">
          <a className={cn(
            "flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
            isCollapsed ? "justify-center" : "space-x-3"
          )}
          title={isCollapsed ? "Settings" : undefined}
          onClick={() => setIsMobileOpen(false)}>
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span>Settings</span>}
          </a>
        </Link>
      </nav>
      
      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {(user as any)?.email ? (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {(user as any).email.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="text-gray-600 dark:text-gray-300 text-sm" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {(user as any)?.email || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Admin
              </p>
            </div>
            <div className={cn(
              "w-2 h-2 rounded-full",
              connectionStatus === "connected" ? "bg-secure" : "bg-error"
            )} />
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {(user as any)?.email ? (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {(user as any).email.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="text-gray-600 dark:text-gray-300 text-sm" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
