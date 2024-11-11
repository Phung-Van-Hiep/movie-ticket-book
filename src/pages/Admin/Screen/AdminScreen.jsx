import React, { useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  TableOutlined
} from '@ant-design/icons';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table
} from 'antd';
import Highlighter from 'react-highlight-words';
import '../../../css/AdminGenre.css';
import {
  APICreateScreen,
  APIGetAllScreen,
  APIGetScreenDetail,
  APIDeleteScreen,
  APIUploadImage,
  APIGetAllCinemas,
  APIUpdateScreen,
  APIGetALLSeat
} from '../../../services/service.api';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import moment from 'moment';
import SeatLayout from './SeatLayOut';
import SeatUpdate from './SeatUpdate';

const AdminScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listScreen, setListScreen] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [formSeatUpdate] = Form.useForm();
  const [screenDetail, setScreenDetail] = useState(null);
  const [seatDetail, setSeatDetail] = useState(null);
  const [screenSeatsData, setScreenSeatsData] = useState([]);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [modalUpdateOpen, setModalUpdateOpen] = useState(false);
  const [listCinemas, setListCinemas] = useState([]);
  const [rows, setRows] = useState(0); // Default rows
  const [cols, setCols] = useState(0); // Default columns
  const [seatsData, setSeatsData] = useState([]);

  const handleChangeStatus = (value) => {
    // console.log(`selected ${value}`);
  }

  const handleChangeCinemas = (value) => {
    // console.log(`selected ${value}`);
  };

  const handleRows = (value) => {
    setRows(value);
  }
  const handleCol = (value) => {
    setCols(value);
  }
  const handleSeatsUpdate = (seats) => {
    setSeatsData(seats);
    // console.log("Check trang thai", seats)
  };
  const showModalTableUpdate = async (uuid) => {
    const res = await APIGetScreenDetail({ uuid });
    if (res && res.status === 200) {
      const screenDetail = res.data.data;
      setScreenDetail(screenDetail);
      setRows(screenDetail.row);
      setCols(screenDetail.collumn);
    } else {
      message.error('Không tìm thấy thông tin chi tiết.');
    }
    try {
      const res = await APIGetALLSeat({ uuid });
      if (res && res.status === 200) {
        const seatDetail = res.data.data;
        setSeatDetail(seatDetail);
        formSeatUpdate.setFieldsValue({
          seatUuid: seatDetail.seatUuid,
          seatName: seatDetail.seatName,
          seatCode: seatDetail.seatCode,
        });

        setModalUpdateOpen(true);
      } else {
        message.error('Không tìm thấy thông tin chi tiết.');
      }
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          'Đã xảy ra lỗi khi lấy thông tin chi tiết.';
        message.error(errorMessage);
      } else {
        message.error('Đã xảy ra lỗi khi lấy thông tin chi tiết.');
      }
    }
  };
  // const onFinishUpdateSeatInfor = async (values) => {
  //   // const { ...restValues } = values;
  //   try {
  //     const res = await APIUpdateScreen({
  //       uuid: screenDetail?.uuid,
  //       screenName: screenDetail.screenName,
  //       capacity: screenDetail.collumn * screenDetail.row,
  //       cinemaUuid: screenDetail.cinemaUuid,
  //       screenType: screenDetail.screenType,
  //       columns: screenDetail.collumn,
  //       rows: screenDetail.row,
  //       status: screenDetail.status,
  //       seats: seatsData.map(seat => ({
  //         seatUuid: seat.seatUuid,
  //         seatCode: seat.seatName,
  //         seatType: seat.seatType,
  //       })),
  //     });
  //     if (res && res.status === 200) {
  //       message.success('Cập nhật thành công!');
  //       formUpdate.resetFields(); // Đặt lại form cập nhật
  //       getAllScreen(); // Cập nhật danh sách phòng chiếu
  //       handleCancelUpdate();
  //     }
  //   } catch (error) {
  //     if (error.response) {
  //       const errorMessage =
  //         error.response.data?.error?.errorMessage ||
  //         'Đã xảy ra lỗi khi update.';
  //       message.error(errorMessage);
  //     } else if (error.request) {
  //       message.error(
  //         'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
  //       );
  //     } else {
  //       message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
  //     }
  //   }
  // };
  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetScreenDetail({ uuid });
      if (res && res.status === 200) {
        const screenDetail = res.data.data;
        setScreenDetail(screenDetail);
        formUpdate.setFieldsValue({
          screenName: screenDetail.screenName,
          capacity: screenDetail.capacity,
          cinemaUuid: screenDetail.cinemaUuid,
          screenType: screenDetail.screenType,
          collumn: screenDetail.collumn,
          row: screenDetail.row,
          status: screenDetail.status,
        });
        setRows(screenDetail.row);
        setCols(screenDetail.collumn);
        const seatResponse = await APIGetALLSeat({ uuid });
        if (seatResponse && seatResponse.status === 200) {
          setScreenSeatsData(seatResponse.data.data);
        }
        setIsModalUpdateOpen(true);
      } else {
        message.error('Không tìm thấy thông tin chi tiết.');
      }
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          'Đã xảy ra lỗi khi lấy thông tin chi tiết.';
        message.error(errorMessage);
      } else {
        message.error('Đã xảy ra lỗi khi lấy thông tin chi tiết.');
      }
    }
  };

  const onFinishUpdateScreenInfor = async (values) => {
    const { ...restValues } = values;
    try {
      const res = await APIUpdateScreen({
        uuid: screenDetail?.uuid,
        screenName: restValues.screenName,
        capacity: restValues.collumn * restValues.row,
        cinemaUuid: restValues.cinemaUuid,
        screenType: restValues.screenType,
        columns: restValues.collumn,
        rows: restValues.row,
        status: restValues.status,
        seats: seatsData?.map(seat => ({
          seatUuid: seat.seatUuid,
          seatCode: seat.seatName,
          seatType: seat.seatType,
        })),
      });

      if (res && res.status === 200) {
        message.success('Cập nhật thành công!');
        formUpdate.resetFields(); // Đặt lại form cập nhật
        getAllScreen(); // Cập nhật danh sách phòng chiếu
        handleCancelUpdate();
      }
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          'Đã xảy ra lỗi khi update.';
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
        );
      } else {
        message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  };


  const getAllScreen = async () => {
    try {
      const res = await APIGetAllScreen({ pageSize: 1000, page: 1 });
      if (res && res.data && res.data.data) {
        // Lọc các region có status khác "0"
        const filteredScreen = res.data?.data?.items.filter(
          (screen) => screen.status !== 0
        );
        setListScreen(filteredScreen); // Cập nhật danh sách director đã lọc
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách phòng chiếu.');
    }
  };
  const onFinish = async (values) => {
    const { rows, columns, ...restValues } = values;
    const dataScreen = {
      ...restValues,
      capacity: rows * columns,
      rows: rows,
      columns: columns,
      seats: seatsData.map(seat => ({
        seatUuid: null,
        seatCode: seat.seatName,
        seatType: seat.seatType,
      })),
    };
    try {
      const res = await APICreateScreen(dataScreen);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setIsModalOpen(false)
        getAllScreen();
      }
      // console.log("Success:", values);
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          'Đã xảy ra lỗi khi thêm mới.';
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
        );
      } else {
        message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const showModal = () => {
    setIsModalOpen(true);
    setCols(0);
    setRows(0);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCancelUpdate = () => {
    setIsModalUpdateOpen(false);
    setModalUpdateOpen(false)
  };

  const onClose = () => {
    setOpen(false);
    setIsModalUpdateOpen(false);
  };
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const confirm = async (uuid) => {
    try {
      const res = await APIDeleteScreen({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllScreen(); // Cập nhật lại danh sách screen sau khi xoá
      } else {
        message.error('Xoá thất bại.');
      }
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          'Đã xảy ra lỗi khi cập nhật status.';
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
        );
      } else {
        message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  };
  const getAllCinemas = async () => {
    try {
      const res = await APIGetAllCinemas({ pageSize: 10, page: 1 });
      if (res && res.data && Array.isArray(res.data.data.items)) {
        const cinemas = res.data.data.items;
        const cinemasOptions = cinemas
          .filter((cinema) => cinema.status === 1)
          .map((cinema) => ({
            value: cinema.uuid,
            label: cinema.cinemaName
          }));

        setListCinemas(cinemasOptions);
      } else {
        message.error('Không có dữ liệu phòng chiếu hợp lệ.');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách phòng chiếu.');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm phòng chiếu`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Lọc
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
  });
  const listScreenMap = listScreen.map((screen, index) => ({
    key: index + 1,
    ...screen
  }));
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      width: 50
    },
    {
      title: 'Tên phòng chiếu',
      dataIndex: 'screenName',
      key: 'screenName',
      ...getColumnSearchProps('screenName'),
      width: 50,
      sorter: (a, b) => a.screenName.length - b.screenName.length,
      sortDirections: ['descend', 'ascend'],
      render: (screen, record) => {
        return (
          <div>
            {screen} {/* Hiển thị tên phòng chiếu */}
          </div>
        );
      }
    },
    {
      title: 'Loại phòng chiếu',
      dataIndex: 'screenType',
      key: 'screenType',
      width: 50,
      render: (status) => {
        let statusText;
        switch (status) {
          case 1:
            statusText = '2D';
            break;
          case 2:
            statusText = '3D';
            break;
          case 3:
            statusText = 'IMAX2D';
            break;
          case 4:
            statusText = 'IMAX3D';
        }
        return <div className="truncate-description">{statusText}</div>;
      }
    },
    {
      title: 'Tổng số ghế',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 50
    },


    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
          <Button
            type="text"
            className="bg-orange-400 text-white"
            onClick={() => showModalTableUpdate(record.uuid)}
          >
            <TableOutlined />
          </Button>
          <Popconfirm
            title="Xoá phòng chiếu"
            description="Bạn muốn xoá phòng chiếu này?"
            onConfirm={() => confirm(record.uuid)}
            okText={<>Có</>}
            cancelText="Không"
          >
            <Button danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
          <Button
            type="text"
            className="bg-blue-700 text-white"
            onClick={() => showModalUpdate(record.uuid)}
          >
            <EditOutlined />
          </Button>
        </div>
      )
    }
  ];
  useEffect(() => {
    getAllScreen();
    getAllCinemas();
  }, []);
  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Thêm mới phòng chiếu
      </Button>
      <Modal
        title="Thêm mới phòng chiếu"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={<></>}
        width={1200}
        height={1200}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ 
            remember: true, 
            screenType: "",   // Thêm giá trị mặc định cho `screenType`
            cinemaUuid: ""    // Thêm giá trị mặc định cho `cinemaUuid`
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col className="gutter-row" span={8}>
              <Form.Item
                label="Tên phòng chiếu"
                name="screenName"
                rules={[{ required: true, message: 'Hãy nhập tên phòng chiếu!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={8}>
              <Form.Item
                label="Rạp phim"
                name="cinemaUuid"
                rules={[{ required: true, message: 'Hãy chọn rạp phim!' }]}
              >
                <Select
                  showSearch
                  onChange={handleChangeCinemas}
                  options={listCinemas}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={8}>
              <Form.Item
                label="Loại phòng chiếu"
                name="screenType"
                rules={[{ required: true, message: 'Hãy chọn loại phòng chiếu!' }]}
              >
                <Select
                  onChange={handleChangeStatus}
                  options={[
                    { value: 1, label: '2D' },
                    { value: 2, label: '3D' },
                    { value: 3, label: 'IMAX2D' },
                    { value: 4, label: 'IMAX3D' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} justify="center">
            <Col className="gutter-row" span={12}>
              <Form.Item label="Số hàng" name="rows" rules={[
                { required: true, message: 'Nhập số hàng' },
                { type: 'number', min: 1, max: 15, message: 'Số hàng phải từ 1 đến 15!' }
              ]}>
                <InputNumber
                  onChange={handleRows}
                  placeholder="Nhập số hàng"
                  className='w-9/12'
                  min={1}  // Minimum value
                  max={15} // Maximum value
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item label="Số cột" name="columns" rules={[
                { required: true, message: 'Nhập số cột' },
                { type: 'number', min: 1, max: 15, message: 'Số cột phải từ 1 đến 15!' }
              ]}>
                <InputNumber
                  onChange={handleCol}
                  placeholder="Nhập số cột"
                  className='w-9/12'
                  min={1}  // Minimum value
                  max={15} // Maximum value
                />
              </Form.Item>
            </Col>
          </Row>
          {/* Thêm phần SeatLayout ở đây */}
          <div className="seat-layout-preview">
            {rows && cols ? (
              <SeatLayout
                rows={rows}
                cols={cols}
                onSeatsChange={handleSeatsUpdate}
              // Có thể thêm các props khác nếu cần
              />
            ) : null}
          </div>
          <div className="flex justify-center mt-10">
            <Button type="primary" htmlType="submit" form="basic">
              Thêm mới
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title="Cập nhật phòng chiếu"
        open={isModalUpdateOpen}
        onCancel={() => setIsModalUpdateOpen(false)}
        footer={
          <Button onClick={() => setIsModalUpdateOpen(false)}>Đóng</Button>
        }
        width={1200}
        height={1200}
      >
        <Form
          form={formUpdate}
          name="basic1"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ 
            remember: true, 
            screenType: "",   // Thêm giá trị mặc định cho `screenType`
            cinemaUuid: ""    // Thêm giá trị mặc định cho `cinemaUuid`
          }}
          onFinish={onFinishUpdateScreenInfor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col className="gutter-row" span={8}>
              <Form.Item
                label="Tên phòng chiếu"
                name="screenName"
                rules={[{ required: true, message: 'Hãy nhập tên phòng chiếu!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={8}>
              <Form.Item
                label="Rạp phim"
                name="cinemaUuid"
                rules={[{ required: true, message: 'Hãy chọn rạp phim!' }]}
              >
                <Select
                  showSearch
                  onChange={handleChangeCinemas}
                  options={listCinemas}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={8}>
              <Form.Item
                label="Loại phòng chiếu"
                name="screenType"
                rules={[{ required: true, message: 'Hãy chọn loại phòng chiếu!' }]}
              >
                <Select
                  onChange={handleChangeStatus}
                  options={[
                    { value: 1, label: '2D' },
                    { value: 2, label: '3D' },
                    { value: 3, label: 'IMAX2D' },
                    { value: 4, label: 'IMAX3D' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} justify="center">
            <Col className="gutter-row" span={12}>
              <Form.Item label="Số hàng" name="row" rules={[
                { required: true, message: 'Nhập số hàng' },
                { type: 'number', min: 1, max: 15, message: 'Số hàng phải từ 1 đến 15!' }
              ]}>
                <InputNumber
                  onChange={handleRows}
                  placeholder="Nhập số hàng"
                  className='w-9/12'
                  min={1}  // Minimum value
                  max={15} // Maximum value
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item label="Số cột" name="collumn" rules={[
                { required: true, message: 'Nhập số cột' },
                { type: 'number', min: 1, max: 15, message: 'Số cột phải từ 1 đến 15!' }
              ]}>
                <InputNumber
                  onChange={handleCol}
                  placeholder="Nhập số cột"
                  className='w-9/12'
                  min={1}  // Minimum value
                  max={15} // Maximum value
                />
              </Form.Item>
            </Col>
          </Row>
          {/* Thêm phần SeatLayout ở đây */}
          <div className="seat-layout-preview">
            {rows && cols ? (
              <SeatUpdate
                rows={rows}
                cols={cols}
                seatData={screenSeatsData}
                onSeatsChange={handleSeatsUpdate}
                isEditable={true} // Cho phép chỉnh sửa
              />
            ) : null}
          </div>
          <div className="flex justify-center mt-10">
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" form="basic1">
                Cập nhật
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
      <Modal
        title="Ghế ngồi trong rạp phim"
        open={modalUpdateOpen}
        onCancel={() => setModalUpdateOpen(false)}
        
        footer={
          <div className="flex justify-center mt-10 mr-2" >
          <Button onClick={() => setModalUpdateOpen(false)}>Đóng</Button>
          </div>
        }
        width={1200}
        height={1200}
      >
        <Form
          form={formSeatUpdate}
          name="basic2"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          // onFinish={onFinishUpdateSeatInfor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <div className="seat-layout-preview">
            {rows && cols ? (
              <SeatUpdate
                rows={rows}
                cols={cols}
                seatData={seatDetail}
                onSeatsChange={handleSeatsUpdate}
                isEditable={false} // Không cho phép chỉnh sửa
              />
            ) : null}
          </div>
          {/* <div className="flex justify-center mt-10 mr-14">
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" form="basic2">
                Đóng
              </Button>
            </Form.Item>
          </div> */}
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={listScreenMap}
        scroll={{ x: 1000, y: 500 }}
        pagination={{
          showTotal: (total, range) => {
            return `${range[0]}-${range[1]} of ${total} items`;
          },
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20']
        }}
      />
    </>
  );
};

export default AdminScreen;
