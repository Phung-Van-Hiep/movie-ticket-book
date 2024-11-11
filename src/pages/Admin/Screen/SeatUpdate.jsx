import React, { useEffect, useState } from "react";
import { Button, Row, Col, Modal, Select } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Option } = Select;

const SeatUpdate = ({ seatData, rows, cols, onSeatsChange, isEditable }) => {
  const [seats, setSeats] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [seatType, setSeatType] = useState(1);

  useEffect(() => {
    generateSeats();
  }, [seatData, rows, cols]);

  const generateSeats = () => {
    const newSeats = [];
    for (let row = 0; row < rows; row++) {
      const seatRow = [];
      const rowChar = String.fromCharCode(65 + row);

      for (let col = 0; col < cols; col++) {
        const seatCode = `${rowChar}${col + 1}`;
        const existingSeat = seatData.find(seat => seat.seatCode === seatCode);
        let seatType = existingSeat ? existingSeat.seatType : 1;
        seatRow.push({ label: seatCode, type: seatType });
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

  const openEditModalForRow = (rowIndex) => {
    if (!isEditable) return;
    setSelectedRow(rowIndex);
    setEditModalVisible(true);
  };

  const applySeatTypeForRow = () => {
    const newSeats = [...seats];
    const rowSeats = newSeats[selectedRow];

    rowSeats.forEach((seat) => {
      seat.type = seatType;
    });

    setSeats(newSeats);
    setEditModalVisible(false);

    const flatSeats = newSeats.flat().map(seat => ({
      seatName: seat.label,
      seatType: seat.type,
    }));
    onSeatsChange(flatSeats);
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
                        onClick={() => openEditModalForRow(rowIndex)}
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
                      onClick={() => openEditModalForRow(rowIndex)}
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
                    onClick={() => openEditModalForRow(rowIndex)}
                  />
                </Col>
              )}
            </Row>
          ))}
        </div>
      </div>

      <Modal
        title="Chọn loại ghế cho cả hàng"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={applySeatTypeForRow}
      >
        <Select
          style={{ width: "100%" }}
          value={seatType}
          onChange={(value) => setSeatType(value)}
          defaultValue={1}
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
