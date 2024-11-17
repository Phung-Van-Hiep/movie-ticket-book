import Calendar from "../../blocks/Header/CalendarApp";
import ContentApp from "../../blocks/Header/ContentApp";
import HeaderApp from "../../blocks/Header/HeaderApp";

const HomePage = () => {
  return (
    <div>
      <HeaderApp />
      <ContentApp />
      <Calendar />
    </div>
  );
};

export default HomePage;
