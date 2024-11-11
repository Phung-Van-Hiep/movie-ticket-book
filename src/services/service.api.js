import instance from '../customs/customizes.api';
export const APILogin = (data) => {
  return instance.post('/api/v1/Auth/login', data, {
    headers: {
      'Content-Type': 'application/json' // Đảm bảo Content-Type đúng
    }
  });
};

//User
export const APIRegister = (data) => {
  return instance.post('/api/v1/User/register', data);
};
export const APIGetAllUser = (data) => {
  return instance.post('/api/v1/User/page_list_user', data);
};
export const APIUpdateUser = (data) => {
  return instance.post('/api/v1/User/update_user', data);
};
export const APIGetUserDetail = (data) => {
  return instance.post('/api/v1/User/detail_user', data);
};
export const APIDeleteUser = (data) => {
  return instance.post('/api/v1/User/update_user_status', data);
};

//Genre
export const APICreateGenre = (data) => {
  return instance.post('/api/v1/Genre/upsert_genre', data);
};
export const APIGetAllGenre = (data) => {
  return instance.post('/api/v1/Genre/page_list_genre', data);
};
export const APIGetGenreDetail = (data) => {
  return instance.post('/api/v1/Genre/genre_detail', data);
};

export const APIDeleteGenre = (data) => {
  return instance.post('/api/v1/Genre/update_genre_status', data);
};

//Region
export const APICreateRegion = (data) => {
  return instance.post('/api/v1/Region/upsert_region', data);
};
export const APIGetAllRegion = (data) => {
  return instance.post('/api/v1/Region/page_list_region', data);
};
export const APIGetRegionDetail = (data) => {
  return instance.post('/api/v1/Region/region_detail', data);
};

export const APIDeleteRegion = (data) => {
  return instance.post('/api/v1/Region/update_region_status', data);
};

//Director
export const APICreateDirector = (data) => {
  return instance.post('/api/v1/Director/upsert_director', data);
};
export const APIGetAllDirector = (data) => {
  return instance.post('/api/v1/Director/page_list_director', data);
};
export const APIGetDirectorDetail = (data) => {
  return instance.post('/api/v1/Director/director_detail', data);
};

export const APIDeleteDirector = (data) => {
  return instance.post('/api/v1/Director/update_director_status', data);
};

//Cast
export const APICreateCast = (data) => {
  return instance.post('/api/v1/Cast/upsert_cast', data);
};
export const APIGetAllCast = (data) => {
  return instance.post('/api/v1/Cast/page_list_cast', data);
};
export const APIGetCastDetail = (data) => {
  return instance.post('/api/v1/Cast/cast_detail', data);
};

export const APIDeleteCast = (data) => {
  return instance.post('/api/v1/Cast/update_cast_status', data);
};

//Movie
export const APICreateMovies = (data) => {
  return instance.post('/api/v1/Movies/upsert_movies', data);
};
export const APIGetAllMovies = (data) => {
  return instance.post('/api/v1/Movies/page_list_movies', data);
};
export const APIGetMoviesDetail = (data) => {
  return instance.post('/api/v1/Movies/movies_detail', data);
};
export const APIDeleteMovie = (data) => {
  return instance.post('/api/v1/Movies/update_movies_status', data);
};

//Cinema
export const APICreateCinemas = (data) => {
  return instance.post('/api/v1/Cinemas/upsert_cinema', data);
};
export const APIGetAllCinemas = (data) => {
  return instance.post('/api/v1/Cinemas/page_list_cinema', data);
};
export const APIGetCinemasDetail = (data) => {
  return instance.post('/api/v1/Cinemas/cinema_detail', data);
};

export const APIDeleteCinemas = (data) => {
  return instance.post('/api/v1/Cinemas/update_cinema_status', data);
};

//Screen
export const APICreateScreen = (data) => {
  return instance.post('/api/v1/Screen/create_screen', data);
};
export const APIUpdateScreen = (data) => {
  return instance.post('/api/v1/Screen/update_screen', data);
};
export const APIGetAllScreen = (data) => {
  return instance.post('/api/v1/Screen/page_list_screen', data);
};
export const APIGetScreenDetail = (data) => {
  return instance.post('/api/v1/Screen/screen_detail', data);
};

export const APIDeleteScreen = (data) => {
  return instance.post('/api/v1/Screen/update_screen_status', data);
};
export const APIGetALLSeat = (data) => {
  return instance.post('/api/v1/Screen/get_list_seat', data);
};

//Upload Image

export const APIUploadImage = (FileData, Type) => {
  const formData = new FormData();

  if (FileData) formData.append('FileData', FileData);
  if (Type) formData.append('Type', Type);
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' }
    // Authorization: `Bearer ${localStorage.getItem('access_token')}`
  };
  return instance.put(`/api/v1/Upload/upload-image`, formData, config);
};
