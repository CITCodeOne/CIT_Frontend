# Notes Archive

This folder contains development notes and documentation for the project's components and architecture.

## Status of Each File:

### Active/Current:
- **TMDB_Integration.txt** - TMDB API integration documentation (created Dec 15, 2025)
- **NotesForIndividualPage.txt** - Individual.jsx page architecture (updated Dec 15, 2025)
- **NotesForTitlePage.txt** - Title.jsx architecture (updated Dec 15, 2025)
- **NotesForMainDisplay.txt** - MainDisplay component usage guide (updated Dec 14, 2025)
- **ListComponentsGuide.txt** - List component patterns and usage
- **ListManagerComp.txt** - ListManager component documentation (updated Dec 14, 2025)
- **NotesForCleanUp.txt** - Documentation of cleanup work completed
- **MAPPING_NOTES.txt** - Business logic layer mapping guide (current)

### Reference Documentation:
- **NotesForBookmarkComp.txt** - BookmarkButton component development notes
- **NotesForRating.txt** - Rating component development notes
- **NavbarCodeExamples.txt** - Navbar pattern examples

## Recent Updates 

### December 13, 2025
**NotesForTitlePage.txt:**
- Updated to reflect useTitleData hook architecture
- Corrected file paths (ApiClient.jsx instead of old config/api.js)
- Documented working API endpoints vs dummy data
- Added refactoring history and current limitations

**NotesForMainDisplay.txt:**
- Updated bookmark example to show actual API integration
- Corrected TODO comment with working implementation

#### Notes:
All documentation reflects the current codebase after major refactoring that reduced Title.jsx from 512 to 241 lines through the introduction of the useTitleData custom hook and reusable MediaCard/UserCard components.

### December 14, 2025

#### Individual Page Creation
1. **src/pages/Individual.jsx**
   - Created comprehensive Individual page for actors/directors/producers
   - Uses MainDisplay component with customAction prop
   - Integrated ListManager component for "Add to List" functionality
   - No bookmark functionality (bookmarks only for titles)

2. **src/hooks/useIndividualData.jsx**
   - Created custom hook for individual data fetching
   - Uses `mdb.apiv2.individuals.getById()` and `getTitles()`
   - Removed bookmark-related functionality (not needed for individuals)

3. **src/components/MainDisplay.jsx**
   - Added `customAction` prop for flexible action buttons
   - Priority: customAction → rating display → default rate button
   - Bookmark button only shown when `bookmark` prop provided

4. **src/components/ListManager.jsx**
   - Created reusable modal component for list management
   - Supports both individuals and titles (itemType prop)
   - Reduced Individual.jsx code by ~75 lines

#### ListManager Integration
5. **src/pages/UserBookmarksList.jsx**
   - Added ListManager integration
   - "📋 Add to List" button for each bookmark
   - Reuses existing message toast system

6. **src/pages/UserRatingsList.jsx**
   - Added ListManager integration
   - Compact "📋" icon button to save space
   - Reuses existing message toast system

#### Component Improvements
7. **src/components/Rating.jsx**
   - Fixed zero-star rating issue
   - Click same star twice to reset rating to 0
   - Uses ternary operator: `rating === value ? 0 : value`

#### React Router Fix
8. **src/App.jsx**
   - Added React Router v7 future flags
   - Fixed path switching issues with Vite

#### Documentation Updates
9. **Notes/NotesForIndividualPage.txt**
   - Created comprehensive documentation matching style of other notes
   - Updated to reflect no bookmark functionality
   - Documented API endpoints, architecture, and current limitations

10. **Notes/ListManagerComp.txt**
    - Added UserBookmarksList and UserRatingsList examples
    - Updated usage documentation

11. **Notes/ARCHIVE_README.md**
    - Updated to reflect all changes made on Dec 14, 2025

### December 15, 2025

#### TMDB Integration for Missing Backend Data
1. **src/business-logic-layer/TmdbIntegration.jsx**
   - Implemented TMDB API integration for missing backend endpoints
   - `getPersonPhoto()` - Individual profile pictures
   - `getPersonPhotos()` - Photo gallery for individuals
   - `getMultiplePersonPhotos()` - Batch fetch cast photos
   - `getTitlePoster()` - Movie/show posters
   - `getSimilarTitles()` - Similar title recommendations

2. **src/pages/Individual.jsx** - TMDB Integration
   - Added profile picture fetching from TMDB
   - Added photo gallery carousel (12 TMDB photos)
   - Fixed biography/description display
   - Added bio/description fields to Individual DataClass

3. **src/pages/Title.jsx** - TMDB Integration
   - Added TMDB poster fetching
   - Added TMDB cast photo fetching (parallel)
   - Added similar titles with backend-first, TMDB fallback
   - Added TMDB poster fetching for similar titles

4. **src/business-logic-layer/DataClasses.jsx**
   - Added `bio` and `description` fields to Individual class
   - Sealed class to prevent property addition after initialization

#### Individual Page Enhancements
5. **src/pages/Individual.jsx** - Known For Section
   - Added bookmark functionality for Known For titles
   - Integrated ToggleButton component for bookmarks
   - Added ListManager for adding titles to lists
   - Removed year display, added title-only with bookmarks

6. **src/pages/Individual.jsx** - Filmography Redesign
   - Changed from carousel to simple list matching Title cast design
   - Added clickable rows with hover effects
   - Added thumbnail images for titles
   - Displays title name and year

7. **src/pages/Individual.jsx** - Birth/Death Year Display
   - Changed format to "1956 - Present" for living people
   - Shows "1956 - 2023" for deceased people
   - Removed "Born: " / "Died: " labels for cleaner look

8. **src/style/CIndividualPage.css**
   - Added `.known-for-card` and related styles
   - Added `.filmography-list-item` with hover effect
   - Added `.known-for-bookmark` button styling

#### Title Page Enhancements
9. **src/pages/Title.jsx** - Similar Titles
   - Converted similar titles to carousel with bookmark buttons
   - Added bookmark state management for similar titles
   - Styled cards matching Known For section design
   - Added overlay buttons (bookmark only, no add to list)

10. **src/components/ToggleButton.jsx**
    - Used across both Individual and Title pages
    - Reusable bookmark button component
    - Consistent styling and behavior

11. **src/style/CTitlePage.css**
    - Added `.similar-title-card` and related styles
    - Added `.similar-bookmark-btn` styling
    - Added overlay positioning styles

#### Code Quality Improvements
12. **Comment Optimization**
    - Cleaned all verbose comments in Individual.jsx
    - Cleaned all verbose comments in Title.jsx
    - Removed obvious comments, kept only meaningful ones
    - Removed debug console.log statements
    - Simplified section headers

13. **Component Reuse**
    - Maximized use of ToggleButton across pages
    - Consistent bookmark patterns
    - Removed duplicate code

#### Documentation
14. **Notes/TMDB_Integration.txt** (NEW)
    - Comprehensive TMDB integration documentation
    - Lists what TMDB provides vs what backend needs
    - Documents all TMDB functions and use cases
    - Migration path for when backend is ready

15. **Notes/EndpointIssuesAnalysis.md** (DELETED)
    - Removed outdated endpoint analysis
    - Replaced by TMDB_Integration.txt

16. **Notes/NotesForIndividualPage.txt** (UPDATED)
    - Added TMDB integration details
    - Updated Known For and Filmography sections
    - Documented bookmark functionality

17. **Notes/NotesForTitlePage.txt** (UPDATED)
    - Added TMDB integration details
    - Updated Similar Titles section
    - Documented bookmark functionality

18. **Notes/ARCHIVE_README.md** (UPDATED)
    - Removed merge conflict markers
    - Added December 15 comprehensive updates
    - Reorganized file priority listing
Last Updated: December 14, 2025
