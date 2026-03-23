import React, { useState } from "react";
import { C } from "../../utils/constants";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import { GradCap, UserIcon, LogoutIcon } from "../icons";
import { useNavigate } from "react-router-dom";

export function Navbar({ onAvatarClick }) {
  const navigate = useNavigate();
  const profile = JSON.parse(sessionStorage.getItem("profile"));

  const w = useWindowWidth();
  const isMobile = w < 640;

  const [hoverAvatar, setHoverAvatar] = useState(false);
  const [hoverLogout, setHoverLogout] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: C.white,
        borderBottom: `1.5px solid ${C.border}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 8px rgba(37,99,235,.07)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "0 16px" : "0 28px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontSize: isMobile ? 17 : 20,
            fontWeight: 800,
            color: C.accent,
            letterSpacing: "-.3px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: `linear-gradient(135deg,${C.accent},${C.accent2})`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GradCap />
          </div>
          UNIPAY
        </div>

        {/* Right Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 10 : 14,
          }}
        >
          {!isMobile && (
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.text,
                  lineHeight: 1.2,
                }}
              >
                {profile?.name || "User"}
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  color: C.muted,
                  fontWeight: 500,
                }}
              >
                Admission No: {profile?.admissionNo || "-"}
              </div>
            </div>
          )}

          {/* Avatar */}
          <div
            onMouseEnter={() => setHoverAvatar(true)}
            onMouseLeave={() => setHoverAvatar(false)}
            onClick={onAvatarClick}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: hoverAvatar
                ? `linear-gradient(135deg,${C.accent},${C.accent2})`
                : "linear-gradient(135deg,#dbeafe,#bfdbfe)",
              border: `2px solid ${C.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: hoverAvatar ? "#fff" : C.accent,
              transition: "all .2s",
              flexShrink: 0,
            }}
          >
            <UserIcon />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            onMouseEnter={() => setHoverLogout(true)}
            onMouseLeave={() => setHoverLogout(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: isMobile ? "7px 10px" : "7px 16px",
              borderRadius: 8,
              background: hoverLogout ? C.accentLight : C.white,
              border: `1.5px solid ${hoverLogout ? C.accent : C.border2}`,
              color: hoverLogout ? C.accent : C.text2,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
            }}
          >
            <LogoutIcon />
            {!isMobile && "Logout"}
          </button>
        </div>
      </div>
    </nav>
  );
}
