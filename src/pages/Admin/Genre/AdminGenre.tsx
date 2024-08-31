import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type {
  FormProps,
  InputRef,
  PopconfirmProps,
  TableColumnsType,
  TableColumnType,
} from "antd";
import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import "../../../css/AdminGenre.css";
import {
  APICreateGenre,
  APIGetAllGenre,
  APIGetGenreDetail,
} from "../../../services/service.api";
interface DataType {
  id: string;
  uuid: string;
  genreName: string;
  status: string;
}

type DataIndex = keyof DataType;

type FieldType = {
  genreName: string;
};

const AdminGenre: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const [listGenre, setListGenre] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [genreDetail, setGenreDetail] = useState<DataType | null>(null);
  const getAllGenre = async () => {
    const res = await APIGetAllGenre({ pageSize: 10, page: 1 });
    // console.log(res);
    if (res && res.data && res.data?.data) {
      setListGenre(res.data?.data?.items);
      form.resetFields();
      handleCancel();
    }
  };
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try{
    const res = await APICreateGenre(values);
    // console.log(res);
    if (res && res.status === 200) {
      message.success(res.data.error.errorMessage);
      getAllGenre();
    }
    // console.log("Success:", values);
    }catch(error:any){
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          "Đã xảy ra lỗi khi thêm mới.";
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."
        );
      } else {
        message.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    }
      
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showDrawer = async (uuid: string) => {
    try {
      const res = await APIGetGenreDetail({ uuid });
      // console.log('API Response:', res); // Kiểm tra dữ liệu trả về
      if (res && res.status === 200) {
        setGenreDetail(res.data.data);
        setOpen(true);
      } else {
        message.error("Không tìm thấy thông tin chi tiết.");
      }
    } catch (error: any) {
      if (error.response) {
        console.error(error.response.data);
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          "Đã xảy ra lỗi khi lấy thông tin chi tiết.";
        message.error(errorMessage);
      } else {
        message.error("Đã xảy ra lỗi khi lấy thông tin chi tiết.");
      }
    }
  };
  

  const onClose = () => {
    setOpen(false);
    // setGenreDetail(null);
  };
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };
  const confirm: PopconfirmProps["onConfirm"] = (e) => {
     console.log(e);
    message.success("Click on Yes");
  };

  const cancel: PopconfirmProps["onCancel"] = (e) => {
     console.log(e);
    message.error("Click on No");
  };
  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const listGenreMap = listGenre.map((genre, index) => ({
    key: index + 1,
    ...genre,
  }));
  const columns: TableColumnsType<DataType> = [
    {
      title: "Id",
      dataIndex: "key",
      width:50,
    },
    {
      title: "UUID",
      width: 200,
       ...getColumnSearchProps("uuid"),
      render: (record) => {
        return (
          <div
            className="hover:text-[#4096ff] cursor-pointer"
            onClick={() => showDrawer(record.uuid)} // Gọi showDrawer với uuid
          >
            {record.uuid}
          </div>
        );
      },
    },
    {
      title: "Genre Name",
      dataIndex: "genreName",
      key: "genreName",

      ...getColumnSearchProps("genreName"),
      width: 100,
      sorter: (a, b) => a.genreName.length - b.genreName.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width:50,
    },
    {
      title: "Action",
      width:150,
      render: () => (
        <div className="flex gap-4">
          <Popconfirm
            title="Delete the genre"
            description="Are you sure to delete this genre?"
            onConfirm={confirm}
            onCancel={cancel}
            okText={<>Yes</>}
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          <Button type="text">Update</Button>
        </div>
      ),
    },
  ];
  useEffect(() => {
    getAllGenre();
  }, []);
  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Create Genre
      </Button>
      <Drawer
        title="Chi tiết thể loại phim"
        placement="right"
        onClose={onClose}
        open={open}
        width={400}
      >
        {genreDetail ? (
          <div>
            <p><strong>UUID:</strong> {genreDetail.uuid}</p>
            <p><strong>Tên Thể Loại:</strong> {genreDetail.genreName}</p>
            <p><strong>Trạng Thái:</strong> {genreDetail.status}</p>
            {/* Thêm các thông tin khác nếu cần */}
          </div>
        ) : (
          <p>Không có thông tin chi tiết để hiển thị.</p>
        )}
      </Drawer>
      <Modal
        title="Create Genre Modal"
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
          <Form.Item<FieldType>
            label="Genre Name"
            name="genreName"
            rules={[
              { required: true, message: "Please input your genreName!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Create Genre
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table

        columns={columns}
        dataSource={listGenreMap}
        scroll={{ x: 1000, y: 500 }}
        pagination={{
          showTotal: (total, range) => {
            return `${range[0]}-${range[1]} of ${total} items`;
          },
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
      />
    </>
  );
};

export default AdminGenre;