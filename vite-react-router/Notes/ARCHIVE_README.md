# Notes Archive

This folder contains development notes and documentation for the project's components and architecture.

## Status of Each File:

### Active/Current:
- **ListComponentsGuide.txt** - List component patterns and usage
- **ListManagerComp.txt** - ListManager component documentation (updated Dec 14, 2025)
- **NotesForCleanUp.txt** - Documentation of cleanup work completed
- **NotesForTitlePage.txt** - Current Title.jsx architecture (updated Dec 13, 2025)
- **NotesForMainDisplay.txt** - MainDisplay component usage guide (updated Dec 14, 2025)
- **NotesForIndividualPage.txt** - Individual.jsx page architecture (created Dec 14, 2025)
- **MAPPING_NOTES.txt** - Business logic layer mapping guide (current)

### Reference Documentation:
- **NotesForBookmarkComp.txt** - BookmarkButton component development notes
- **NotesForRating.txt** - Rating component development notes
- **NavbarCodeExamples.txt** - Navbar pattern examples
- **AddToListFeature.md** - Add to List feature implementation notes

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
=======

>>>>>>> Stashed changes
#### Individual Page Creation
1. **src/pages/Individual.jsx**
   - Created comprehensive Individual page for actors/directors/producers
   - Uses MainDisplay component with customAction prop
   - Integrated ListManager component for "Add to List" functionality
   - No bookmark functionality (bookmarks only for titles)

2. **src/hooks/useIndividualData.jsx**
   - Created custom hook for individual data fetching
<<<<<<< Updated upstream
<<<<<<< Updated upstream
   - Fixed import: Changed from `apiv2` to `mdb`
   - Updated all API calls to use `mdb.apiv2.*` structure
   - Removed bookmark-related functionality
=======
   - Uses `mdb.apiv2.individuals.getById()` and `getTitles()`
   - Removed bookmark-related functionality (not needed for individuals)
>>>>>>> Stashed changes
=======
   - Uses `mdb.apiv2.individuals.getById()` and `getTitles()`
   - Removed bookmark-related functionality (not needed for individuals)
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
#### React Router Fix
7. **src/App.jsx**
=======
=======
>>>>>>> Stashed changes
#### Component Improvements
7. **src/components/Rating.jsx**
   - Fixed zero-star rating issue
   - Click same star twice to reset rating to 0
   - Uses ternary operator: `rating === value ? 0 : value`

#### React Router Fix
8. **src/App.jsx**
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
   - Added React Router v7 future flags
   - Fixed path switching issues with Vite

#### Documentation Updates
<<<<<<< Updated upstream
<<<<<<< Updated upstream
8. **Notes/NotesForIndividualPage.txt**
=======
9. **Notes/NotesForIndividualPage.txt**
>>>>>>> Stashed changes
=======
9. **Notes/NotesForIndividualPage.txt**
>>>>>>> Stashed changes
   - Created comprehensive documentation matching style of other notes
   - Updated to reflect no bookmark functionality
   - Documented API endpoints, architecture, and current limitations

<<<<<<< Updated upstream
<<<<<<< Updated upstream
9. **Notes/ListManagerComp.txt**
   - Added UserBookmarksList and UserRatingsList examples
   - Updated usage documentation

10. **Notes/ARCHIVE_README.md**
    - Updated to reflect all changes made on Dec 14, 2025


=======
=======
>>>>>>> Stashed changes
10. **Notes/ListManagerComp.txt**
    - Added UserBookmarksList and UserRatingsList examples
    - Updated usage documentation

11. **Notes/ARCHIVE_README.md**
    - Updated to reflect all changes made on Dec 14, 2025

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
Last Updated: December 14, 2025
