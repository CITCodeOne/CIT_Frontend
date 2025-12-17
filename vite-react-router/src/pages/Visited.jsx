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
				// endpoint is protected - require a token
				if (!token) {
					setError('Authentication required to view visits');
					setVisits([]);
					setLoading(false);
					return;
				}
				const res = await mdb.apiv2.user.getVisits(targetUserId, { authToken: token });
				const raw = Array.isArray(res) ? res.slice() : [];

				const authOptions = token ? { authToken: token } : undefined;

				// Enrich each visit by resolving the page to a title or individual name
				const enriched = await Promise.all(
					raw.map(async (v) => {
						try {
							// Visit may already contain pageId; normalize
							const pageId = v.pageId || v.page?.id || v.id || null;
							if (!pageId) return { ...v, displayName: v.title || v.name || 'Unknown', pageId: pageId };

							// Resolve page reference to check if it points to a title or individual
							const pageRef = await mdb.apiv2.page.getById(pageId, authOptions);
							const tconst = pageRef?.tconst ? String(pageRef.tconst).trim() : null;
							const iconst = pageRef?.iconst ? String(pageRef.iconst).trim() : null;

							if (tconst) {
								const title = await mdb.apiv2.titles.getById(tconst, authOptions);
								return {
									...v,
									displayName: title?.name ?? title?.title ?? pageRef?.title ?? 'Unknown',
									kind: 'title',
									pageId,
								};
							}

							if (iconst) {
								const individual = await mdb.apiv2.individuals.getById(iconst, authOptions);
								return {
									...v,
									displayName: individual?.name ?? pageRef?.name ?? 'Unknown',
									kind: 'individual',
									pageId,
								};
							}

							// fallback to pageRef fields
							return {
								...v,
								displayName: pageRef?.name ?? pageRef?.title ?? v.title ?? v.name ?? 'Unknown',
								kind: 'unknown',
								pageId,
							};
						} catch (err) {
							return { ...v, displayName: v.title || v.name || 'Unknown', kind: 'error', pageId: v.pageId || v.id };
						}
					})
				);

				const getTime = (v) => v.visitedAt || v.createdAt || v.timestamp || v.time || v.date || null;

				enriched.sort((a, b) => {
					const ta = getTime(a);
					const tb = getTime(b);
					if (ta && tb) return new Date(tb) - new Date(ta);
					if (ta) return -1;
					if (tb) return 1;
					return 0;
				});

				setVisits(enriched);
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
						const name = v.displayName || v.title || v.pageTitle || v.name || pageId || `Page ${idx + 1}`;
						return (
							<li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
								<div>
									{pageId ? (
										<Link to={`/page/${pageId}`}>{name}</Link>
									) : (
										<span>{name}</span>
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

