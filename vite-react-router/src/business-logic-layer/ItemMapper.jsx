import { Movie, TvEpisode, TvSeries, Individual, MiscMedia } from "./DataClasses";
import { TITLE_KEY_ALIASES, INDIVIDUAL_KEY_ALIASES, normalizeKey } from "./KeyAliases";

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