import { PlayCircleOutlined, RightCircleFilled, LeftCircleFilled } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ContentApp = () => {
    const navigate = useNavigate();
    const [nowShowingStartIndex, setNowShowingStartIndex] = useState(0); // For "Phim đang chiếu"
    const [upcomingStartIndex, setUpcomingStartIndex] = useState(0); // For "Phim sắp chiếu"
    const moviesPerPage = 5; // Số phim hiển thị trên mỗi trang
    const movies = [
        { id: 1, title: "Ngày Xưa Có Một Chuyện Tình", genre: "Lãng Mạn", rating: 8.9, age: "16+", image: "/images/movie-upload-content.jpeg", link: "/movie/1" },
        { id: 2, title: "Venom: Kẻo Cuối", genre: "Khoa Học Viễn Tưởng, Phiêu Lưu", rating: 9.1, age: "13+", image: "/images/movie-upload-content2.jpg", link: "/movie/2" },
        { id: 3, title: "Tee Yod: Quỷ Án Tang Phần 2", genre: "Kinh Dị, Gây Cấn", rating: 9.5, age: "18+", image: "/images/movie3.jpeg", link: "/movie/3" },
        { id: 4, title: "Thần Dược", genre: "Kinh Dị, Khoa Học Viễn Tưởng", rating: 9.0, age: "18+", image: "/images/movie4.jpeg", link: "/movie/4" },
        { id: 5, title: "Cô Dâu Hào Môn", genre: "Hài, Gia Đình", rating: 8.0, age: "18+", image: "/images/movie5.jpeg", link: "/movie/5" },
        { id: 6, title: "Cô Dâu Hào Môn", genre: "Hài, Gia Đình", rating: 8.0, age: "18+", image: "/images/movie5.jpeg", link: "/movie/6" },
        { id: 7, title: "Cô Dâu Hào Môn", genre: "Hài, Gia Đình", rating: 8.0, age: "18+", image: "/images/movie5.jpeg", link: "/movie/7" },
    ];

    const handleNextNowShowing = () => {
        if (nowShowingStartIndex + moviesPerPage < movies.length) {
            setNowShowingStartIndex(nowShowingStartIndex + moviesPerPage);
        }
    };

    const handlePrevNowShowing = () => {
        if (nowShowingStartIndex - moviesPerPage >= 0) {
            setNowShowingStartIndex(nowShowingStartIndex - moviesPerPage);
        }
    };

    const handleNextUpcoming = () => {
        if (upcomingStartIndex + moviesPerPage < movies.length) {
            setUpcomingStartIndex(upcomingStartIndex + moviesPerPage);
        }
    };

    const handlePrevUpcoming = () => {
        if (upcomingStartIndex - moviesPerPage >= 0) {
            setUpcomingStartIndex(upcomingStartIndex - moviesPerPage);
        }
    };

    return (
        <div>
            <div className="relative bg-black py-16">
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                    <img
                        className="h-full w-full object-contain"
                        src="/images/movie-upload-content2.jpg"
                        alt="Img-movie-content"
                    />
                </div>
                <div className="relative z-10 ">
                    <h1 className="text-center text-white text-4xl font-bold mb-8">Phim đang chiếu</h1>
                    <div className="flex justify-center items-center relative">
                        <div className="relative flex space-x-4 overflow-hidden p-10">
                            {/* Nút điều hướng trái */}
                            {nowShowingStartIndex > 0 && (
                                <Button
                                    type="text"
                                    icon={<LeftCircleFilled style={{ fontSize: 36, color: "white" }} />}
                                    onClick={handlePrevNowShowing}
                                    className="absolute left-7 top-1/3 transform -translate-x-1 -translate-y-1 bg-opacity-75 hover:opacity-75 rounded-full p-2 z-10"
                                />
                            )}
                            {movies.slice(nowShowingStartIndex, nowShowingStartIndex + moviesPerPage).map((movie) => (
                                <div
                                    key={movie.id}
                                    className="relative w-72 rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
                                    onClick={() => navigate(movie.link)}
                                >
                                    <img
                                        className="w-full h-80 object-cover transition-transform duration-300 transform hover:scale-105"
                                        src={movie.image}
                                        alt={movie.title}
                                    />
                                    <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">
                                        {movie.age}
                                    </div>
                                    <Button
                                        type="text"
                                        className="absolute inset-0 m-auto flex items-center justify-center rounded-full bg-opacity-50 hover:bg-opacity-70 pb-20"
                                        icon={<PlayCircleOutlined style={{ fontSize: 32, color: "white", borderRadius: "50%" }} />}
                                    />
                                    <div className="p-4 text-white">
                                        <h3 className="font-bold text-lg truncate overflow-hidden whitespace-nowrap">{movie.title}</h3>
                                        <p className="text-sm text-gray-300">{movie.genre}</p>
                                        <p className="flex items-center mt-1 text-yellow-400">
                                            <span className="text-sm mr-1">★</span>
                                            {movie.rating}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Nút điều hướng phải */}
                            {nowShowingStartIndex + moviesPerPage < movies.length && (
                                <Button
                                    type="text"
                                    icon={<RightCircleFilled style={{ fontSize: 36, color: "white" }} />}
                                    onClick={handleNextNowShowing}
                                    className="absolute right-1 top-1/3 transform -translate-x-1 -translate-y-1 bg-opacity-75 hover:opacity-75 rounded-full p-2 z-10"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Phần "Phim sắp chiếu" */}
            <div>
                <h1 className="text-center text-red-600 text-4xl font-bold pt-20">Phim sắp chiếu</h1>
                <div className="flex justify-center items-center relative">
                    <div className="relative flex space-x-4 overflow-hidden p-10">
                        {/* Nút điều hướng trái */}
                        {upcomingStartIndex > 0 && (
                            <Button
                                type="text"
                                icon={<LeftCircleFilled style={{ fontSize: 36, color: "white" }} />}
                                onClick={handlePrevUpcoming}
                                className="absolute left-6 top-1/3 transform -translate-x-1 -translate-y-1 bg-black bg-opacity-50 hover:opacity-100 rounded-full p-2 z-10 "
                                style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}
                            />
                        )}
                        {movies.slice(upcomingStartIndex, upcomingStartIndex + moviesPerPage).map((movie) => (
                            <div
                                key={movie.id}
                                className="relative w-72 rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
                                onClick={() => navigate(movie.link)}
                            >
                                <img
                                    className="w-full h-80 object-cover transition-transform duration-300 transform hover:scale-105"
                                    src={movie.image}
                                    alt={movie.title}
                                />
                                <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">
                                    {movie.age}
                                </div>
                                <Button
                                    type="text"
                                    className="absolute inset-0 m-auto flex items-center justify-center rounded-full bg-opacity-50 hover:bg-opacity-70 pb-20"
                                    icon={<PlayCircleOutlined style={{ fontSize: 32, color: "white", borderRadius: "50%" }} />}
                                />
                                <div className="p-4 text-black">
                                    <h3 className="font-bold text-lg truncate overflow-hidden whitespace-nowrap">{movie.title}</h3>
                                    <p className="text-sm text-gray-800">{movie.genre}</p>
                                    <p className="flex items-center mt-1 text-yellow-400">
                                        <span className="text-sm mr-1">★</span>
                                        {movie.rating}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Nút điều hướng phải */}
                        {upcomingStartIndex + moviesPerPage < movies.length && (
                            <Button
                                type="text"
                                icon={<RightCircleFilled style={{ fontSize: 36, color: "white" }} />}
                                onClick={handleNextUpcoming}
                                className="absolute right-1 top-1/3 transform -translate-x-1 -translate-y-1 bg-black bg-opacity-50 hover:bg-opacity-100 rounded-full p-2 z-10 border border-white"
                                style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentApp;
