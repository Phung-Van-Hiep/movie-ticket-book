import React, { useEffect, useState } from "react";
import { Button, Row, Col, Modal, Select } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Option } = Select;

const SeatUpdate = ({ seatData, rows, cols, onSeatsChange, isEditable  }) => {
  const [seats, setSeats] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatType, setSeatType] = useState(1); // Mặc định ghế thường
  // Cập nhật state seats khi seatData thay đổi
  useEffect(() => {
    generateSeats()
  }, [seatData, rows, cols]);
  const generateSeats = () => {
    const newSeats = [];
    for (let row = 0; row < rows; row++) {
      const seatRow = [];
      const rowChar = String.fromCharCode(65 + row);
  
      for (let col = 0; col < cols; col++) {
        const seatCode = `${rowChar}${col + 1}`;
        // Check if there's an existing seat with this seatCode in seatData
        const existingSeat = seatData.find(seat => seat.seatCode === seatCode);
  
        // Determine seatType based on seatData or row letter
        let seatType;
        if (existingSeat) {
          seatType = existingSeat.seatType; // Use seatType from seatData
        } else if (["A", "B", "C", "D"].includes(rowChar)) {
          seatType = 1; // Type 1 for rows A-D
        } else if (["E", "F", "G", "H", "I", "J", "K", "L", "M"].includes(rowChar)) {
          seatType = 2; // Type 2 for rows E-M
        } else {
          seatType = 3; // Default seat type
        }
  
        seatRow.push({
          label: seatCode,
          type: seatType,
        });
      }
  
      newSeats.push(seatRow);
    }
  
    setSeats(newSeats);
  
    const flatSeats = newSeats.flat().map(seat => ({
      seatName: seat.label,
      seatType: seat.type,
    }));
    
    onSeatsChange(flatSeats);
  };
  
  
  // Mở modal để chỉnh sửa loại ghế cho từng ghế
  const openEditModal = (rowIndex, colIndex) => {
    if (!isEditable) return; // Nếu isEditable là false, không cho phép mở modal chỉnh sửa
    setSelectedSeat({ rowIndex, colIndex });
    setSeatType(seats[rowIndex][colIndex].type);
    setEditModalVisible(true);
  };

  // Áp dụng thay đổi loại ghế cho ghế được chọn
  const applySeatType = () => {
    const newSeats = [...seats];
    const { rowIndex, colIndex } = selectedSeat;
    newSeats[rowIndex][colIndex].type = seatType;
    setSeats(newSeats);
    setEditModalVisible(false);

    // Cập nhật lại danh sách ghế trong component cha
    const flatSeats = newSeats.flat().map(seat => ({
      seatName: seat.label,
      seatType: seat.type,
    }));
    onSeatsChange(flatSeats);
  };

  const getSeatColor = (type) => {
    if (type === 1) return "#5A4FCF"; // Ghế thường
    if (type === 2) return "#FF4D4F"; // Ghế VIP
    if (type === 3) return "#FF69B4"; // Ghế couple
    if (type === 4) return "#808080"; // Không khả dụng
  };

  return (
    <div>
      <div style={{ marginTop: 24 }}>
        <div className="flex justify-center mb-16">
          <div
            style={{ width: 400, height: 50 }}
            className="bg-black text-white text-center rounded-lg flex items-center justify-center"
          >
            MÀN HÌNH
          </div>
        </div>
        <div>
          {seats.map((row, rowIndex) => (
            <Row key={rowIndex} justify="center" gutter={[8, 8]}>
              {row.map((seat, colIndex) => (
                <Col key={colIndex} span={1}>
                  <Button
                    style={{
                      backgroundColor: getSeatColor(seat.type),
                      color: "white",
                      width: 40,
                      height: 40,
                      borderRadius: 4,
                    }}
                    onClick={() => openEditModal(rowIndex, colIndex)}
                  >
                    {seat.label}
                  </Button>
                </Col>
              ))}
            </Row>
          ))}
        </div>
      </div>

      {/* Modal để chỉnh sửa loại ghế */}
      <Modal
        title="Chọn loại ghế"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={applySeatType}
      >
        <Select
          style={{ width: "100%" }}
          value={seatType}
          onChange={(value) => setSeatType(value)}
        >
          <Option value={1}>Ghế thường</Option>
          <Option value={2}>Ghế VIP</Option>
          <Option value={3}>Ghế couple</Option>
          <Option value={4}>Không khả dụng</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default SeatUpdate;
