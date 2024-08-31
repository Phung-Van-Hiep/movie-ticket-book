import instance from "../customs/customizes.api";
export const APILogin = (data: { email: string; password: string }) => {
  return instance.post("Auth/login", data);
};
export const APIRegister = (data: {
  email: string;
  fullname: string;
  gender: number;
  birthday: string;
  phoneNumber: string;
  password: string;
  password2: string;
}) => {
  return instance.post("User/register", data);
};
export const APICreateGenre = (data: { genreName: string }) => {
  return instance.post("Genre/upsert_genre", data);
};
export const APIGetAllGenre = (data: any) => {
  return instance.post("Genre/page_list_genre", data);
};
export const APIGetGenreDetail = (data) => {
  return instance.post("Genre/geren_detail", data);
};
