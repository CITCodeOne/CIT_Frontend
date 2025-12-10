export default class Individual {
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
}