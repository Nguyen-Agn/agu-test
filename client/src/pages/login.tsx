import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginData } from "@shared/schema";
import { Link } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => apiRequest("POST", "/api/login", data),
    onSuccess: (result) => {
      // Store session ID in the way sessionManager expects
      localStorage.setItem("sessionId", result.sessionId);
      
      // Set user data for cache - need to format properly for navbar
      if (result.isAdmin) {
        queryClient.setQueryData(["/api/me"], { 
          isAdmin: true, 
          admin: { username: "admin" } 
        });
      } else {
        // Need to get student data for proper cache
        queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      }
      
      toast({
        title: "Đăng nhập thành công!",
      });
      
      if (result.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng Nhập</h2>
          <p className="text-gray-600">Đăng nhập để xem điểm tích lũy của bạn</p>
        </div>

        <Card className="shadow-sm border p-8">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  MSSV hoặc Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="identifier"
                  {...register("identifier")}
                  placeholder="Nhập MSSV hoặc username admin"
                  className="w-full"
                />
                {errors.identifier && (
                  <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Nhập mật khẩu"
                  className="w-full"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-white py-3 font-medium hover:bg-green-600"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="text-primary hover:text-green-600 font-medium">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <strong>Tài khoản demo:</strong><br />
              Admin: username "admin", password "admin123"
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
