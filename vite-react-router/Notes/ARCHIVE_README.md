# Notes Archive

This folder contains development notes and documentation for the project's components and architecture.

## Status of Each File:

### Active/Current:
- **ListComponentsGuide.md** - List component patterns and usage
- **NotesForCleanUp.txt** - Documentation of cleanup work completed
- **NotesForTitlePage.txt** - Current Title.jsx architecture (updated Dec 13, 2025)
- **NotesForMainDisplay.txt** - MainDisplay component usage guide (current)

### Reference Documentation:
- **NotesForBookmarkComp.txt** - BookmarkButton component development notes
- **NotesForRating.txt** - Rating component development notes
- **NavbarCodeExamples.txt** - Navbar pattern examples

## Recent Updates (December 13, 2025):

**NotesForTitlePage.txt:**
- Updated to reflect useTitleData hook architecture
- Corrected file paths (ApiClient.jsx instead of old config/api.js)
- Documented working API endpoints vs dummy data
- Added refactoring history and current limitations

**NotesForMainDisplay.txt:**
- Updated bookmark example to show actual API integration
- Corrected TODO comment with working implementation

## Notes:
All documentation reflects the current codebase after major refactoring that reduced Title.jsx from 512 to 241 lines through the introduction of the useTitleData custom hook and reusable MediaCard/UserCard components.

Last Updated: December 13, 2025
