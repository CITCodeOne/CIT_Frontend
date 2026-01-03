import defaultAvatar from "../pics/DefaultProfilePicture.jpg"; // Standardprofil hvis brugeren ikke har et billede
import { normalizeDataUrl } from "./utils/profileImageUtils"; // Helper der sikrer at base64/data-url er gyldige

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
  showUndo,
  onUndoAvatar,
  onShareClick,
}) {
  const normalizedImage = (() => {
    if (!profile_image || profile_image.trim() === "") return defaultAvatar; // Ingen billedvaerdi -> brug standard
    try {
      const normalized = normalizeDataUrl(profile_image); // Forsoger at formatere data-url korrekt
      if (normalized && (normalized.includes("not-found") || normalized.includes("error") || normalized.includes("Image-not-found"))) {
        return defaultAvatar; // Hvis strengen ligner en fejl, brug fallback
      }
      return normalized || defaultAvatar; // Brug normaliseret billede, ellers fallback
    } catch (err) {
      return defaultAvatar; // Eventuelle fejl giver fallback for at undgaa brudt billede
    }
  })();
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : ""; // Giver en laesbar dato for hvornår profilen blev oprettet

  const canClickAvatar = isOwnProfile && isEditMode; // Ejer maa kun klikke paa billedet i redigeringstilstand
  const imgSrc = normalizedImage; // Endeligt billede der vises

  return (
    <section className="container my-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
            <div className="d-flex flex-column align-items-center me-md-3">
              <div
                className={canClickAvatar ? "position-relative" : ""}
                style={{ cursor: canClickAvatar ? "pointer" : "default" }} // Viser haandcursor kun naar billede kan aendres
                onClick={canClickAvatar ? onAvatarClick : undefined}
              >
                <img
                  src={imgSrc}
                  alt={`${user_name}'s avatar`}
                  className="rounded-circle border"
                  style={{ width: "96px", height: "96px", objectFit: "cover" }} // Holder billedet kvadratisk og beskærer pænt
                />
                {canClickAvatar && (
                  <span
                    className="position-absolute top-50 start-50 translate-middle badge bg-dark bg-opacity-75"
                    style={{ fontSize: "0.7rem" }} // Overlay tekst der viser at man kan uploade
                  >
                    Upload image
                  </span>
                )}
                {canClickAvatar && showUndo && typeof onUndoAvatar === 'function' && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onUndoAvatar(); }}
                    className="btn btn-sm btn-light position-absolute"
                    style={{ right: -6, bottom: -6, borderRadius: '50%', padding: '4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} // Lille undo-knap i hjoernet
                    title="Undo avatar change"
                  >
                    ⤺
                  </button>
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
                {createdAt && <span className="me-3">Joined: {formattedDate}</span>} {/* Viser tilmeldingsdato hvis vi har den */}
              </div>

              <div className="mt-2 d-flex flex-wrap gap-3 small">
                <span>Ratings: {ratingsCount}</span> {/* Antal ratings brugeren har lavet */}
                <span>Bookmarks: {bookmarksCount}</span> {/* Antal bogmaerker brugeren har */}
              </div>
            </div>

            <div className="d-flex flex-column align-items-stretch gap-2 mt-3 mt-md-0">
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={onEditClick}
                  className="btn btn-outline-primary btn-sm"
                >
                  {isEditMode ? "Done" : "Edit profile"} {/* Skift mellem at redigere og afslutte redigering */}
                </button>
              )}

              <button
                type="button"
                onClick={onShareClick}
                className="btn btn-outline-primary btn-sm"
              >
                Share profile {/* Starter deling (fx kopi af link) */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}