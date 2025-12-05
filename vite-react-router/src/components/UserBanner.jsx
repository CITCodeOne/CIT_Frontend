import React from "react";
import "../style/userBanner.css";

export default function UserBanner({
  username,
  email,
  createdAt,
  ratingsCount,
  bookmarksCount,
  avatarUrl,
  role = "User",
  isOwnProfile,
  isEditMode,
  onEditClick,
  onAvatarClick,
  onShareClick,
}) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : "";

  const canClickAvatar = isOwnProfile && isEditMode;

  return (
    <section className="user-banner">
      <div className="user-banner__role-label">{role}</div>

      <div
        className={
          canClickAvatar
            ? "user-banner__avatar-wrapper user-banner__avatar-wrapper--editable"
            : "user-banner__avatar-wrapper"
        }
        onClick={canClickAvatar ? onAvatarClick : undefined}
      >
        <img
          src={avatarUrl}
          alt={`${username}'s avatar`}
          className="user-banner__avatar"
        />
        {canClickAvatar && (
          <div className="user-banner__avatar-hint">
            Upload image
          </div>
        )}
      </div>

      <div className="user-banner__main">
        <div className="user-banner__header">
          <h2 className="user-banner__username">{username}</h2>
          <span className="user-banner__email">{email}</span>
        </div>

        <div className="user-banner__meta">
          {createdAt && <span>Joined: {formattedDate}</span>}
        </div>

        <div className="user-banner__stats">
          <span>Ratings: {ratingsCount}</span>
          <span>Bookmarks: {bookmarksCount}</span>
        </div>
      </div>

      <div className="user-banner__actions">
        {isOwnProfile && (
          <button
            type="button"
            onClick={onEditClick}
            className="user-banner__btn-edit"
          >
            {isEditMode ? "Done" : "Edit profile"}
          </button>
        )}

        <button
          type="button"
          onClick={onShareClick}
          className="user-banner__btn-share"
        >
          Share profile
        </button>
      </div>
    </section>
  );
}