import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Navbar } from "../../components/common/Navbar";
import { ProfileDrawer } from "../../components/common/ProfileDrawer";
import { PaymentModal } from "../../components/common/PaymentModal";
import { Toast } from "../../components/common/Toast";

import { FeeSection } from "../../components/fees/FeeSection";
import { HostelSection } from "../../components/hostel/HostelSection";


export default function StudentDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // const [activeTab, setActiveTab] = useState("fees");
  const [fees, setFees] = useState([]);
  const [studentId] = useState("");

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // 1. Fetch Dues
    fetch("https://mess-management-system-q6us.onrender.com/api/admin/my-dues", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`
      },
    })
      .then((res) => res.json())
      .then((data) => buildFeesList(data))
      .catch(console.error);

    // 2. Fetch full Profile (for hostel attendance and check if inmate)
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const admissionNo = user.username;
    if (admissionNo) {
       fetch(`https://mess-management-system-q6us.onrender.com/api/students/admission/${admissionNo}`, {
         headers: {
           Authorization: `Bearer ${sessionStorage.getItem("token")}`
         }
       })
       .then(res => res.json())
       .then(data => setProfile(data))
       .catch(console.error);
    }
  }, []);

  function buildFeesList(data) {
    const list = data.map((f) => {
      let st = "notpaid";

      if (f.status === "paid") st = "paid";
      else st = "notpaid";

      const sectionName = f.feeSection.name?.toLowerCase() || "";
      let category = f.feeSection.category || "Academic";

      // Priority categorization for HOD/Advisor/Library
      if (
        sectionName.includes("hod") || 
        sectionName.includes("advisor") || 
        sectionName.includes("library")
      ) {
        category = "Fine";
      }

      return {
        id: f._id,
        type: f.feeSection.name,
        cat: category,
        amt: f.amount,
        pub: f.updatedAt ? new Date(f.updatedAt).toISOString().split("T")[0] : "-",
        due: f.dueDate ? new Date(f.dueDate).toISOString().split("T")[0] : "-",
        status: st,
        paidDate: f.status === "paid" ? (f.updatedAt ? new Date(f.updatedAt).toISOString().split("T")[0] : "-") : "-",
        month: "Current",
        receiptUrl: null,
        remark: f.remark || null,
      };
    });

    setFees(list);
  }
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const navigate = useNavigate();

  // const width = useWindowWidth();

  const handlePayNow = (id) => {
    const fee = fees.find((f) => f.id === id);
    if (!fee) return;
    setModalData({
      id: fee.id,
      title: fee.type,
      sub: `To ${fee.cat}`,
      amount: `₹${fee.amt.toLocaleString("en-IN")}`,
      cat: fee.cat,
      entityModel: fee.type === "Fine" ? "Fine" : "Fee",
    });
  };

  const handleConfirmPayment = (receiptData) => {
    console.log(studentId);
    console.log(modalData);
    
    if (!studentId || !modalData) {
      setToastMsg(
        "Error: Not logged in properly. Please refresh and try again.",
      );
      setToast(true);
      return;
    }

    const file = receiptData?.file;
    if (!file) {
      setToastMsg("Please attach a receipt file before submitting.");
      setToast(true);
      return;
    }

    const doSubmit = (receiptUrl) => {
      fetch(`http://localhost:5001/api/students/${studentId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:
            receiptData?.amount ||
            Number(String(modalData.amount).replace(/[^0-9.-]+/g, "")),
          referenceId: receiptData?.receiptNo || "RECEIPT_UPLOAD",
          type: modalData.entityModel,
          relatedEntity: modalData.id,
          receiptUrl: receiptUrl || null,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setToastMsg(
            data.message || "Receipt submitted! Status changed to Verifying.",
          );
          setToast(true);
          setModalData(null);
          setTimeout(() => setToast(false), 4000);
          return fetch(`http://localhost:5001/api/students/${studentId}/dues`)
            .then((r) => r.json())
            .then(buildFeesList)
            .catch(console.error);
        })
        .catch((err) => {
          console.error(err);
          setToastMsg("Submission failed. Please try again.");
          setToast(true);
        });
    };

    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => doSubmit(e.target.result);
      reader.readAsDataURL(file);
    } else {
      doSubmit(file);
    }
  };

  return (
    <>
      <Navbar
        onAvatarClick={() => setDrawerOpen(true)}
        onLogout={() => {
          setToastMsg("Logged out");
          setToast(true);
          setTimeout(() => navigate("/login"), 800);
        }}
      />
      <FeeSection fees={fees} onPayNow={handlePayNow} />
      {profile?.hostelName && (
        <HostelSection attendance={profile.attendance} />
      )}
      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <PaymentModal
        modalData={modalData}
        onClose={() => setModalData(null)}
        onConfirm={handleConfirmPayment}
      />
      <Toast show={toast} setShow={setToast} message={toastMsg} />
    </>
  );
}
