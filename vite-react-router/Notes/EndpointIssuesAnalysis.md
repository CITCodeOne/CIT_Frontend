# API Endpoint Issues Analysis
**Date:** December 15, 2025  
**Branch:** individual-page

## Summary
Analysis of data issues on Individual and Title pages, focusing on missing profile pictures, biographies, and cast photos.

---

## Individual Page Issues

### 1. **No Profile Picture Showing**
**Current State:**
- Individual.jsx uses `individual.image` field
- DataClasses.jsx defines Individual with default `image: defaultImage`
- The API endpoint `individuals.getById(id)` returns data but likely missing `image` field

**Root Cause:**
- Backend API may not be returning an `image` or `profilePath` field for individuals
- Need to check what fields the backend actually returns

**Possible Solutions:**
1. Check backend response structure: What fields does `/v2/individuals/{id}` actually return?
2. Add TMDB integration for profile pictures (like what's done on Individual page photos section)
3. Update KeyAliases to map backend field names to `image` properly

**Code Location:**
- `src/hooks/useIndividualData.jsx` (line 35-42) - fetches individual data
- `src/business-logic-layer/ItemMapper.jsx` (line 161-188) - maps individual data
- `src/business-logic-layer/DataClasses.jsx` (line 76-85) - Individual class definition

---

### 2. **No Biography Showing**
**Current State:**
- Individual.jsx checks for `individual.bio` or `individual.description` (line 169-174)
- Individual class in DataClasses.jsx does NOT have `bio` or `description` fields
- Only has: id, pageLink, name, image, birthYear, deathYear, knownFor, rating

**Root Cause:**
- Individual DataClass is missing `bio` and `description` fields
- Backend may be returning these fields, but they're not in the class definition so they get filtered out

**Solution:**
```javascript
// In DataClasses.jsx, update Individual class:
export class Individual {
    constructor(options = {}) {
        Object.assign(this, new baseObject());
        Object.assign(this, {
            birthYear: "n/a",
            deathYear: "n/a",
            bio: "n/a",              // ADD THIS
            description: "n/a",      // ADD THIS
            knownFor: ["n/a"],
            rating: "n/a"
        }, options);
        Object.seal(this);
    }
};
```

**Code Location:**
- `src/business-logic-layer/DataClasses.jsx` (line 76-85) - needs bio/description fields
- `src/pages/Individual.jsx` (line 169-174) - uses bio/description

---

### 3. **Filmography May Be Dummy Data**
**Current State:**
- Uses `mdb.apiv2.individuals.getTitles(individualId)` endpoint
- Maps data through MapTitle function

**Investigation Needed:**
- Check if `/v2/individuals/{id}/titles` endpoint is returning real data
- Verify the response structure matches what MapTitle expects

**Code Location:**
- `src/hooks/useIndividualData.jsx` (line 55-73) - fetches titles
- `src/business-logic-layer/ApiClient/ApiClient.jsx` (line 329-334) - getTitles endpoint

---

## Title Page Issues

### 1. **Top Cast Not Showing Pictures**
**Current State:**
- Title.jsx fetches cast photos from TMDB using `tmdb.getMultiplePersonPhotos(actorNames)` (line 87-95)
- Stores in `castPhotos` state object
- Uses `castPhotos[actor.name]` to display photos (line 224)

**Root Cause:**
- The `getMultiplePersonPhotos` function expects an array of objects with `name` property
- But it's being passed `actorNames` which is just an array of strings: `cast.map(actor => actor.name)`

**Solution:**
```javascript
// In Title.jsx, fix line 90:
const photos = await tmdb.getMultiplePersonPhotos(cast); // Pass full cast objects, not just names
```

**Also need to update TmdbIntegration.jsx:**
```javascript
// Current getMultiplePersonPhotos expects person objects with .name
// But returns keyed by person.id
// Title.jsx tries to access by actor.name
// This mismatch needs to be fixed

export const getMultiplePersonPhotos = async (names) => {
    const photoPromises = names.map(async (name) => {
        const photoUrl = await getPersonPhoto(name);
        return photoUrl ? { name, photoUrl } : null;
    });
    
    const results = await Promise.all(photoPromises);
    return Object.fromEntries(
        results.filter(r => r).map(r => [r.name, r.photoUrl])
    );
};
```

**Code Location:**
- `src/pages/Title.jsx` (line 87-95) - fetches cast photos
- `src/pages/Title.jsx` (line 224, 256) - uses cast photos
- `src/business-logic-layer/TmdbIntegration.jsx` (line 84-95) - getMultiplePersonPhotos function

---

### 2. **Cast Section Not Showing Pictures**
Same issue as Top Cast - both use the same `castPhotos` data source.

---

### 3. **Cast Data Structure**
**Current State:**
- useTitleData.jsx fetches from `mdb.apiv2.titles.getIndividuals(titleId)` (line 70-87)
- Maps through `mapIndividuals` which creates Individual objects
- Individual objects have `id`, `name`, but cast also needs `character` field

**Investigation Needed:**
- Check if `/v2/titles/{id}/individuals` endpoint returns character/role information
- If yes, need to add `character` or `role` field to Individual class OR
- Create a separate CastMember class that extends Individual

**Current Mapping (line 73-77):**
```javascript
const formattedCast = Array.isArray(castData) ? castData.map(person => ({
    id: person.id,
    name: person.name || 'Unknown',
    character: person.character || null,  // ← Is this field returned by backend?
    profilePath: person.profilePath || placeholderImage
})) : [];
```

**Code Location:**
- `src/hooks/useTitleData.jsx` (line 70-87) - fetches and maps cast
- `src/business-logic-layer/ApiClient/ApiClient.jsx` (line 264-270) - getIndividuals endpoint

---

## Action Items

### High Priority (Blocking Features)
1. ✅ **Add bio/description fields to Individual DataClass**
2. **Fix getMultiplePersonPhotos to return by name instead of id**
3. **Fix Title.jsx to pass correct data to getMultiplePersonPhotos**
4. **Verify backend Individual endpoint returns image/profilePath field**
5. **Verify backend Titles.getIndividuals returns character field**

### Medium Priority (Enhancement)
1. **Add TMDB profile picture fallback for Individual page**
2. **Verify all endpoints are returning real data, not dummy data**
3. **Add proper error handling for missing TMDB images**

### Low Priority (Nice to Have)
1. **Add loading states for TMDB image fetching**
2. **Cache TMDB results to reduce API calls**
3. **Add fallback images when TMDB has no results**

---

## Testing Checklist

### Individual Page
- [ ] Profile picture appears (from backend OR TMDB)
- [ ] Biography text appears
- [ ] Birth/death years show correctly
- [ ] Filmography shows real data with correct posters
- [ ] Known For section shows 4 titles
- [ ] Photos carousel shows TMDB images

### Title Page  
- [ ] Top Cast shows 4 actors with profile pictures
- [ ] Cast section shows all actors with pictures and character names
- [ ] Similar Titles section populates with TMDB data
- [ ] Reviews section shows correctly
- [ ] Bookmark functionality works

---

## Next Steps

1. **Check backend API responses:**
   ```bash
   # Test what fields are actually returned
   curl http://localhost:5000/v2/individuals/{id}
   curl http://localhost:5000/v2/titles/{id}/individuals
   ```

2. **Fix DataClasses.jsx** - Add bio/description fields
3. **Fix TmdbIntegration.jsx** - Fix getMultiplePersonPhotos return format
4. **Fix Title.jsx** - Pass correct data to TMDB functions
5. **Test and verify all changes**
