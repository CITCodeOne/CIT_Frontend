import defaultImage from "../pics/Image-not-found.png";

class baseObject{
    constructor(){
        Object.assign(this, {
            id: "n/a",
            pageLink: "n/a",
            name: "n/a",
            image: defaultImage
        })
    }
}
class baseTitleObject{
    constructor(){
        Object.assign(this, new baseObject());
        Object.assign(this, {
            mediaType: "unknown",
            plot: "n/a",
            adult: "n/a",
            releaseDate: "n/a",
            runtime: "n/a",
            startYear: "n/a",
            endYear: "n/a",
            genres: ["n/a"],
            actors: ["n/a"],
            directors: ["n/a"],
            rating: "n/a",
            numVotes: "n/a"
        })
    }
}

export class Movie {
    constructor(options = {}) {
        Object.assign(this, new baseTitleObject(), options);
        Object.seal(this);
    }
};

export class TvSeries {
    constructor(options = {}) {
        Object.assign(this, new baseTitleObject());
        Object.assign(this, {
            endYear: "n/a",
            numbOfSeasons: "n/a",
            numbOfEpisodes: "n/a",
            episodes: ["n/a"],
            createdBy: ["n/a"]
        }, options);
        Object.seal(this);
    }
};

export class TvEpisode {
    constructor(options = {}) {
        Object.assign(this, new baseTitleObject());
        Object.assign(this, {
            seriesName: "n/a",
            seriesLink: "n/a",
            episodeNumb: 0,
            seasonNumb: 0,
        }, options);
        Object.seal(this);
    }
};

export class MiscMedia {
    constructor(options = {}) {
        Object.assign(this, new baseTitleObject());
        Object.assign(this, {
            mediaType : "Unknown media type",
        }, options);
        Object.seal(this);
    }
};

export class Individual {
    constructor(options = {}) {
        Object.assign(this, new baseObject());
        Object.assign(this, {
            birthYear: "n/a",
            deathYear: "n/a",
            knownFor: ["n/a"],
            rating: "n/a"
        }, options);
        Object.seal(this);
    }
};

export class User {
    constructor(options = {}) {
        Object.assign(this, new baseObject());
        Object.assign(this, {
            email: "n/a",
            createdAt: "n/a",
            ratingsCount: 0,
            ratings : ["n/a"],
            bookmarksCount: 0,
            bookmarks : ["n/a"],
            role: "n/a",
            visitedPages : ["n/a"]
        }, options);
        Object.seal(this);
    }
};