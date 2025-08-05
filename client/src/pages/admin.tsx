import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema, type InsertTransaction } from "@shared/schema";
import { Trash2, Plus, Users, Calendar } from "lucide-react";
import { MarketSessionManagement } from "@/components/admin/MarketSessionManagement";

interface Student {
  id: number;
  fullName: string;
  studentId: string;
  email: string;
  major: string;
  phone: string;
  totalPoints: number;
}

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/admin/students"],
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InsertTransaction>({
    resolver: zodResolver(insertTransactionSchema),
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: InsertTransaction) => apiRequest("POST", "/api/admin/transactions", data),
    onSuccess: () => {
      toast({
        title: "Cập nhật điểm thành công!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      setIsUpdateModalOpen(false);
      reset();
      setSelectedStudent(null);
    },
    onError: async (error: any) => {
      const errorResponse = await error.response?.json();
      toast({
        title: "Cập nhật thất bại",
        description: errorResponse?.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/students/${id}`),
    onSuccess: () => {
      toast({
        title: "Xóa sinh viên thành công!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
    },
    onError: async (error: any) => {
      const errorResponse = await error.response?.json();
      toast({
        title: "Xóa thất bại",
        description: errorResponse?.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    },
  });

  const filteredStudents = students?.filter((student) =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleUpdatePoints = (student: Student) => {
    setSelectedStudent(student);
    setValue("studentId", student.id);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteStudent = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
      deleteStudentMutation.mutate(id);
    }
  };

  const onSubmit = (data: InsertTransaction) => {
    createTransactionMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Trang Quản Lý</h2>
          <p className="text-gray-600">Quản lý sinh viên và phiên chợ</p>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Quản lý học sinh</span>
            </TabsTrigger>
            <TabsTrigger value="market-sessions" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Quản lý phiên chợ</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="space-y-6">

        <Card className="shadow-sm border mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sinh viên đã đăng ký</h3>
              <div className="flex space-x-2">
                <Input
                  type="search"
                  placeholder="Tìm kiếm sinh viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">MSSV</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Họ tên</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ngành</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Điểm</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {student.studentId}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {student.fullName}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {student.major}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {student.email}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-primary">
                          {student.totalPoints.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdatePoints(student)}
                            className="text-primary hover:text-green-600"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Cộng điểm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-600">
                        {searchTerm ? "Không tìm thấy sinh viên nào" : "Chưa có sinh viên nào đăng ký"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Update Points Modal */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cập Nhật Điểm</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Sinh viên</Label>
                <Input
                  value={selectedStudent ? `${selectedStudent.fullName} (${selectedStudent.studentId})` : ""}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Loại rác</Label>
                <Select onValueChange={(value) => setValue("wasteType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại rác" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Giấy">Giấy</SelectItem>
                    <SelectItem value="Nhựa">Nhựa</SelectItem>
                    <SelectItem value="Kim loại">Kim loại</SelectItem>
                    <SelectItem value="Giấy, nhựa">Giấy, nhựa</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
                {errors.wasteType && (
                  <p className="text-red-500 text-sm mt-1">{errors.wasteType.message}</p>
                )}
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Số kg</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...register("weight")}
                  placeholder="0.0"
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                )}
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Điểm cộng</Label>
                <Input
                  type="number"
                  {...register("points", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.points && (
                  <p className="text-red-500 text-sm mt-1">{errors.points.message}</p>
                )}
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Quà tặng</Label>
                <Input
                  {...register("gift")}
                  placeholder="Túi vải, cây xanh..."
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-white hover:bg-green-600"
                  disabled={createTransactionMutation.isPending}
                >
                  {createTransactionMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    reset();
                    setSelectedStudent(null);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
          </TabsContent>
          
          <TabsContent value="market-sessions">
            <MarketSessionManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
