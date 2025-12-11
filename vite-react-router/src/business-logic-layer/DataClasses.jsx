import defaultAvatar from "../pics/DefaultProfilePicture.jpg";

export class Movie {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            name: "Unknown name",
            banner: "Undefined image",
            plot: "Undefined plot",
            releaseDate: "Unknown",
            releaseYear: 9999,
            runtime: 0,
            genres: [],
            actors: [],
            directors: [],
            rating: 0.0
        }, options);
    }
};

export class Episode {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            seriesName: "n/a",
            name: "Unknown name",
            banner: "Undefined image",
            plot: "Undefined plot",
            releaseDate: "Unknown",
            episodeNumb: 0,
            seasonNumb: 0,
            genres: [],
            actors: [],
            directors: [],
            rating: 0.0
        }, options);
    }
};

export class Individual {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            name: "none",
            poster: "Undefined",
            bio: "Undefined",
            birthYear: 9999,
            deathYear: 9999,
            knownFor: []
        }, options);
    }
};

export class MiscMedia {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            name: "Unknown name",
            banner: "Undefined image",
            mediaType : "Unknown media type",
            description: "Undefined",
            releaseDate: "Unknown",
            releaseYear: 9999,
            runtime: 0,
            genres: [],
            actors: [],
            directors: [],
            createdBy : [],
            rating: 0.0
        }, options);
    }
};

export class Series {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            name: "Unknown name",
            banner: "Undefined image",
            plot: "Undefined plot",
            startYear: 9999,
            endYear: 9999,
            numbOfSeasons: 1,
            numbOfEpisodes: 0,
            episodes: [],
            genres: [],
            actors: [],
            directors: [],
            createdBy: [],
            rating: 0.0
        }, options);
    }
};

export class User {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            name: "none",
            email: "none",
            createdAt: "Undefined",
            ratingsCount: 0,
            ratings : [],
            bookmarksCount: 0,
            bookmarks : [],
            profile_image: defaultAvatar,
            role: "none",
            visitedPages : []
        }, options);
    }
};