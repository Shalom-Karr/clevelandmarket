// script.js (Main Marketplace Application Script)

// 1. Supabase Configuration
const SUPABASE_URL = 'https://zazjozinljwdgbyppffy.supabase.co'; // Your Supabase Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphempvemlubGp3ZGdieXBwZmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1Nzg5MTQsImV4cCI6MjA2MjE1NDkxNH0.PNGhZLxt6D8Lk76CUU0Bviul-T3nV0xHvQaJobX8f-k'; // Your Supabase Anon Key

// Initialize the Supabase client
let supabaseClient;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase client initialized using global 'supabase' (lowercase).");
} else {
    console.error("CRITICAL ERROR: Global 'supabase' (lowercase) object not found...");
    alert("CRITICAL ERROR: Supabase cannot be initialized...");
}

// HTML Elements
const postItemBtn = document.getElementById('postItemBtn');
const postItemModal = document.getElementById('postItemModal');
const closeModalBtn = document.querySelector('#postItemModal .close-button'); // More specific for post modal
const postItemForm = document.getElementById('postItemForm');
const listingsContainer = document.getElementById('listingsContainer');

// Elements for Edit Modal
const editItemModal = document.getElementById('editItemModal');
const closeEditModalBtn = document.querySelector('#editItemModal .close-button'); // More specific for edit modal
const editItemForm = document.getElementById('editItemForm');
const editItemIdField = document.getElementById('editItemId');
const editItemNameField = document.getElementById('editItemName');
const editItemDescriptionField = document.getElementById('editItemDescription');
const editItemPriceField = document.getElementById('editItemPrice');
const editItemContactField = document.getElementById('editItemContact');
const editItemCurrentImage = document.getElementById('editItemCurrentImage');


// --- Modal Logic (Post Item) ---
if (postItemBtn) {
    postItemBtn.addEventListener('click', () => {
        if (postItemModal) postItemModal.style.display = 'block';
    });
}
if (closeModalBtn) { // For post modal
    closeModalBtn.addEventListener('click', () => {
        if (postItemModal) postItemModal.style.display = 'none';
        if (postItemForm) postItemForm.reset();
    });
}
window.addEventListener('click', (event) => { // General click outside for both modals
    if (event.target === postItemModal) {
        if (postItemModal) postItemModal.style.display = 'none';
        if (postItemForm) postItemForm.reset();
    }
    if (event.target === editItemModal) {
        if (editItemModal) editItemModal.style.display = 'none';
        if (editItemForm) editItemForm.reset(); // Also reset edit form
    }
});

// --- Modal Logic (Edit Item) ---
if (closeEditModalBtn) { // For edit modal
    closeEditModalBtn.addEventListener('click', () => {
        if (editItemModal) editItemModal.style.display = 'none';
        if (editItemForm) editItemForm.reset();
    });
}


// --- Form Submission Logic (Post Item) ---
if (postItemForm) {
    postItemForm.addEventListener('submit', async (event) => {
        // ... (Keep existing postItemForm submission logic exactly as it was) ...
        // (No changes needed inside this function from the last full version)
        event.preventDefault();
        if (!supabaseClient) {
            alert("Error: Supabase client is not initialized. Cannot post item.");
            return;
        }

        const submitButton = postItemForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Posting...';

        const itemName = document.getElementById('itemName').value;
        const itemDescription = document.getElementById('itemDescription').value;
        const itemPrice = document.getElementById('itemPrice').value;
        const itemContact = document.getElementById('itemContact').value;
        const imageFile = document.getElementById('itemImage').files[0];

        if (!itemName || !itemDescription || !itemPrice || !itemContact || !imageFile) {
            alert('Please fill in all fields and select an image.');
            submitButton.disabled = false;
            submitButton.textContent = 'Post Item';
            return;
        }

        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            console.log('Attempting to upload image:', filePath);
            const { data: imageData, error: imageError } = await supabaseClient
                .storage
                .from('listing-images')
                .upload(filePath, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (imageError) {
                console.error('Image Upload Error:', imageError);
                throw new Error(`Image Upload Failed: ${imageError.message}`);
            }
            console.log('Image uploaded successfully:', imageData);

            const { data: publicURLData } = supabaseClient
                .storage
                .from('listing-images')
                .getPublicUrl(filePath);

            if (!publicURLData || !publicURLData.publicUrl) {
                console.error('Error getting public URL:', publicURLData);
                throw new Error('Could not get public URL for the image.');
            }
            const imageUrl = publicURLData.publicUrl;
            console.log('Image public URL:', imageUrl);

            console.log('Attempting to save listing data to Supabase table...');
            const { data: listingData, error: listingError } = await supabaseClient
                .from('listings')
                .insert([
                    {
                        name: itemName,
                        description: itemDescription,
                        price: itemPrice,
                        contact_info: itemContact,
                        image_url: imageUrl
                    }
                ])
                .select();

            if (listingError) {
                console.error('Listing Save Error:', listingError);
                throw new Error(`Listing Save Failed: ${listingError.message || JSON.stringify(listingError)}`);
            }

            console.log('Listing posted successfully:', listingData);
            alert('Item posted successfully!');
            postItemForm.reset();
            if (postItemModal) postItemModal.style.display = 'none';
            fetchListings();

        } catch (error) {
            console.error('Error posting item:', error);
            alert(`Error: ${error.message || 'Could not post item. Check console for details.'}`);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Post Item';
        }
    });
}

// --- Form Submission Logic (Edit Item) ---
if (editItemForm) {
    editItemForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!supabaseClient) {
            alert("Error: Supabase client is not initialized. Cannot update item.");
            return;
        }

        const listingId = editItemIdField.value;
        if (!listingId) {
            alert("Error: No item ID found for editing.");
            return;
        }

        const submitButton = editItemForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        const updatedItem = {
            name: editItemNameField.value,
            description: editItemDescriptionField.value,
            price: editItemPriceField.value,
            contact_info: editItemContactField.value
            // We are not updating image_url in this version
        };

        try {
            const { data, error } = await supabaseClient
                .from('listings')
                .update(updatedItem)
                .eq('id', listingId)
                .select();

            if (error) {
                console.error('Error updating listing:', error);
                throw new Error(`Update Failed: ${error.message || JSON.stringify(error)}`);
            }

            console.log('Listing updated successfully:', data);
            alert('Item updated successfully!');
            editItemForm.reset();
            if (editItemModal) editItemModal.style.display = 'none';
            fetchListings();

        } catch (error) {
            console.error('Error saving updated item:', error);
            alert(`Error: ${error.message || 'Could not update item. Check console.'}`);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Changes';
        }
    });
}


// --- Display Listings Logic (Modified to add Edit button and data) ---
async function fetchListings() {
    if (!supabaseClient) {
        if (listingsContainer) listingsContainer.innerHTML = '<p style="color:red;">Error: Supabase client not initialized. Cannot fetch listings.</p>';
        return;
    }
    if (!listingsContainer) return;

    console.log('Fetching listings...');
    listingsContainer.innerHTML = '<p>Loading listings...</p>';

    const { data: listings, error } = await supabaseClient
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching listings:', error);
        listingsContainer.innerHTML = `<p>Error loading listings: ${error.message}. Check console.</p>`;
        return;
    }

    if (listings && listings.length > 0) {
        listingsContainer.innerHTML = '';
        listings.forEach(listing => {
            const listingCard = document.createElement('div');
            listingCard.classList.add('listing-card');

            // Store all data needed for editing as data attributes on the card or a specific element
            listingCard.dataset.id = listing.id;
            listingCard.dataset.name = listing.name;
            listingCard.dataset.description = listing.description;
            listingCard.dataset.price = listing.price;
            listingCard.dataset.contact = listing.contact_info;
            listingCard.dataset.imageUrl = listing.image_url || '';


            const safeName = document.createTextNode(listing.name || 'No Name').textContent;
            const safePrice = document.createTextNode(listing.price || 'N/A').textContent;
            const safeDescription = document.createTextNode(listing.description || 'No Description').textContent;
            const safeContact = document.createTextNode(listing.contact_info || 'No Contact').textContent;
            const imageUrl = listing.image_url || '';
            const createdDate = listing.created_at ? new Date(listing.created_at).toLocaleString() : 'Unknown date';

            let imageFileName = '';
            if (imageUrl) {
                try {
                    const urlParts = new URL(imageUrl);
                    const pathParts = urlParts.pathname.split('/');
                    imageFileName = pathParts[pathParts.length - 1];
                } catch (e) {
                    console.warn("Could not parse image_url to get filename:", imageUrl, e);
                }
            }

            // Grouping buttons (optional, if you use .action-buttons CSS)
            const actionButtonsDiv = document.createElement('div');
            actionButtonsDiv.classList.add('action-buttons');

            const editButton = document.createElement('button');
            editButton.classList.add('edit-button');
            editButton.textContent = 'Edit';
            // Data attributes for edit button itself are not strictly needed if we grab from parent card
            // but can be useful for direct targeting. Let's keep them on the card for now.

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.id = listing.id; // Still need for delete
            deleteButton.dataset.imageFilename = imageFileName; // Still need for delete

            actionButtonsDiv.appendChild(editButton);
            actionButtonsDiv.appendChild(deleteButton);

            listingCard.innerHTML = `
                ${imageUrl ? `<img src="${imageUrl}" alt="${safeName}">` : '<div style="height:200px; background:#eee; text-align:center; line-height:200px;">No Image</div>'}
                <h3>${safeName}</h3>
                <p><strong>Price:</strong> ${safePrice}</p>
                <p>${safeDescription}</p>
                <p><strong>Contact:</strong> ${safeContact}</p>
                <small>Posted: ${createdDate}</small>
            `; // Buttons will be appended below
            listingCard.appendChild(actionButtonsDiv); // Append the div containing both buttons
            listingsContainer.appendChild(listingCard);
        });
        console.log('Listings displayed:', listings.length);
    } else {
        listingsContainer.innerHTML = '<p>No items posted yet. Be the first!</p>';
        console.log('No listings found.');
    }
}

// --- Edit and Delete Listing Logic (Event Delegation) ---
if (listingsContainer) {
    listingsContainer.addEventListener('click', async (event) => {
        if (!supabaseClient) {
            alert("Error: Supabase client is not initialized.");
            return;
        }

        // Handle Edit Button Click
        if (event.target.classList.contains('edit-button')) {
            const card = event.target.closest('.listing-card'); // Get the parent card
            if (!card) return;

            // Populate and show edit modal
            editItemIdField.value = card.dataset.id;
            editItemNameField.value = card.dataset.name;
            editItemDescriptionField.value = card.dataset.description;
            editItemPriceField.value = card.dataset.price;
            editItemContactField.value = card.dataset.contact;
            if (card.dataset.imageUrl) {
                editItemCurrentImage.src = card.dataset.imageUrl;
                editItemCurrentImage.style.display = 'block';
            } else {
                editItemCurrentImage.src = "";
                editItemCurrentImage.style.display = 'none';
            }
            if (editItemModal) editItemModal.style.display = 'block';
        }

        // Handle Delete Button Click
        if (event.target.classList.contains('delete-button')) {
            const button = event.target;
            const listingId = button.dataset.id;
            const imageFileName = button.dataset.imageFilename;

            if (!listingId) {
                console.error("Delete button clicked, but no listing ID found.");
                return;
            }
            const confirmed = confirm("Are you sure you want to delete this listing?");
            if (confirmed) {
                button.disabled = true;
                button.textContent = "Deleting...";
                await handleDeleteListing(listingId, imageFileName);
                // Button state reset by fetchListings or error handler
            }
        }
    });
}

// --- handleDeleteListing Function (Keep existing function) ---
async function handleDeleteListing(id, imageFileName) {
    // ... (Keep existing handleDeleteListing function exactly as it was) ...
    // (No changes needed inside this function from the last full version)
    if (!supabaseClient) {
        alert("Error: Supabase client is not initialized. Cannot delete item.");
        return;
    }
    console.log(`Attempting to delete listing ID: ${id}, image file: ${imageFileName}`);

    try {
        const { error: dbError } = await supabaseClient
            .from('listings')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('Error deleting listing from database:', dbError);
            throw new Error(`Database Deletion Failed: ${dbError.message}`);
        }
        console.log(`Successfully deleted listing ${id} from database.`);

        if (imageFileName && imageFileName !== "undefined" && imageFileName !== "") {
            console.log(`Attempting to delete image '${imageFileName}' from storage.`);
            const { data: storageData, error: storageError } = await supabaseClient
                .storage
                .from('listing-images')
                .remove([imageFileName]);

            if (storageError) {
                console.error('Error deleting image from storage:', storageError);
                alert(`Listing deleted, but failed to delete image from storage: ${storageError.message}.`);
            } else {
                console.log('Successfully deleted image from storage:', storageData);
            }
        } else {
            console.log("No valid image filename, skipping storage deletion for listing ID:", id);
        }

        alert('Listing deleted successfully!');
        fetchListings();

    } catch (error) {
        console.error('Error in handleDeleteListing:', error);
        alert(`Error: ${error.message || 'Could not delete listing. Check console.'}`);
        const erroredButton = listingsContainer.querySelector(`.delete-button[data-id="${id}"]`);
        if (erroredButton) {
            erroredButton.disabled = false;
            erroredButton.textContent = "Delete";
        }
    }
}


// --- Initial Load & Realtime (Keep existing logic) ---
document.addEventListener('DOMContentLoaded', () => {
    // ... (Keep existing DOMContentLoaded logic exactly as it was) ...
    // (No changes needed inside this function from the last full version)
    if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR_SUPABASE_URL') || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')) {
        const errorMsg = 'Supabase URL or Anon Key is not configured correctly in script.js! Please update it.';
        if (listingsContainer) listingsContainer.innerHTML = `<p style="color:red;">${errorMsg}</p>`;
        console.error(errorMsg);
        alert(errorMsg);
        return;
    }

    if (!supabaseClient) {
        return;
    }

    fetchListings();

    const listingsSubscription = supabaseClient
        .channel('public-listings-channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'listings' },
            (payload) => {
                console.log('Realtime change received!', payload);
                fetchListings();
            }
        )
        .subscribe((status, err) => {
            if (err) {
                console.error("Realtime subscription error:", err);
            } else {
                console.log("Realtime subscription status:", status);
            }
        });

    window.addEventListener('beforeunload', () => {
        if (listingsSubscription) {
            supabaseClient.removeChannel(listingsSubscription);
            console.log('Realtime channel removed.');
        }
    });
});