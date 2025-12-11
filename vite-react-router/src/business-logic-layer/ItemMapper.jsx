import { Movie, Episode } from "./DataClasses";



export function MapToMovie(JSONarr){
    
    const itemArr = [];

    for(let item in JSONarr){
        const tempItem = new Movie(
            {
                id : item.id,
                name : item.name,
                banner : item.poster,
                releaseDate : item.releaseDate,
                rating : item.avgRating,
                genres : item.genres
            }
        )
        itemArr.push(tempItem);
    }
    return itemArr;
}

function MapToEpisode(episodeItem){


}