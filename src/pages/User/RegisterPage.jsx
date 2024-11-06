import { Col, DatePicker, message, Modal, Radio, Row } from "antd";
import { Button, Form, Input } from "antd";
import { useState } from "react";
import { APIRegister } from "../../services/service.api";



const RegisterPage = ({
  isModalRegisterOpen,
  handleModalRegisterCancel,
  showModalLogin,
}) => {
  const [value, setValue] = useState(1);
  const [form] = Form.useForm();

  const onChange = (e) => {

    setValue(e.target.value);
  };

  const handleFullnameChange = (e) => {
    const inputValue = e.target.value;
    
    // Chỉ xử lý khi người dùng dừng nhập
    const formattedValue = inputValue.replace(/\s{2,}/g, ' ');
    
    form.setFieldsValue({ fullname: formattedValue });
  };

  const onFinish = async (values) => {
    const { birthday, ...restValues } = values;

    const birthdayObj = new Date(birthday);

    const formatToDateString = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const birthdayFormat = formatToDateString(birthdayObj);
    const dataRegister = {
      ...restValues,
      birthday: birthdayFormat,
    };

    try {
      const res = await APIRegister(dataRegister);


      if (res && res.status === 200) {
        message.success("Đăng Ký thành công !!!");
        handleModalRegisterCancel();
        form.resetFields();
      }
    } catch (error) {
      console.error("Failed:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          "Đã xảy ra lỗi khi đăng ký.";
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

  const onFinishFailed = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Modal
        open={isModalRegisterOpen}
        onCancel={() => {
          form.resetFields();
          handleModalRegisterCancel();
        }}
        footer={<></>}
        style={{ top: 20 }}
      >
        <div className="login-container ">
          <div className="header-form ">
            <div className="logo"></div>
            <div className="title-form text-[50px] font-normal text-center ">
              Đăng Ký
            </div>
            <div className="description-sign-in text-center ">
              Chào mừng trở lại! Vui lòng nhập thông tin để đăng Ký.
            </div>
          </div>
          <div className="form-content ">
            <Form
              form={form}
              name="basic"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label={<div className="font-semibold">Email</div>}
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Xin hãy nhập Email của bạn!",
                      },
                      {
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Vui lòng nhập địa chỉ Email hợp lệ!",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập Email...." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<div className="font-semibold">Họ Tên</div>}
                    name="fullname"
                    rules={[
                      {
                        required: true,
                        message: "Xin hãy nhập họ và tên bạn!",
                      },
                      {
                        pattern: /^[\p{L}\s]+$/u,
                        message: "Họ tên chỉ được dùng ký tự!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập Họ Tên...."
                      onChange={handleFullnameChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label={<div className="font-semibold">Số điện thoại</div>}
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        message: "Xin hãy nhập số điện thoại của bạn!",
                      },
                      {
                        pattern: /^0\d{9}$/,
                        message:
                          "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số!",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập số điện thoại..." />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={<div className="font-semibold">Ngày sinh</div>}
                    name="birthday"
                    rules={[
                      {
                        required: true,
                        message: "Hãy nhập ngày sinh của bạn!",
                      },
                    ]}
                  >
                    <DatePicker
                      placeholder="Ngày sinh"
                      variant="filled"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label={<div className="font-semibold">Mật khẩu</div>}
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Xin hãy nhập password của bạn!",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <div className="font-semibold">Xác nhận mật khẩu </div>
                    }
                    name="password2"
                    rules={[
                      {
                        required: true,
                        message: "Xin hãy nhập lại password của bạn!",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Xác nhận mật khẩu..." />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label={<div className="font-semibold">Giới tính</div>}
                name="gender"
                rules={[
                  { required: true, message: "Hãy chọn giới tính của bạn" },
                ]}
              >
                <Radio.Group onChange={onChange} value={value}>
                  <Radio value={0}>Nam</Radio>
                  <Radio value={1}>Nữ</Radio>
                  <Radio value={2}>Khác</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item wrapperCol={{ span: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-[450px] bg-[#DA2778] hover:bg-[#DA2778]"
                >
                  Đăng Ký
                </Button>
              </Form.Item>
            </Form>
            <div>
              Bạn có tài khoản?{" "}
              <span
                className="font-bold cursor-pointer"
                onClick={showModalLogin}
              >
                Đăng Nhập.
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterPage;
