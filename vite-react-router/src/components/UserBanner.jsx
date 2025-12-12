import React from "react";
import defaultAvatar from "../pics/DefaultProfilePicture.jpg";

export default function UserBanner({
  user_name,
  email,
  createdAt,
  ratingsCount,
  bookmarksCount,
  profile_image,
  role,
  isOwnProfile,
  isEditMode,
  onEditClick,
  onAvatarClick,
  onShareClick,
}) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : ""; // Prettify the join date.

  const canClickAvatar = isOwnProfile && isEditMode; // Owner can click avatar when editing.
  const imgSrc = profile_image || defaultAvatar; // Fallback to default avatar image.

  return (
    <section className="container my-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
            <div className="d-flex flex-column align-items-center me-md-3">
              <div
                className={canClickAvatar ? "position-relative" : ""}
                style={{ cursor: canClickAvatar ? "pointer" : "default" }} // Only hint clickable when editing.
                onClick={canClickAvatar ? onAvatarClick : undefined}
              >
                <img
                  src={imgSrc}
                  alt={`${user_name}'s avatar`}
                  className="rounded-circle border"
                  style={{ width: "96px", height: "96px", objectFit: "cover" }} // Keep avatar square.
                />
                {canClickAvatar && (
                  <span
                    className="position-absolute top-50 start-50 translate-middle badge bg-dark bg-opacity-75"
                    style={{ fontSize: "0.7rem" }} // Overlay prompt when avatar is editable.
                  >
                    Upload image
                  </span>
                )}
              </div>

              {role && (
                <span className="badge bg-primary mt-2 text-uppercase">
                  {role}
                </span>
              )}
            </div>

            <div className="flex-grow-1">
              <div className="d-flex flex-column flex-md-row align-items-md-baseline gap-2">
                <h2 className="h4 mb-0">{user_name}</h2>
                {email && <span className="text-muted small">{email}</span>}
              </div>

              <div className="mt-2 text-muted small">
                {createdAt && <span className="me-3">Joined: {formattedDate}</span>}
              </div>

              <div className="mt-2 d-flex flex-wrap gap-3 small">
                <span>Ratings: {ratingsCount}</span>
                <span>Bookmarks: {bookmarksCount}</span>
              </div>
            </div>

            <div className="d-flex flex-column align-items-stretch gap-2 mt-3 mt-md-0">
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={onEditClick}
                  className="btn btn-outline-primary btn-sm"
                >
                  {isEditMode ? "Done" : "Edit profile"}
                </button>
              )}

              <button
                type="button"
                onClick={onShareClick}
                className="btn btn-outline-primary btn-sm"
              >
                Share profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}