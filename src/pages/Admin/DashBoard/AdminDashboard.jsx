import React, { useEffect, useState } from "react";
import { Card, Table } from "antd";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto"; // Import để dùng Chart.js
// import "./AdminDashboard.css"; // File CSS (nếu cần)
import { APIGetDashboardOV,APIGetDashboardChar,APIGetDashboardMovie, APIGetDashboardCinema } from "../../../services/service.api";
import dayjs from "dayjs"
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(0);
  const [dashboardDataChar, setDashboardDataChar] = useState([]);
  const [dashboardDataMovie, setDashboardDataMovie] = useState([]);
  const [dashboardDataCinema, setDashboardDataCinema] = useState([]);

  const [currentDate, setCurrentDate] = useState("");
  // Dữ liệu cho các biểu đồ
  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [
      {
        label: "Doanh thu",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  });

  const getAllDashboardOV = async () => {
    try {
      const res = await APIGetDashboardOV();
      // console.log(res.data.data);
      if (res && res.data && res.data.data) {
        const dashboardData = res.data?.data
        setDashboardData(dashboardData); 
      }
    } catch (error) {
      message.error('Lỗi khi lấy dữ liệu.');
    }
  };
  const getAllDashboardChar = async () => {
    try {
      const res = await APIGetDashboardChar();
      if (res && res.data && res.data.data) {
        const dashboardDataChar = res.data.data;
  
        // Tạo dữ liệu cho biểu đồ
        const labels = dashboardDataChar.map((item) => `${item.month}/${item.year}`);
        const data = dashboardDataChar.map((item) => item.totalRevenue);
  
        setDashboardDataChar(dashboardDataChar); // Cập nhật dữ liệu thô
        setLineData({
          labels: labels,
          datasets: [
            {
              label: "Doanh thu",
              data: data,
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
              fill: false,
            },
          ],
        });
      }
    } catch (error) {
      message.error("Lỗi khi lấy dữ liệu.");
    }
  };

  const getAllDashboardMovie = async () => {
    try {
      const res = await APIGetDashboardMovie({month: dayjs().month() + 1, year: dayjs().year()});
      // console.log(res.data.data);
      if (res && res.data && res.data.data) {
        const dashboardDataMovie = res.data?.data
        setDashboardDataMovie(dashboardDataMovie); 
      }
    } catch (error) {
      message.error('Lỗi khi lấy dữ liệu.');
    }
  };
  const getAllDashboardCinema = async () => {
    try {
      const res = await APIGetDashboardCinema({month: dayjs().month() + 1, year: dayjs().year()});
      // console.log(res.data.data);
      if (res && res.data && res.data.data) {
        const dashboardDataCinema = res.data?.data
        setDashboardDataCinema(dashboardDataCinema); 
      }
    } catch (error) {
      message.error('Lỗi khi lấy dữ liệu.');
    }
  };
  // Cột cho bảng "Doanh thu theo phim"
  const listMoviesMap = dashboardDataMovie.map((movie, index) => ({
    key: index + 1,
    ...movie
  }));
  const columnsMovies = [
    {
      title: "Tên phim",
      dataIndex: "movieName",
      key: "movieName",
      render: (text) =><div> {text} </div>,
    },
    {
      title: "Tổng vé bán ra",
      dataIndex: "totalTicketSell",
      key: "totalTicketSell",
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
    },
  ];
  
  // Cột cho bảng "Doanh thu theo rạp"
  const listCinemasMap = dashboardDataCinema.map((cinema, index) => ({
    key: index + 1,
    ...cinema
  }));
  const columnsCinemas = [
    {
      title: "Rạp chiếu",
      dataIndex: "cinemaName",
      key: "cinema",
      render: (text) =><div>{text} </div> ,
    },
    {
      title: "Tổng vé bán ra",
      dataIndex: "totalTicketSell",
      key: "totalTicketSell",
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
    },
  ];
  useEffect(() => {
    const today = dayjs().format("DD/MM/YYYY");
    setCurrentDate(today);
    getAllDashboardOV();
    getAllDashboardChar();
    getAllDashboardMovie();
    getAllDashboardCinema();
  }, []);
  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      {/* Thống kê */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="border rounded-lg shadow-md">
          <p className="text-gray-500">Doanh thu trong ngày {currentDate}</p>
          <h3 className="text-blue-600 text-3xl font-semibold">{dashboardData.todayRevenue}</h3>
        </Card>
        <Card className="border rounded-lg shadow-md">
          <p className="text-gray-500">Tổng vé bán ra (T{dayjs().format("MM/YYYY")})</p>
          <h3 className="text-orange-600 text-3xl font-semibold">{dashboardData.totalTicketSell}</h3>
        </Card>
        <Card className="border rounded-lg shadow-md">
          <p className="text-gray-500">Tổng doanh thu theo tháng (T{dayjs().format("MM/YYYY")})</p>
          <h3 className="text-red-600 text-3xl font-semibold">{dashboardData.totalRevenueByMonth}</h3>
        </Card>
        <Card className="border rounded-lg shadow-md">
          <p className="text-gray-500">Tổng doanh thu theo năm {dayjs().format("YYYY")}</p>
          <h3 className="text-green-600 text-3xl font-semibold">{dashboardData.totalRevenueByYear}</h3>
        </Card>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="border rounded-lg shadow-md">
          <h3 className="text-gray-700 font-semibold">Doanh thu theo tháng</h3>
          <Line data={lineData} />
        </Card>
      </div>

      {/* Bảng dữ liệu */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-gray-700 font-semibold mb-4">Doanh thu theo phim</h3>
          <Table
            columns={columnsMovies}
            dataSource={listMoviesMap}
            pagination={{ pageSize: 5 }}
            bordered
          />
        </div>
        <div>
          <h3 className="text-gray-700 font-semibold mb-4">Doanh thu theo rạp</h3>
          <Table
            columns={columnsCinemas}
            dataSource={listCinemasMap}
            pagination={{ pageSize: 5 }}
            bordered
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
