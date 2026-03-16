import React from "react";

function Toast({ show }) {

  if (!show) return null;

  return (
    <div className="toast">
      Payment Successful
    </div>
  );
}

export default Toast;