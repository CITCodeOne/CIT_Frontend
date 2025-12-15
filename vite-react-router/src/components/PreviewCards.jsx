import { useEffect, useState } from 'react';
import fallbackImageAsset from '../pics/Image-not-found.png';

const resolveTitle = (item) => item?.title || item?.name || "Untitled";

const resolveSubtitle = (item) => {
  if (item.type === "Contributor") {
    return item.subtitle || item.role || "No role specified";
  }

  if (item.type === "Title") {
    return item.subtitle || "";
  }

  // For items without type, assume Title and return subtitle or empty
  return item.subtitle || "";
};

const resolveDescription = (item) =>
  item?.description || item?.blurb || item?.bio || item?.plot || "Add more metadata to this entry.";

const resolveImage = (item) => {
  const raw = item?.image || item?.poster;
  if (!raw) return null;

  // Some API responses embed a dev-time path like "/src/pics/Image-not-found.png"; treat as missing
  if (typeof raw === "string" && raw.includes("/src/pics/Image-not-found.png")) {
    return null;
  }

  return raw;
};

const fallbackImage = fallbackImageAsset;

const resolveYear = (item) => {
  if (item.year && item.year !== "n/a") return item.year;
  if (item.startYear && item.startYear !== "n/a") return item.startYear;
  if (item.releaseDate && item.releaseDate !== "n/a") {
    const date = new Date(item.releaseDate);
    if (!isNaN(date.getTime())) {
      return date.getFullYear();
    }
  }
  return "n/a";
};

export default function PreviewCards({ item = {}, focusKey }) {
  const title = resolveTitle(item);
  const subtitle = resolveSubtitle(item);
  const description = resolveDescription(item);
  const image = resolveImage(item);
  const year = resolveYear(item);

  const displayFocusKey = item.type === "Contributor" ? "CONTRIBUTOR" : item.mediaType?.toUpperCase() || "TITLE";

  const [imageSrc, setImageSrc] = useState(image || fallbackImage);

  useEffect(() => {
    setImageSrc(image || fallbackImage);
  }, [image]);

  const handleImageError = () => {
    if (imageSrc !== fallbackImage) setImageSrc(fallbackImage);
  };

  // Check type to determine either mediaType or contributionType
  let typeLine = null;

  if (item.type === "Contributor") {
    const contribution =
      item.contributionType || item.contribution || "Contributor";
    typeLine = (
      <span className="text-muted small">
        {contribution}
      </span>
    );
  } else if (item.type === "Title") {
    const mediaType = item.mediaType || item.media_type || "Title";
    typeLine = (
      <span className="text-muted small">
        {mediaType}
        {year ? ` · ${year}` : null}
      </span>
    );
  } else {
    // Fallback for items without type
    const mediaType = item.mediaType || item.media_type || "Title";
    typeLine = (
      <span className="text-muted small">
        {mediaType}
        {year ? ` · ${year}` : null}
      </span>
    );
  }

  return (
    <div className="card h-100 shadow-sm border-0" style={{ minHeight: '475px' }}>
      <img
        src={imageSrc}
        className="card-img-top"
        alt={title}
        style={{ height: '200px', objectFit: 'cover' }}
        onError={handleImageError}
      />
      <div className="card-body ">
        <p className="text-uppercase text-muted small mb-2">{displayFocusKey}</p>

        <h5 className="card-title mb-1">{title}</h5>
        <p className="card-subtitle text-muted mb-1">{subtitle}</p>

        {typeLine && <div className="mb-2">{typeLine}</div>}

        <p className="card-text small mb-0">{description}</p>
      </div>
    </div>
  );
}