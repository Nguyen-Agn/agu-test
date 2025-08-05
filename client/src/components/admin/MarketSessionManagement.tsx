import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Calendar, MapPin, Clock, Trash2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { clientAPI } from "@/lib/clientApi";
import { insertMarketSessionSchema } from "@shared/schema";
import type { MarketSession, InsertMarketSession } from "@shared/schema";
import { z } from "zod";

const formSchema = insertMarketSessionSchema.extend({
  date: z.string().min(1, "Vui lòng chọn ngày"),
});

type FormData = z.infer<typeof formSchema>;

export function MarketSessionManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<MarketSession | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      location: "",
      timeSlot: "",
      wasteTypes: "",
      gifts: "",
    },
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["/api/market-sessions"],
    queryFn: () => clientAPI.getMarketSessions(),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertMarketSession) => clientAPI.createMarketSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/upcoming-session"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Tạo phiên chợ thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi tạo phiên chợ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MarketSession> }) => 
      clientAPI.updateMarketSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/upcoming-session"] });
      setDialogOpen(false);
      setEditingSession(null);
      form.reset();
      toast({
        title: "Cập nhật phiên chợ thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi cập nhật phiên chợ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientAPI.deleteMarketSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/upcoming-session"] });
      toast({
        title: "Xóa phiên chợ thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi xóa phiên chợ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const sessionData: InsertMarketSession = {
      title: data.title,
      date: new Date(data.date),
      location: data.location,
      timeSlot: data.timeSlot,
      wasteTypes: data.wasteTypes,
      gifts: data.gifts,
    };

    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data: sessionData });
    } else {
      createMutation.mutate(sessionData);
    }
  };

  const handleEdit = (session: MarketSession) => {
    setEditingSession(session);
    form.reset({
      title: session.title,
      date: format(new Date(session.date), "yyyy-MM-dd'T'HH:mm"),
      location: session.location,
      timeSlot: session.timeSlot,
      wasteTypes: session.wasteTypes,
      gifts: session.gifts,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingSession(null);
    form.reset();
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản Lý Phiên Chợ</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Phiên Chợ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? "Chỉnh Sửa Phiên Chợ" : "Tạo Phiên Chợ Mới"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề phiên chợ</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Phiên Chợ Xanh Tháng 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày và giờ</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa điểm</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Sân trường A1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeSlot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khung giờ</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: 8:00 - 11:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wasteTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại rác nhận</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="VD: Chai nhựa, giấy, kim loại, thiết bị điện tử"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gifts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quà tặng</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="VD: Cây xanh, túi vải, đồ dùng học tập"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingSession ? "Cập nhật" : "Tạo mới"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Chưa có phiên chợ nào. Hãy tạo phiên chợ đầu tiên!
            </CardContent>
          </Card>
        ) : (
          sessions
            .sort((a: MarketSession, b: MarketSession) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((session: MarketSession) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-semibold">
                    {session.title}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(session)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa phiên chợ "{session.title}"? 
                            Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(session.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {format(new Date(session.date), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{session.timeSlot}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{session.location}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Loại rác nhận:</span>
                      <p className="text-gray-600 text-sm mt-1">{session.wasteTypes}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Quà tặng:</span>
                      <p className="text-gray-600 text-sm mt-1">{session.gifts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}