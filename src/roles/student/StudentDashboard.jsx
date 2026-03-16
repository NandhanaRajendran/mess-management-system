import React, { useState } from "react";
import { INITIAL_FEES } from "../../utils/constants";
//import { useWindowWidth } from "../../hooks/useWindowWidth";

import { Navbar } from "../../components/common/Navbar";
import { ProfileDrawer } from "../../components/common/ProfileDrawer";
import { PaymentModal } from "../../components/common/PaymentModal";
import { Toast } from "../../components/common/Toast";

import { FeeSection } from "../../components/fees/FeeSection";
import { HostelSection } from "../../components/hostel/HostelSection";

export default function StudentDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
 // const [activeTab, setActiveTab] = useState("fees");
  const [fees, setFees] = useState(INITIAL_FEES);
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState(false);

  //const width = useWindowWidth();

  return (
    <>
      <Navbar />
      <FeeSection
        fees={fees}
        setFees={setFees}
        setModalData={setModalData}
      />
      <HostelSection />
      <ProfileDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
      />
      <PaymentModal
        modalData={modalData}
        setModalData={setModalData}
      />
      <Toast show={toast} setShow={setToast} />
    </>
  );
}