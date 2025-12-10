import Movie from "../data-models/Movie";

export default function MapToMovie(item){
    const { id, name, avgRating, releaseDate, poster } = item;

    return new Movie({
        id : id,
        name : name,
        banner : poster,
        releaseDate : releaseDate,
        rating : avgRating
    })
}