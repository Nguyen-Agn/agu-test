import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertStudentSchema, type InsertStudent } from "@shared/schema";
import { z } from "zod";

const registrationSchema = insertStudentSchema.extend({
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data: InsertStudent) => apiRequest("POST", "/api/register", data),
    onSuccess: async (response) => {
      const result = await response.json();
      // Store session ID
      localStorage.setItem("sessionId", result.sessionId);
      // Set up API requests to include session ID
      queryClient.setQueryData(["/api/me"], { student: result.student });
      
      toast({
        title: "Đăng ký thành công!",
        description: "Chào mừng bạn đến với Chợ Xanh!",
      });
      setLocation("/dashboard");
    },
    onError: async (error: any) => {
      const errorResponse = await error.response?.json();
      toast({
        title: "Đăng ký thất bại",
        description: errorResponse?.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    const { confirmPassword, ...studentData } = data;
    registerMutation.mutate(studentData);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng Ký Tham Gia</h2>
          <p className="text-gray-600">Điền thông tin để tham gia chương trình</p>
        </div>

        <Card className="shadow-sm border p-8">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Nhập họ và tên đầy đủ"
                  className="w-full"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Mã số sinh viên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="studentId"
                  {...register("studentId")}
                  placeholder="VD: 2021001234"
                  className="w-full"
                />
                {errors.studentId && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="student@university.edu.vn"
                  className="w-full"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngành học <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue("major", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn ngành học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cntt">Công nghệ thông tin</SelectItem>
                    <SelectItem value="kt">Kinh tế</SelectItem>
                    <SelectItem value="nn">Ngoại ngữ</SelectItem>
                    <SelectItem value="sp">Sư phạm</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
                {errors.major && (
                  <p className="text-red-500 text-sm mt-1">{errors.major.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="0901234567"
                  className="w-full"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
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

              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-white py-3 font-medium hover:bg-green-600"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký tham gia"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
