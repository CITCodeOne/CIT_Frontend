export default class Series {
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
}