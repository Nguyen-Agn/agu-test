import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { clientAPI } from "@/lib/clientApi";

interface MarketSession {
  id: number;
  title: string;
  date: string;
  location: string;
  timeSlot: string;
  wasteTypes: string;
  gifts: string;
}

export default function Home() {
  const { data: upcomingSession, isLoading, error } = useQuery({
    queryKey: ["/api/upcoming-session"],
    queryFn: () => clientAPI.getUpcomingMarketSession(),
  });



  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Đổi Rác Lấy Điểm - Bảo Vệ Môi Trường
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia chương trình tái chế, đổi rác thải lấy điểm thưởng và nhận quà hấp dẫn. 
            Góp phần xây dựng môi trường xanh cho trường học.
          </p>
          <Link href="/register">
            <Button className="bg-primary text-white px-8 py-3 text-lg font-medium hover:bg-green-600">
              Đăng ký tham gia ngay
            </Button>
          </Link>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Lịch Phiên Chợ Sắp Tới</h3>
          
          {isLoading ? (
            <Card className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </Card>
          ) : upcomingSession ? (
            <Card className="shadow-sm border p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {upcomingSession.title}
                    </h4>
                    <p className="text-gray-600">{upcomingSession.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {format(new Date(upcomingSession.date), "dd", { locale: vi })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(upcomingSession.date), "MMMM", { locale: vi })}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Thời gian:</span>
                    <p className="text-gray-600">{upcomingSession.timeSlot}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Loại rác nhận:</span>
                    <p className="text-gray-600">{upcomingSession.wasteTypes}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Quà tặng:</span>
                    <p className="text-gray-600">{upcomingSession.gifts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6">
              <CardContent className="text-center text-gray-600">
                Hiện tại chưa có lịch phiên chợ nào được công bố.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
