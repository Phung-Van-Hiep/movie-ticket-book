import React, { useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table
} from 'antd';
import Highlighter from 'react-highlight-words';
import '../../../css/AdminGenre.css';
import {
  APICreateTicket,
  APIGetAllTicket,
  APIGetTicketDetail,
  APIDeleteTicket,
  APIGetALLScreenType,
  APIGetALLSeatType,
} from '../../../services/service.api';
import { PlusOutlined } from '@ant-design/icons';

const AdminTicketPrice = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listTicket, setListTicket] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [ticketDetail, setTicketDetail] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [listScreenType, setListScreenType] = useState([]);
  const [listSeatType, setListSeatType] = useState([]);
  const handleChangeStatus = (value) => {
    console.log(`selected ${value}`);
  }

  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetTicketDetail({ uuid });
      // console.log('update', res);
      if (res && res.status === 200) {
        const ticketDetail = res.data.data;
        setTicketDetail(ticketDetail);
        // console.log("update", ticketDetail)
        formUpdate.setFieldsValue({
          seatTypeUuid: ticketDetail.seatTypeUuid,
          screenTypeUuid: ticketDetail.screenTypeUuid,
          dateState: ticketDetail.dateState,
          price: ticketDetail.price,
        });
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
  const onFinishUpdateTicketInfor = async (values) => {
    const { ...restValues } = values;
    try {
      const res = await APICreateTicket({
        uuid: ticketDetail?.uuid,
        seatTypeUuid: restValues.seatTypeUuid,
        screenTypeUuid: restValues.screenTypeUuid,
        dateState: restValues.dateState,
        price: restValues.price,
      });
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        getAllTicket();
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

  const getAllTicket = async () => {
    try {
      const res = await APIGetAllTicket({ pageSize: 1000, page: 1 });
      console.log(res.data.data);
      if (res && res.data && res.data.data) {
        // Lọc các region có status khác "0"
        const filteredTickets = res.data?.data?.items.filter(
          (tickets) => tickets.status !== 0
        );
        setListTicket(filteredTickets); // Cập nhật danh sách tickets đã lọc
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách giá vé.');
    }
  };
  const onFinish = async (values) => {

    try {
      const res = await APICreateTicket(values);
      console.log(res);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        getAllTicket();
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
  };

  const handleOk = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCancelUpdate = () => {
    setIsModalUpdateOpen(false);
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
      const res = await APIDeleteTicket({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllTicket(); // Cập nhật lại danh sách tickets sau khi xoá
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
  const fetchData = async (apiCall, mapDataToOptions, setState, filterCondition) => {
    try {
      const res = await apiCall({ keyword: '', uuid: '' });
      if (res && res.data && res.data.data) {
        // Lọc dữ liệu dựa trên điều kiện filterCondition
        const filteredData = res.data.data.filter(filterCondition);
        const dataItems = filteredData.map(mapDataToOptions);
        setState(dataItems); // Cập nhật state
      } else {
        message.error('Không có dữ liệu hợp lệ.');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy dữ liệu.');
    }
  };
  const getAllScreenType = async () => {
    fetchData(
      APIGetALLScreenType,
      (screen) => ({ value: screen.uuid, label: screen.name }),
      setListScreenType,
      (screen) => screen.name !== "Không khả dụng" // Điều kiện lọc
    );
  };

  const getAllSeatType = async () => {
    fetchData(
      APIGetALLSeatType,
      (seat) => ({ value: seat.uuid, label: seat.name }),
      setListSeatType,
      (seat) => seat.name !== "Không khả dụng" // Điều kiện lọc
    );
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
          placeholder={`Tìm kiếm giá vé`}
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
  const listTicketMap = listTicket.map((tickets, index) => ({
    key: index + 1,
    ...tickets
  }));
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      width: 50
    },
    {
      title: 'Loại ghế',
      dataIndex: 'seatType',
      key: 'seatType',
      ...getColumnSearchProps('seatType'),
      width: 50,
      sorter: (a, b) => a.seatType.length - b.seatType.length,
      sortDirections: ['descend', 'ascend'],
      render: (seatType, record) => {
        let seatTypeName;
        let colorClass;
        switch (seatType) {
          case 1:
            seatTypeName = 'Ghế thường';
            colorClass = 'bg-sky-100 text-sky-800 border-sky-800'
            break;
          case 2:
            seatTypeName = 'Ghế VIP';
            colorClass = 'bg-rose-100 text-rose-800 border-rose-800'
            break;
          case 3:
            seatTypeName = 'Ghế Couple';
            colorClass = 'bg-pink-100 text-pink-500 border-pink-500'
            break;
          default:
            seatTypeName = 'Không xác định';
        }
        return (
          <div className={` inline-block rounded-md border ${colorClass}`}>
            {seatTypeName} {/* Hiển thị loại ghế */}
          </div>
        );
      },
    },
    {
      title: 'Loại phòng chiếu',
      dataIndex: 'screenType',
      key: 'screenType',
      width: 50,
      render: (status) => {
        let statusText;
        let colorClass; // Thêm biến để xác định màu sắc

        switch (status) {
          case 1:
            statusText = '2D';
            colorClass = 'bg-blue-100 text-blue-600 border-blue-600'; // Xanh nước biển
            break;
          case 2:
            statusText = '3D';
            colorClass = 'bg-green-100 text-green-600 border-green-600'; // Xanh lá cây
            break;
          case 3:
            statusText = 'IMAX2D';
            colorClass = 'bg-yellow-100 text-yellow-600 border-yellow-600'; // Vàng
            break;
          case 4:
            statusText = 'IMAX3D';
            colorClass = 'bg-red-100 text-red-600 border-red-600'; // Đỏ
            break;
        }
        return (
          <div className={` inline-block rounded-md border ${colorClass}`}>
            {statusText}
          </div>
        );
      },
    },
    {
      title: 'Loại ngày áp dụng',
      dataIndex: 'dateState',
      key: 'dateState',
      width: 50,
      render: (dateState) => {
        let dateStateName;
        let colorClass;
        switch (dateState) {
          case 1:
            dateStateName = 'Trong tuần';
            colorClass = 'bg-orange-100 text-orange-600 border-orange-600';
            break;
          case 2:
            dateStateName = 'Cuối tuần';
            colorClass = 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-600';
            break;
          default:
            dateStateName = 'Không xác định';
        }
        return <div className={` inline-block rounded-md border ${colorClass}`}>{dateStateName}</div>;
      },
    },

    {
      title: 'Giá vé',
      dataIndex: 'price',
      key: 'price',
      width: 50
    },
    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
          <Popconfirm
            title="Xoá giá vé"
            description="Bạn muốn xoá giá vé này?"
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
    getAllTicket();
    getAllScreenType();
    getAllSeatType();
  }, []);
  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Thêm mới giá vé
      </Button>
      <Modal
        title="Thêm mới giá vé"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={<></>}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Loại ghế"
            name="seatTypeUuid"
            rules={[
              {
                required: true,
                message: 'Hãy chọn loại ghế!'
              }
            ]}
          >
            <Select
              showSearch
              defaultValue=""
              options={listSeatType}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />

          </Form.Item>
          <Form.Item
            label="Loại ngày"
            name="dateState"
            rules={[
              {
                required: true,
                message: 'Hãy chọn ngày!'
              }
            ]}
          >
            <Select
              defaultValue="Chọn ngày"
              onChange={handleChangeStatus}
              options={[
                { value: 1, label: 'Ngày trong tuần(T2->T6)' },
                { value: 2, label: 'Ngày lễ - ngày nghỉ(T7-CN)' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Loại phòng chiếu"
            name="screenTypeUuid"
            rules={[
              {
                required: true,
                message: 'Hãy chọn phòng chiếu!'
              }
            ]}
          >
            <Select
              showSearch
              defaultValue=""
              options={listScreenType}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
          <Form.Item label="Giá tiền" name="price" rules={[{ required: true, message: 'Hãy nhập giá tiền' },
          { type: 'number', min: 1, message: 'Giá vé phải lớn hơn 0' }
          ]}>
            <InputNumber
              placeholder="Nhập giá tiền"
              className='w-full'
              min={1}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Cập nhật giá vé"
        open={isModalUpdateOpen}
        onCancel={() => setIsModalUpdateOpen(false)}
        footer={
          <Button onClick={() => setIsModalUpdateOpen(false)}>Đóng</Button>
        }
      >
        <Form
          form={formUpdate}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinishUpdateTicketInfor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Loại ghế"
            name="seatTypeUuid"
            rules={[
              {
                required: true,
                message: 'Hãy chọn loại ghế!'
              }
            ]}
          >
            <Select
              defaultValue="Chọn loại ghế"
              onChange={handleChangeStatus}
              options={[
                { value: 0, label: 'Ghế thường' },
                { value: 1, label: 'Ghế vip' },
                { value: 2, label: 'Ghế couple' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Loại ngày"
            name="dateState"
            rules={[
              {
                required: true,
                message: 'Hãy chọn ngày!'
              }
            ]}
          >
            <Select
              defaultValue="Chọn ngày"
              onChange={handleChangeStatus}
              options={[
                { value: 1, label: 'Ngày trong tuần(T2->T6)' },
                { value: 2, label: 'Ngày lễ - ngày nghỉ(T7-CN)' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Loại phòng chiếu"
            name="screenTypeUuid"
            rules={[
              {
                required: true,
                message: 'Hãy chọn phòng chiếu!'
              }
            ]}
          >
            <Select
              defaultValue="Chọn hình thức chiếu"
              onChange={handleChangeStatus}
              options={[
                { value: 0, label: '2D' },
                { value: 1, label: '3D' },
                { value: 2, label: 'IMAX2D' },
                { value: 3, label: 'IMAX3D' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Giá tiền" name="price" rules={[{ required: true, message: 'Hãy nhập giá tiền' }]}>
            <InputNumber
              placeholder="Nhập giá tiền"
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={listTicketMap}
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

export default AdminTicketPrice;
