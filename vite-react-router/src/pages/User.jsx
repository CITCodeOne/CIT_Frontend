import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import UserBanner from "../components/UserBanner";
import defaultAvatar from "../pics/DefaultProfilePicture.jpg";

export default function User() {
  const { userId } = useParams();
  const fileInputRef = useRef(null);

  // Dummy user data
  const apiUser = {
    id: userId,
    username: "PixelPirat_47",
    email: "pixelpirat47@moonmail.net",
    createdAt: "2023-01-10T12:00:00Z",
    ratingsCount: 42,
    bookmarksCount: 12,
    role: "Admin",
    avatarUrl: null,
  };

  const [avatarUrl, setAvatarUrl] = useState(
    apiUser.avatarUrl || defaultAvatar
  );
  const [isEditMode, setIsEditMode] = useState(false);

  // Authentication dummy data
  const loggedInUserId = "123";
  const isLoggedIn = true;
  const isOwnProfile = isLoggedIn && loggedInUserId === userId;

  const handleToggleEditMode = () => {
    if (!isOwnProfile) return;
    setIsEditMode((prev) => !prev);
  };

  const handleShareClick = async () => {
    const profileUrl = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
        alert("Profile link copied to clipboard");
      } else {
        alert(`Share this link: ${profileUrl}`);
      }
    } catch {
      alert(`Share this link: ${profileUrl}`);
    }
  };

  const handleAvatarClick = () => {
    if (!isOwnProfile || !isEditMode) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const newUrl = URL.createObjectURL(file);
    setAvatarUrl(newUrl);
    // BACKEND: Upload new profile picture to user in backend
  };

  return (
    <main className="container py-4">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="d-none"
        onChange={handleAvatarFileChange}
      />

      <UserBanner
        username={apiUser.username}
        email={apiUser.email}
        createdAt={apiUser.createdAt}
        ratingsCount={apiUser.ratingsCount}
        bookmarksCount={apiUser.bookmarksCount}
        avatarUrl={avatarUrl}
        role={apiUser.role}
        isOwnProfile={isOwnProfile}
        isEditMode={isEditMode}
        onEditClick={handleToggleEditMode}
        onAvatarClick={handleAvatarClick}
        onShareClick={handleShareClick}
      />
    </main>
  );
}
