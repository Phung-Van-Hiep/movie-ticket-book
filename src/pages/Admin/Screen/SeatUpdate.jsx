import React, { useEffect, useState } from "react";
import { Button, Row, Col, Modal, Select, message } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Option } = Select;

const SeatUpdate = ({ seatData, rows, cols, onSeatsChange, isEditable }) => {
  const [seats, setSeats] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null); // Lưu ghế hoặc hàng ghế được chọn
  const [seatType, setSeatType] = useState(1); // Loại ghế được chọn

  useEffect(() => {
    generateSeats();
  }, [seatData, rows, cols]);

  const generateSeats = () => {
    const newSeats = [];
    for (let row = 0; row < rows; row++) {
      const seatRow = [];
      const rowChar = String.fromCharCode(65 + row); // Tên hàng ghế (A, B, C, ...)
      let isFirstNewColumn = true;

      for (let col = 0; col < cols; col++) {
        let seatType = 1; // Loại ghế mặc định là "couple"

        // Kiểm tra loại ghế theo hàng
        if (["A", "B", "C", "D"].includes(rowChar)) {
          seatType = 1; // "Ghế thường" cho A, B, C, D
        } else if (["E", "F", "G", "H", "I", "J", "K", "L", "M"].includes(rowChar)) {
          seatType = 2; // "Ghế VIP" cho E, F, G, H, I, J, K, L, M
        } else {
          seatType = 3; // "Ghế couple" cho các hàng còn lại
        }

        const seatCode = `${rowChar}${col + 1}`;

        // Kiểm tra trong seatData để xác định loại ghế, tránh bị ghi đè
        const existingSeat = seatData.find(seat => seat.seatCode === seatCode);
        if (existingSeat) {
          seatType = existingSeat.seatType; // Sử dụng loại ghế đã cập nhật từ seatData
        }
        if (cols === 1 && col === 0 && seatRow.length === 0) {
          // Xét theo chữ cái để xác định loại ghế
          if (["A", "B", "C", "D"].includes(rowChar)) {
            seatType = 1; // "Ghế thường" cho A, B, C, D
          } else if (["E", "F", "G", "H", "I", "J", "K", "L", "M"].includes(rowChar)) {
            seatType = 2; // "Ghế VIP" cho E, F, G, H, I, J, K, L, M
          } else {
            seatType = 1; // Nếu không nằm trong các hàng đặc biệt, thì mặc định là "Ghế thường"
          }
        }    
        if (col > 0 && col % 2 === 1 && seatRow[col - 1].type === 3) {
          seatType = seatRow[col - 1].type; // Gán kiểu ghế từ cột trước nếu là ghế couple
        }
        seatRow.push({
          label: seatCode,
          type: seatType, // Loại ghế đã được xác định từ seatData hoặc mặc định
        });
      }

      newSeats.push(seatRow);
    }
    setSeats(newSeats);
    // Dồn ghế vào một mảng phẳng và gọi callback onSeatsChange để truyền dữ liệu ghế cập nhật
    const flatSeats = newSeats.flat().map(seat => ({
      seatName: seat.label,
      seatType: seat.type,
    }));
    onSeatsChange(flatSeats);
  };

  const openEditModalForRow = (rowIndex) => {
    if (!isEditable) return;
    setSelectedSeat({ rowIndex }); // Lưu cả hàng ghế được chọn
    setSeatType(seats[rowIndex][0].type); // Lấy loại ghế của hàng đầu tiên
    setEditModalVisible(true);
  };

  const openEditModalForSeat = (rowIndex, colIndex) => {
    if (!isEditable) return;
    setSelectedSeat({ rowIndex, colIndex }); // Lưu ghế được chọn
    setSeatType(seats[rowIndex][colIndex].type); // Lấy loại ghế của ghế được chọn
    setEditModalVisible(true);
  };

  const applySeatType = () => {
    if (selectedSeat) {
      const { rowIndex, colIndex } = selectedSeat;
      const newSeats = [...seats];
      const updatedSeatType = seatType;

      if (updatedSeatType === 3 && cols === 1) {
        message.error("Không thể thay thế ghế thành couple vì chỉ có một cột duy nhất");
        return;
      }

      if (colIndex !== undefined) {
        // Thay đổi loại cho một ghế riêng lẻ
        newSeats[rowIndex][colIndex].type = updatedSeatType;

        // Nếu là ghế couple, ghép cặp ghế tiếp theo hoặc trước đó
        if (updatedSeatType === 3) {
          if (colIndex % 2 === 0 && colIndex + 1 < cols) {
            // Ghép cặp với ghế tiếp theo nếu là cột chẵn
            newSeats[rowIndex][colIndex + 1].type = updatedSeatType;
          } else if (colIndex % 2 === 1) {
            // Ghép với ghế trước đó nếu là cột lẻ
            newSeats[rowIndex][colIndex - 1].type = updatedSeatType;
          }
        } else {
          // Kiểm tra nếu ghế hiện tại thuộc cặp couple, đổi cả cặp về loại ghế mới
          if (colIndex % 2 === 0 && colIndex + 1 < cols && newSeats[rowIndex][colIndex + 1].type === 3) {
            // Cặp couple: cột chẵn và cột lẻ liền kề
            newSeats[rowIndex][colIndex].type = updatedSeatType;
            newSeats[rowIndex][colIndex + 1].type = updatedSeatType;
          } else if (colIndex % 2 === 1 && newSeats[rowIndex][colIndex - 1].type === 3) {
            // Cặp couple: cột lẻ và cột chẵn liền kề
            newSeats[rowIndex][colIndex].type = updatedSeatType;
            newSeats[rowIndex][colIndex - 1].type = updatedSeatType;
          }
        }
      } else {
        // Thay đổi loại cho toàn bộ hàng
        for (let col = 0; col < cols; col++) {
          newSeats[rowIndex][col].type = updatedSeatType;
        }
      }

      setSeats(newSeats);
      setEditModalVisible(false);

      const flatSeats = newSeats.flat().map((seat) => ({
        seatName: seat.label,
        seatType: seat.type,
      }));
      onSeatsChange(flatSeats);
    }
  };


  const getSeatColor = (type) => {
    if (type === 1) return "#5A4FCF";
    if (type === 2) return "#FF4D4F";
    if (type === 3) return "#FF69B4";
    if (type === 4) return "#808080";
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
              {row.map((seat, colIndex) => {
                if (seat.type === 3 && colIndex % 2 === 0) {
                  if (cols % 2 !== 0 && colIndex === cols - 1) {
                    return null;
                  }
                  return (
                    <Col key={colIndex} span={2}>
                      <Button
                        style={{
                          backgroundColor: getSeatColor(seat.type),
                          color: "white",
                          width: 88,
                          height: 40,
                          borderRadius: 4,
                          marginRight: -8,
                        }}
                        onClick={() => openEditModalForSeat(rowIndex, colIndex)} // Mở modal cho ghế riêng lẻ
                      >
                        {`${seat.label} & ${row[colIndex + 1]?.label}`}
                      </Button>
                    </Col>
                  );
                }
                if (seat.type === 3 && colIndex % 2 !== 0) {
                  return null;
                }
                return (
                  <Col key={colIndex} span={1}>
                    <Button
                      style={{
                        backgroundColor: getSeatColor(seat.type),
                        color: "white",
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                      }}
                      onClick={() => openEditModalForSeat(rowIndex, colIndex)} // Mở modal cho ghế riêng lẻ
                    >
                      {seat.label}
                    </Button>
                  </Col>
                );
              })}
              {isEditable && (
                <Col>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditModalForRow(rowIndex)} // Mở modal cho toàn bộ hàng
                  />
                </Col>
              )}
            </Row>
          ))}
        </div>
      </div>
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