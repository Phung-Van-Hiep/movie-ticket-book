import React from "react";
import { Menu, Button, Tag, Input } from "antd";
import dayjs from "dayjs";
const Calendar = () => {
  const currentDate = dayjs(); // Lấy ngày hiện tại
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    currentDate.add(i, "day").format("DD dddd")
  );
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
    <div className="bg-white shadow-lg rounded-lg p-6 w-4/5">
      <h1 className="text-center text-2xl font-bold mb-6">Lịch chiếu phim</h1>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/4 border-r pr-4">
          {/* Thanh tìm kiếm */}
          <Input.Search placeholder="Tìm theo tên rạp..." className="mb-4" />

          {/* Danh sách rạp */}
          <Menu
            className="h-[calc(100vh-180px)] overflow-y-auto"
            defaultSelectedKeys={["1"]}
            items={[
              { key: "1", label: "HCinema Hà Nội Centerpoint" },
              { key: "2", label: "HCinema Mac Plaza (Machinco)" },
              { key: "3", label: "HCinema Vincom Royal City" },
              { key: "4", label: "HCinema Vincom Ocean Park" },
              { key: "5", label: "HCinema Aeon Hà Đông" },
            ]}
          />
        </div>

        {/* Content */}
        <div className="w-3/4 pl-6">
          <div
            className="overflow-x-auto overflow-y-auto max-h-[70vh] border rounded-lg"
            style={{ maxWidth: "100%" }}
          >
            {/* Lịch chọn ngày */}
            <div className="min-w-[800px] flex justify-between items-center border-b-2 border-gray-200 pb-2">
              {weekDays.map((date, index) => (
                <Button
                  key={index}
                  type={index === 0 ? "primary" : "default"}
                  className="flex flex-col items-center mx-1"
                >
                  <span>{date.split(" ")[0]}</span>
                  <span className="text-sm">{date.split(" ")[1]}</span>
                </Button>
              ))}
            </div>

            {/* Danh sách phim */}
            <div className="pt-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Cái Giá Của Hạnh Phúc</h2>
                <Tag color="red">18+</Tag>
                <p className="text-gray-500">Chính kịch</p>
                <div className="flex gap-2 mt-2">
                  <Button>10:25 - 12:40</Button>
                  <Button>13:10 - 15:25</Button>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-semibold">Vây Hãm: Kẻ Trừng Phạt</h2>
                <Tag color="red">18+</Tag>
                <p className="text-gray-500">Hành động, Chính kịch</p>
                <div className="flex gap-2 mt-2">
                  <Button>15:10 - 17:25</Button>
                  <Button>18:00 - 20:15</Button>
                </div>
              </div>

              {/* Thêm nhiều phim để kiểm tra thanh cuộn */}
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="mb-4">
                  <h2 className="text-lg font-semibold">Phim {i + 1}</h2>
                  <Tag color="blue">PG-13</Tag>
                  <p className="text-gray-500">Thể loại: Hành động</p>
                  <div className="flex gap-2 mt-2">
                    <Button>10:00 - 12:00</Button>
                    <Button>13:00 - 15:00</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Calendar;
