import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { localDB } from "@/lib/localStorageDb";
import { Download, Upload, Trash2, Database, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function BackupRestore() {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const data = localDB.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cho-xanh-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Xuất dữ liệu thành công",
        description: "File backup đã được tải xuống",
      });
    } catch (error) {
      toast({
        title: "Lỗi xuất dữ liệu",
        description: "Không thể tạo file backup",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = localDB.importData(content);
        
        if (success) {
          toast({
            title: "Nhập dữ liệu thành công",
            description: "Dữ liệu đã được khôi phục",
          });
          // Reload page to reflect changes
          window.location.reload();
        } else {
          toast({
            title: "Lỗi nhập dữ liệu",
            description: "File backup không hợp lệ",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi đọc file",
          description: "Không thể đọc file backup",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
        // Reset input
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleClearData = () => {
    try {
      localDB.clearAllData();
      toast({
        title: "Xóa dữ liệu thành công",
        description: "Tất cả dữ liệu đã được xóa và khởi tạo lại",
      });
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      toast({
        title: "Lỗi xóa dữ liệu",
        description: "Không thể xóa dữ liệu",
        variant: "destructive",
      });
    }
  };

  const lastBackup = localDB.getLastBackupDate();
  const storageSize = localDB.getStorageSize();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Sao lưu dữ liệu
            </CardTitle>
            <CardDescription>
              Tải xuống tất cả dữ liệu thành file JSON để bảo vệ thông tin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Sao lưu gần nhất:
              </span>
              <span className="font-medium">
                {lastBackup ? lastBackup.toLocaleString('vi-VN') : 'Chưa có'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Dung lượng dữ liệu:
              </span>
              <span className="font-medium">{storageSize}</span>
            </div>
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Tải xuống backup
            </Button>
            <Button 
              onClick={() => {
                localDB.resetAdminPassword();
                toast({
                  title: "Reset mật khẩu admin thành công",
                  description: "Username: admin, Password: NoAdmin123",
                });
              }} 
              variant="outline" 
              className="w-full"
            >
              Reset mật khẩu admin
            </Button>
          </CardContent>
        </Card>

        {/* Restore Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Khôi phục dữ liệu
            </CardTitle>
            <CardDescription>
              Tải lên file backup để khôi phục dữ liệu đã lưu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backup-file">Chọn file backup</Label>
              <Input
                id="backup-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>⚠️ Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Vùng nguy hiểm
          </CardTitle>
          <CardDescription>
            Các thao tác này không thể hoàn tác
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa toàn bộ dữ liệu
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                <AlertDialogDescription>
                  Thao tác này sẽ xóa toàn bộ dữ liệu bao gồm:
                  <br />• Tất cả thông tin sinh viên
                  <br />• Lịch sử giao dịch
                  <br />• Phiên chợ
                  <br />• Tài khoản admin (trừ admin mặc định)
                  <br /><br />
                  <strong>Thao tác này không thể hoàn tác!</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearData}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Xóa toàn bộ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium text-sm">📥 Sao lưu thường xuyên</h4>
            <p className="text-sm text-muted-foreground">
              Tải xuống backup ít nhất 1 tuần/lần để tránh mất dữ liệu
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm">💾 Lưu trữ an toàn</h4>
            <p className="text-sm text-muted-foreground">
              Lưu file backup ở nhiều nơi: Google Drive, USB, email...
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm">🔄 Khôi phục khi cần</h4>
            <p className="text-sm text-muted-foreground">
              Chọn file backup và tải lên để khôi phục dữ liệu khi có sự cố
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm">⚡ Dữ liệu tự động lưu</h4>
            <p className="text-sm text-muted-foreground">
              Mọi thay đổi được lưu ngay lập tức trong trình duyệt
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}