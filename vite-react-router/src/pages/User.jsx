import React from 'react';
import MainDisplay from '../components/MainDisplay';

function User() {
    // Example data for an actor
    const actorData = {
        name: 'Morgan Freeman',
        poster: 'https://image.tmdb.org/t/p/w500/jPsLqiYGSofU4s6BjrxnefMfabb.jpg',
        bio: 'Morgan Freeman is an American actor, director, and narrator. He has appeared in a range of film genres portraying character roles and is particularly known for his distinctive deep voice.',
        birthYear: 1937,
        knownFor: [
            'The Shawshank Redemption (1994)',
            'Se7en (1995)',
            'Bruce Almighty (2003)',
            'The Dark Knight Trilogy (2005-2012)',
            'Million Dollar Baby (2004)'
        ]
    };

    return (
        <MainDisplay type="actor" data={actorData} />
    );
}

export default User;
import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import UserBanner from "../components/UserBanner";
import defaultAvatar from "../pics/DefaultProfilePicture.jpg";

export default function User() {
  const { userId } = useParams();
  const fileInputRef = useRef(null);

  // Dummy user data from "database"
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
  const loggedInUserId = "123"; // dummy
  const isLoggedIn = true;      // dummy
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
    <main style={{ padding: "2rem 5%" }}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
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
