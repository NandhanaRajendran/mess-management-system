import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import RoomCard from "../components/RoomCard";

export default function Dashboard() {

  const rooms = [
    1101,1102,1103,1104,1105,
    1106,1107,1108,1109,1110,
    1111,1112,1113,1114
  ];

  return (

    <div className="layout">

      <Sidebar />

      <div className="main">

        <Header />

        <div className="rooms">

          {rooms.map((room,index)=>(
            <RoomCard key={index} room={room}/>
          ))}

        </div>

      </div>

    </div>

  );
}