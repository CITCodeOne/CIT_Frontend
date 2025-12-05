const resolveTitle = (item) => item?.title || item?.name || "Untitled";
const resolveSubtitle = (item) => item?.subtitle || item?.role || "No role specified";
const resolveDescription = (item) => item?.description || item?.bio || "Add more metadata to this entry.";

export default function PreviewCards({ item = {}, focusKey }) {
    const title = resolveTitle(item);
    const subtitle = resolveSubtitle(item);
    const description = resolveDescription(item);

    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
                <p className="text-uppercase text-muted small mb-2">{focusKey}</p>
                <h5 className="card-title mb-1">{title}</h5>
                <p className="card-subtitle text-muted mb-3">{subtitle}</p>
                <p className="card-text small mb-0">{description}</p>
            </div>
        </div>
    );
}
