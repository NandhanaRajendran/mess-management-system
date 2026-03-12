import { useNavigate } from "react-router-dom";

export default function RoomCard({ room }) {

  const navigate = useNavigate();

  const openRoom = () => {

    navigate(`/attendance/${room}`);

  };

  return (

    <div className="room-card" onClick={openRoom}>

      <h3>Room {room}</h3>

    </div>

  );
}