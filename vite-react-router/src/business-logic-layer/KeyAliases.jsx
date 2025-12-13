// Central place for DTO -> domain key normalization.
// Keys are normalized by stripping _/- and lowercasing before lookup.
// Only add aliases for fields that differ from the target class property name.

export const TITLE_KEY_ALIASES = {
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
    primaryname: "name",
};

export const INDIVIDUAL_KEY_ALIASES = {
    iconst: "id",
    nconst: "id",
    namerating: "rating",
    primaryname: "name",
    birthyear: "birthYear",
    deathyear: "deathYear",
    knownfor: "knownFor",
};

export const USER_KEY_ALIASES = {
    userid: "id",
    uid: "id",
    id: "id",
    name: "name",
    username: "name",
    email: "email",
    time: "createdAt",
    createdat: "createdAt",
    ratingscount: "ratingsCount",
    bookmarkscount: "bookmarksCount",
    visitedpages: "visitedPages",
    role: "role",
    profileimage: "image",
    profileimagebase64: "image",
};

export const RATING_KEY_ALIASES = {
    userid: "userId",
    user: "userId",
    titleid: "titleId",
    tconst: "titleId",
    id: "titleId",
    rating: "rating",
    time: "time",
};

export const BOOKMARK_KEY_ALIASES = {
    userid: "userId",
    pageid: "pageId",
    titleid: "titleId",
    tconst: "titleId",
    individualid: "individualId",
    nconst: "individualId",
    time: "time",
};

export const normalizeKey = (aliases, rawKey) => {
    const compact = (rawKey ?? "").toString();
    const lookupKey = compact.replace(/[_\-]/g, "").toLowerCase();
    const fallback = compact.charAt(0).toLowerCase() + compact.slice(1);
    return aliases[lookupKey] ?? fallback;
};
