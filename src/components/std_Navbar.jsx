import React from "react";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>UNIPAY</h2>

      <div className="user-info">
        <span>TIYANA K K</span>
        <button>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;