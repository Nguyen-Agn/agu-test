import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackupRestore from "@/components/data-management/BackupRestore";
import { localDB } from "@/lib/localStorageDb";
import { useQuery } from "@tanstack/react-query";
import { Database, Users, ArrowRightLeft, Calendar, HardDrive } from "lucide-react";

export default function DataManagement() {
  const { data: students } = useQuery({
    queryKey: ['/api/admin/students'],
    queryFn: () => localDB.getAllStudents(),
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/admin/transactions'],
    queryFn: () => localDB.getAllTransactions(),
  });

  const { data: marketSessions } = useQuery({
    queryKey: ['/api/market-sessions'],
    queryFn: () => localDB.getAllMarketSessions(),
  });

  const storageSize = localDB.getStorageSize();
  const lastBackup = localDB.getLastBackupDate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý dữ liệu</h1>
          <p className="text-muted-foreground">
            Sao lưu, khôi phục và quản lý dữ liệu hệ thống
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sinh viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phiên chợ</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketSessions?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dung lượng</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageSize}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="backup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backup">Sao lưu & Khôi phục</TabsTrigger>
          <TabsTrigger value="info">Thông tin hệ thống</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-4">
          <BackupRestore />
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Thông tin lưu trữ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Phương thức lưu trữ:</span>
                  <span className="font-medium">LocalStorage</span>
                </div>
                <div className="flex justify-between">
                  <span>Dung lượng sử dụng:</span>
                  <span className="font-medium">{storageSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sao lưu gần nhất:</span>
                  <span className="font-medium">
                    {lastBackup ? lastBackup.toLocaleString('vi-VN') : 'Chưa có'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className="font-medium text-green-600">Hoạt động tốt</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ưu điểm LocalStorage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-sm">Không cần internet để hoạt động</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-sm">Dữ liệu lưu vĩnh viễn trong trình duyệt</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-sm">Tốc độ truy cập nhanh</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-sm">Có thể backup và khôi phục dữ liệu</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-sm">Hoạt động trên website tĩnh</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn bảo mật dữ liệu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p><strong>1. Sao lưu thường xuyên:</strong></p>
                  <p className="text-muted-foreground ml-4">
                    Tải xuống file backup ít nhất 1 tuần/lần
                  </p>
                  
                  <p><strong>2. Lưu trữ backup an toàn:</strong></p>
                  <p className="text-muted-foreground ml-4">
                    Lưu file backup ở nhiều nơi: Google Drive, email, USB...
                  </p>
                  
                  <p><strong>3. Kiểm tra định kỳ:</strong></p>
                  <p className="text-muted-foreground ml-4">
                    Thử khôi phục backup để đảm bảo file hoạt động tốt
                  </p>
                  
                  <p><strong>4. Cẩn thận khi xóa dữ liệu:</strong></p>
                  <p className="text-muted-foreground ml-4">
                    Luôn sao lưu trước khi thực hiện thao tác nguy hiểm
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giới hạn & Lưu ý</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p><strong>Dung lượng:</strong></p>
                  <p className="text-muted-foreground ml-4">
                    LocalStorage giới hạn khoảng 5-10MB mỗi domain
                  </p>
                  
                  <p><strong>Bảo mật:</strong></p>
                  <p className="text-muted-foreground ml-4">
                    Dữ liệu lưu trên máy tính của người dùng
                  </p>
                  
                  <p><strong>Đồng bộ:</strong></p>
                  <p className="text-muted-foreground ml-4">
                    Không tự động đồng bộ giữa các thiết bị
                  </p>
                  
                  <p><strong>Xóa dữ liệu:</strong></p>
                  <p className="text-muted-foreground ml-4">
                    Dữ liệu có thể bị xóa khi xóa cache trình duyệt
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}