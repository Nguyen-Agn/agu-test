import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface DashboardData {
  student: {
    id: number;
    fullName: string;
    studentId: string;
    email: string;
    major: string;
    phone: string;
    totalPoints: number;
  };
  transactions: Array<{
    id: number;
    wasteType: string;
    weight: string;
    points: number;
    gift?: string;
    date: string;
  }>;
  stats: {
    totalWeight: string;
    giftsReceived: number;
  };
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/student/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-6">
            <CardContent className="text-center text-red-600">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Điểm Tích Lũy Của Tôi</h2>
          <p className="text-gray-600">
            Chào {data.student.fullName} - MSSV: {data.student.studentId}
          </p>
        </div>

        {/* Points Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm border p-6">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-primary">
                    {data.student.totalPoints.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600">Tổng điểm tích lũy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border p-6">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <span className="text-2xl">♻️</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {data.stats.totalWeight}
                  </h3>
                  <p className="text-sm text-gray-600">Kg rác đã đổi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border p-6">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <span className="text-2xl">🎁</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {data.stats.giftsReceived}
                  </h3>
                  <p className="text-sm text-gray-600">Quà đã nhận</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">Lịch Sử Đổi Rác</h3>
          </div>
          {data.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ngày</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Loại rác</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Số lượng (kg)</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Điểm nhận</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Quà nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(transaction.date), "dd/MM/yyyy", { locale: vi })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.wasteType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {parseFloat(transaction.weight).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-primary">
                        +{transaction.points} điểm
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.gift || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600">
              Bạn chưa có giao dịch nào. Hãy tham gia phiên chợ để bắt đầu tích điểm!
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
