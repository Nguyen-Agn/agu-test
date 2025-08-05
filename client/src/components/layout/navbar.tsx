import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  student?: {
    id: number;
    fullName: string;
    studentId: string;
  };
  isAdmin?: boolean;
}

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/me"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      // Clear session storage
      localStorage.removeItem("sessionId");
      // Invalidate queries
      queryClient.clear();
      // Redirect to home
      setLocation("/");
      toast({
        title: "Đăng xuất thành công",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: "/", label: "Trang chủ" },
    ...(user?.student ? [{ path: "/dashboard", label: "Điểm của tôi" }] : []),
    ...(user?.isAdmin ? [
      { path: "/admin", label: "Quản lý" },
      { path: "/data-management", label: "Dữ liệu" }
    ] : []),
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl font-bold text-primary cursor-pointer">
                🌱 Chợ Xanh
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`nav-btn ${
                    location === item.path
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
            
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    {user.student && (
                      <span className="text-sm text-gray-600">
                        {user.student.fullName}
                      </span>
                    )}
                    {user.isAdmin && (
                      <span className="text-sm text-gray-600">
                        Admin
                      </span>
                    )}
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      disabled={logoutMutation.isPending}
                    >
                      Đăng xuất
                    </Button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button className="bg-primary text-white hover:bg-green-600">
                      Đăng nhập
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
