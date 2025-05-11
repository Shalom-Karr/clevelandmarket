# Cleveland Marketplace

Cleveland Marketplace is a web application that allows users to buy and sell items by posting listings. It features user authentication, item posting, item editing/deletion (by owner or superadmin), an item detail view, a commenting system, user profile editing (display name), and a basic direct messaging system. The application also includes features for searching listings and loading more items as the user scrolls. A superadmin role has extended privileges, including viewing all messages.

## Features

*   **User Authentication:**
    *   User signup with email, password, and an optional display name.
    *   User login.
    *   Password reset functionality ("Forgot Password").
    *   User logout.
*   **Listings:**
    *   Publicly viewable listings.
    *   Logged-in users can post new items with:
        *   Name, description, price (with a "Mark as Free" option), contact info.
        *   Image upload (either by file or by providing a URL).
        *   Image preview during posting.
    *   Item owners or a Superadmin can edit or delete listings.
    *   "Load More" functionality for browsing numerous listings.
    *   Basic keyword search for item names and descriptions.
    *   (Stubbed for future) Advanced filtering by price range, free items, and sorting.
*   **Item Detail Page:**
    *   Clicking a listing card shows a detailed view of the item.
    *   Includes larger image, full description, price, contact info, seller information (username/email), and posted date.
*   **Comments:**
    *   Users can view comments on item detail pages.
    *   Logged-in users can post comments on items.
    *   Comment owners or a Superadmin can delete comments.
*   **User Profiles:**
    *   Users can set/update a display name (username) via an "Edit Profile" modal.
    *   This display name is used for seller information on listings and commenter names.
*   **Direct Messaging (Basic):**
    *   Logged-in users can initiate a conversation with a seller from an item detail page.
    *   Logged-in users can initiate a general conversation with another user by entering their email/username (via a "Start New Conversation" button in "My Messages").
    *   Users can chat with "Support" (which is the Superadmin account).
    *   A "My Messages" view lists conversations and allows viewing/sending messages within a selected chat.
*   **Superadmin Role:**
    *   A designated Superadmin (defined by UUID in `script.js`) has elevated privileges.
    *   Can edit/delete any listing or comment.
    *   Can view all conversations on the platform via an "All Messages (Admin)" view.
*   **User Experience & UI:**
    *   Responsive design for various screen sizes.
    *   Modals for posting, editing, login, signup, and profile editing.
    *   Toast notifications for user feedback (success/error messages).
    *   Loading states for asynchronous operations.
    *   Enhanced hover and focus states for interactive elements.
*   **Analytics:**
    *   Google Analytics 4 (GA4) integration for tracking page views and custom events (e.g., signups, logins, item posts, searches).

## Tech Stack

*   Frontend: HTML, CSS, Vanilla JavaScript
*   Backend: Supabase (PostgreSQL Database, Authentication, Storage, Realtime, Edge Functions for RPC)

## Setup

1.  **Supabase Project:**
    *   Create a new Supabase project.
    *   Note your Project URL and Anon Key.
    *   Run the SQL commands provided in `DATABASE_SETUP.sql` (or `CODE_EXPLANATION.txt`) in your Supabase SQL Editor. This will create the necessary tables (`listings`, `profiles`, `comments`, `conversations`, `conversation_participants`, `messages`), views, RLS policies, and triggers.
    *   **Important:** After running the SQL, identify the `UUID` of the user you want to be the Superadmin (from the `auth.users` table in your Supabase dashboard after they sign up through the app). Update this UUID in the RLS policies in the SQL script (wherever `YOUR_SUPERADMIN_UUID_HERE` or the example UUID is mentioned) and re-run those specific policy updates.
    *   Configure Email Templates (especially Password Recovery) in your Supabase project Authentication settings. Set the Site URL.

2.  **Frontend Configuration:**
    *   Clone this repository or download the files.
    *   Open `script.js`.
    *   Replace the placeholder `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your Supabase project's URL and Anon Key.
    *   Replace the placeholder `SUPERADMIN_USER_ID` with the actual UUID of your designated Superadmin user.
    *   Replace the placeholder `GA_MEASUREMENT_ID` with your Google Analytics 4 Measurement ID.
    *   If you have a dedicated support user account (different from Superadmin, though currently they are the same), update `SUPPORT_USER_ID`. (Currently, `SUPPORT_USER_ID` constant is not explicitly used as Superadmin fills this role).

3.  **Google Analytics:**
    *   Create a Google Analytics 4 property and obtain your Measurement ID (`G-XXXXXXXXXX`).
    *   Replace `G-XXXXXXXXXX` in `index.html` and in the `GA_MEASUREMENT_ID` constant in `script.js`.

4.  **Run the Application:**
    *   Open `index.html` in your web browser.

## Development Notes

*   **Price Column:** The `listings.price` column in the database is currently `TEXT`. For robust price filtering and sorting, consider changing this to `NUMERIC(10, 2)`. This would require updates to how prices are inserted (as numbers) and potentially parsed. "Free" items are currently stored as "0" or the text "Free".
*   **Error Handling:** Basic error handling is implemented with `try...catch` and toast notifications. This can be further enhanced.
*   **Realtime:** Realtime updates are implemented for listings, comments, and messages using Supabase channels.
*   **Security:** Row Level Security (RLS) is heavily relied upon to protect data. Ensure policies are correctly implemented and tested. The RPC function `get_or_create_conversation` uses `SECURITY DEFINER` for creating conversation participants.

## Future Enhancements (from original ideas list)

*   Advanced Filtering (Price Range slider, actual "Free" filter toggle).
*   Advanced Sorting options.
*   Categorization/Tags for listings.
*   Public User Profile Pages.
*   "Save/Favorite" listings functionality.
*   Real-time notifications for new messages.
*   Reporting listings.
*   Image Carousel for multiple images per listing.
*   More granular inline form validation.
*   A more fundamental mobile-first design review.
*   Comprehensive A11y audit and improvements.