import { Movie, TvEpisode, TvSeries, Individual, MiscMedia } from "./DataClasses";

const TITLE_KEY_ALIASES = {
    avgrating: "rating",
    iconst: "id",
    mediatype: "mediaType",
    numvotes: "numVotes",
    plotpre: "plot",
    poster: "image",
    releasedate: "releaseDate",
    runtimeminutes: "runtime",
    season: "seasonNumb",
    episodenumber: "episodeNumb",
    parentid: "seriesLink",
    seriesid: "seriesLink",
    seriesname: "seriesName",
    startyear: "startYear",
    endyear: "endYear",
    tconst: "id",
    titleid: "id",
    votecount: "numVotes",
    primaryname: "name"
};

const INDIVIDUAL_KEY_ALIASES = {
    iconst: "id",
    nconst: "id",
    namerating: "rating",
    primaryname: "name",
    birthyear: "birthYear",
    deathyear: "deathYear",
    knownfor: "knownFor"
};

const normalizeKey = (aliases, rawKey) => {
    const compact = (rawKey ?? "").toString();
    const lookupKey = compact.replace(/[_\-]/g, "").toLowerCase();
    const fallback = compact.charAt(0).toLowerCase() + compact.slice(1);
    return aliases[lookupKey] ?? fallback;
};

const createTitleInstance = (mediaType) => {
    switch ((mediaType || "").toLowerCase()) {
        case "movie":
            return new Movie();
        case "tvepisode":
            return new TvEpisode();
        case "tvseries":
            return new TvSeries();
        default:
            return new MiscMedia({ mediaType: mediaType || "unknown" });
    }
};

const normalizeGenres = (value) => {
    if (!Array.isArray(value)) return value;
    return value.map((genre) => {
        if (typeof genre === "string") return genre;
        if (genre && typeof genre === "object") return genre.name ?? genre.Name ?? "n/a";
        return "n/a";
    });
};

export function MapTitle(JSONarr = []) {

    const itemArr = [];
    const minReleaseYear = 1920;

    for (let item of JSONarr) {
        const mediaType = (item?.mediaType ?? item?.MediaType ?? "").toString();
        const titleItem = createTitleInstance(mediaType);

        Object.entries(item || {}).forEach(([rawKey, rawValue]) => {
            if (rawValue === undefined || rawValue === null || rawValue === "N/A") {
                return;
            }

            const key = normalizeKey(TITLE_KEY_ALIASES, rawKey);
            if (!(key in titleItem)) return;

            let value = rawValue;

            if (key === "releaseDate") {
                value = value.toString().split("T")[0];
                const year = Number(value.split("-")[0]);
                if (year && year < minReleaseYear) {
                    return;
                }
            }

            if (key === "genres") {
                value = normalizeGenres(value);
            }

            if (key === "rating" && value === "N/A") {
                return;
            }

            titleItem[key] = value;
        });

        titleItem.mediaType = mediaType || titleItem.mediaType || "unknown";

        itemArr.push(titleItem);
    }
    return itemArr;
}

export function MapIndividual(JSONarr = []) {
    const itemArr = [];

    for (let item of JSONarr) {
        const individualItem = new Individual();

        Object.entries(item || {}).forEach(([rawKey, value]) => {
            if (value === undefined || value === null || value === "N/A") {
                return;
            }

            const key = normalizeKey(INDIVIDUAL_KEY_ALIASES, rawKey);
            if (!(key in individualItem)) return;

            individualItem[key] = value;
        });
        itemArr.push(individualItem);
    }
    return itemArr;

}