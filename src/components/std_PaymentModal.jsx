import React from "react";

function PaymentModal({ fee, onClose, onConfirm }) {

  if (!fee) return null;

  return (
    <div className="modal-bg">
      <div className="modal">

        <h3>Pay {fee.type}</h3>

        <p>Amount: ₹{fee.amt}</p>

        <button onClick={onConfirm}>
          Confirm Payment
        </button>

        <button onClick={onClose}>
          Cancel
        </button>

      </div>
    </div>
  );
}

export default PaymentModal;