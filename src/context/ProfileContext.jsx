import { createContext, useContext, useState } from "react";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    fullName: "Enrollment Admin",
    email: "admin@college.edu",
    role: "Student Enrollment Manager",
  });

  // Derive initials from fullName for the avatar
  const initials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const updateProfile = (updated) =>
    setProfile((prev) => ({ ...prev, ...updated }));

  return (
    <ProfileContext.Provider value={{ profile, initials, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}