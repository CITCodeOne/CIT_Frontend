// Viser en brugers besogshistorik (hvilke sider er set) og kobler hvert besog til en titel eller person
import React, { useEffect, useState } from "react"; // React + hooks til tilstand og side-effekter
import { Link, useParams } from "react-router-dom"; // Laeser bruger-id fra URL og laver sikre links
import useAuthStatus from "../hooks/useAuthStatus"; // Fortaeller om vi er logget ind og hvilket bruger-id vi har
import mdb from "../business-logic-layer/ApiClient/ApiClient"; // Egen backend klient til API kald
import RowComp from "../components/RowList"; // Genbrugskomponent der viser en liste af elementer
import { getStoredToken } from "../components/utils/ExtractJwtData"; // Henter JWT token fra storage
import { LoadingState } from '../components/PageStates'; // Simpel loader-UI

export default function Visited() {
	const { userId: paramUserId } = useParams(); // Bruger-id fra URL hvis vi kigger paa en andens profil
	const { userId: authUserId, isSignedIn } = useAuthStatus(); // Aktuel login status og eget id
	const targetUserId = paramUserId || authUserId; // Brug profil-id fra URL, ellers eget id

	// Tilstand for data og status
	const [visits, setVisits] = useState([]); // Liste af besog (hver med pageId og navn)
	const [loading, setLoading] = useState(false); // Viser loader mens vi henter
	const [error, setError] = useState(""); // Fejltekst hvis kald fejler

	useEffect(() => {
		// Henter besog for den givne bruger og kobler hvert besog til en rigtig titel/person for laeserens skyld
		if (!targetUserId) return; // Hvis vi ikke har noget id, kan vi ikke hente data
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const token = getStoredToken(); // Hent token fra storage
				if (!token) {
					setError('Authentication required to view visits'); // Krav om login
					setVisits([]);
					setLoading(false);
					return;
				}
				const res = await mdb.apiv2.user.getVisits(targetUserId, { authToken: token }); // Hent ra besog
				const raw = res.slice(); // Lav kopi saa vi ikke muterer originalen

				const authOptions = token ? { authToken: token } : undefined; // Sendes videre til underkald

				// Berig hvert besog: find navnet paa titel/person baseret paa pageId
				const enriched = await Promise.all(
					raw.map(async (v) => {
						try {
							const pageId = v.pageId || v.page?.id || v.id || null; // Hent id for siden brugeren saa
							if (!pageId) return { ...v, displayName: v.title || v.name || 'Unknown', pageId: pageId };

							// Hent side-referencen for at se om det er en titel eller person
							const pageRef = await mdb.apiv2.page.getById(pageId, authOptions);
							const tconst = pageRef?.tconst ? String(pageRef.tconst).trim() : null;
							const iconst = pageRef?.iconst ? String(pageRef.iconst).trim() : null;

							if (tconst) {
								const title = await mdb.apiv2.titles.getById(tconst, authOptions); // Hvis titel, hent titeldata
								return {
									...v,
									displayName: title?.name ?? title?.title ?? pageRef?.title ?? 'Unknown', // Menneskevenligt navn
									kind: 'title',
									pageId,
								};
							}

							if (iconst) {
								const individual = await mdb.apiv2.individuals.getById(iconst, authOptions); // Hvis person, hent navnet
								return {
									...v,
									displayName: individual?.name ?? pageRef?.name ?? 'Unknown',
									kind: 'individual',
									pageId,
								};
							}

							// Fallback: vi viser hvad vi kan finde uden at fejle
							return {
								...v,
								displayName: pageRef?.name ?? pageRef?.title ?? v.title ?? v.name ?? 'Unknown',
								kind: 'unknown',
								pageId,
							};
						} catch (err) {
							// Hvis noget fejler, viser vi en simpel fallback i stedet for at crashe
							return { ...v, displayName: v.title || v.name || 'Unknown', kind: 'error', pageId: v.pageId || v.id };
						}
					})
				);

				const getTime = (v) => v.visitedAt || v.createdAt || v.timestamp || v.time || v.date || null; // Finder tidspunkt feltet

				enriched.sort((a, b) => {
					const ta = getTime(a);
					const tb = getTime(b);
					if (ta && tb) return new Date(tb) - new Date(ta); // Nyeste foerst
					if (ta) return -1;
					if (tb) return 1;
					return 0;
				});

				setVisits(enriched); // Gem besog i state
			} catch (err) {
				setError(err?.message || String(err)); // Viser fejltekst
			} finally {
				setLoading(false); // Sluk loader uanset resultat
			}
		};
		load();
	}, [targetUserId, isSignedIn]);

	const renderTime = (item) => {
		// Viser tidspunkt i menneskeformat; hvis datoen ikke kan parses, viser vi ra vaerdi
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
			<h2 className="h4 mb-3">Your visited pages:</h2> {/* Side-overskrift */}

			{loading && <LoadingState message="Loading visits..." />} {/* Viser spinner mens data hentes */}
			{error && <p className="text-danger">{error}</p>} {/* Fejltekst hvis noget gik galt */}

			{!loading && !error && visits.length === 0 && (
				<p className="text-muted">No visited pages found.</p> // Tom visning hvis ingen besog
			)}

			{!loading && visits.length > 0 && (
				<RowComp
					variant="list"
					items={visits}
					itemClassName="list-group-item d-flex justify-content-between align-items-center"
					emptyMessage="No visited pages found."
					renderItem={(v, idx) => {
						const pageId = v.pageId || v.page?.id || v.pageId?.toString() || v.id || v.pageRef || ''; // Proever flere felter for at finde et id
						const name = v.displayName || v.title || v.pageTitle || v.name || pageId || `Page ${idx + 1}`; // Navn paa siden vi viser
						return (
							<>
								<div>
									{pageId ? (
										<Link to={`/page/${pageId}`}>{name}</Link> // Klikbart link hvis vi har et pageId
									) : (
										<span>{name}</span> // Ellers bare tekst
									)}
									<div className="text-muted small">Page ID: {pageId || 'N/A'}</div> {/* Viser hvilket id vi bruger */}
								</div>
								<div className="text-muted small">{renderTime(v)}</div> {/* Tidspunkt for besog */}
							</>
						);
					}}
				/>
			)}
		</main>
	);
}

