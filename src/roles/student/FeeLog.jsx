import React, { useState } from "react";
import StudentLayout from "./StudentLayout";
import { INITIAL_FEES } from "../../data/feesData";
import PaymentModal from "../../components/PaymentModal";
import Toast from "../../components/Toast";

function FeeLog() {

  const [fees, setFees] = useState(INITIAL_FEES);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(false);

  const payFee = () => {

    setFees(
      fees.map(f =>
        f.id === selected.id
          ? { ...f, status: "paid" }
          : f
      )
    );

    setSelected(null);
    setToast(true);

    setTimeout(() => setToast(false), 3000);
  };

  return (

    <StudentLayout>

      <h2>Fee Log</h2>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Fee</th>
            <th>Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>

          {fees.map(f => (

            <tr key={f.id}>

              <td>{f.id}</td>
              <td>{f.type}</td>
              <td>₹{f.amt}</td>
              <td>{f.status}</td>

              <td>
                {f.status !== "paid" &&
                <button
                 onClick={() => setSelected(f)}
                >
                 Pay
                </button>}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <PaymentModal
       fee={selected}
       onClose={() => setSelected(null)}
       onConfirm={payFee}
      />

      <Toast show={toast}/>

    </StudentLayout>
  );
}

export default FeeLog;