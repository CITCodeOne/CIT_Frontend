const resolveTitle = (item) => item?.title || item?.name || "Untitled";

const resolveSubtitle = (item) => {
  if (item.type === "Contributor") {
    return item.subtitle || item.role || "No role specified";
  }

  if (item.type === "Title") {
    return item.subtitle || "";
  }

  // For items without type, assume Title and use mediaType or similar
  return item.subtitle || item.mediaType || "";
};

const resolveDescription = (item) =>
  item?.description || item?.blurb || item?.bio || item?.plot || "Add more metadata to this entry.";

const resolveImage = (item) => item?.image || null;

const resolveYear = (item) => {
  if (item.year || item.startYear) return item.year || item.startYear;
  if (item.releaseDate && item.releaseDate !== "n/a") {
    const date = new Date(item.releaseDate);
    return date.getFullYear();
  }
  return null;
};

export default function PreviewCards({ item = {}, focusKey }) {
  const title = resolveTitle(item);
  const subtitle = resolveSubtitle(item);
  const description = resolveDescription(item);
  const image = resolveImage(item);
  const year = resolveYear(item);

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
    <div className="card h-100 shadow-sm border-0">
      {image && (
        <img src={image} className="card-img-top" alt={title} style={{ height: '200px', objectFit: 'cover' }} />
      )}
      <div className="card-body">
        <p className="text-uppercase text-muted small mb-2">{focusKey}</p>

        <h5 className="card-title mb-1">{title}</h5>
        <p className="card-subtitle text-muted mb-1">{subtitle}</p>

        {typeLine && <div className="mb-2">{typeLine}</div>}

        <p className="card-text small mb-0">{description}</p>
      </div>
    </div>
  );
}