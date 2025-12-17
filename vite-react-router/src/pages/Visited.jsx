import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAuthStatus from "../hooks/useAuthStatus";
import mdb from "../business-logic-layer/ApiClient/ApiClient";
import { getStoredToken } from "../components/ExtractJwtData";

export default function Visited() {
	const { userId: paramUserId } = useParams();
	const { userId: authUserId, isSignedIn } = useAuthStatus();
	const targetUserId = paramUserId || authUserId;

	const [visits, setVisits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!targetUserId) return;
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const token = getStoredToken();
				const res = await mdb.apiv2.user.getVisits(targetUserId, { authToken: token });
				const arr = Array.isArray(res) ? res.slice() : [];

				const getTime = (v) => v.visitedAt || v.createdAt || v.timestamp || v.time || v.date || null;

				arr.sort((a, b) => {
					const ta = getTime(a);
					const tb = getTime(b);
					if (ta && tb) return new Date(tb) - new Date(ta);
					if (ta) return -1;
					if (tb) return 1;
					return 0;
				});

				setVisits(arr);
			} catch (err) {
				setError(err?.message || String(err));
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [targetUserId, isSignedIn]);

	const renderTime = (item) => {
		const t = item.visitedAt || item.createdAt || item.timestamp || item.time || item.date;
		if (!t) return "";
		try {
			return new Date(t).toLocaleString();
		} catch {
			return String(t);
		}
	};

	return (
		<main className="container py-4">
			<h2 className="h4 mb-3">Visited pages by user: {targetUserId || '—'}</h2>

			{loading && <p className="text-muted">Loading visits…</p>}
			{error && <p className="text-danger">{error}</p>}

			{!loading && !error && visits.length === 0 && (
				<p className="text-muted">No visited pages found.</p>
			)}

			{!loading && visits.length > 0 && (
				<ul className="list-group">
					{visits.map((v, idx) => {
						const pageId = v.pageId || v.page?.id || v.pageId?.toString() || v.id || v.pageRef || '';
						const title = v.title || v.pageTitle || v.name || pageId || `Page ${idx + 1}`;
						return (
							<li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
								<div>
									{pageId ? (
										<Link to={`/page/${pageId}`}>{title}</Link>
									) : (
										<span>{title}</span>
									)}
									<div className="text-muted small">Page ID: {pageId || 'N/A'}</div>
								</div>
								<div className="text-muted small">{renderTime(v)}</div>
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}

