// script.js - Cleveland Marketplace

// 1. Supabase Configuration
const SUPABASE_URL = 'https://zudzxwqxpmsamfsrrvpy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZHp4d3F4cG1zYW1mc3JydnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NjAwMTYsImV4cCI6MjA2MjMzNjAxNn0.uj7Xs_7pScIXxlhmKV_Z22_ApXV-3i3-8bNYkrnp7Fc';
const SUPERADMIN_USER_ID = '5c7845ae-0357-48f9-bdad-f02d4cf33ecc'; // This is also the Support User ID
const GA_MEASUREMENT_ID = 'G-TM7DBB515N';

let supabaseClient;
let currentUser = null;
let isSuperAdmin = false; // This flag will also indicate if current user is the support contact

let currentLoadedCount = 0;
const ITEMS_PER_PAGE = 9;
let currentSearchTerm = '';
let currentMinPrice = null;
let currentMaxPrice = null;
let currentFilterFreeOnly = false;
let currentSortOption = 'created_at_desc';
let isFetchingListings = false;
let currentOpenListingId = null;
let currentOpenConversationId = null;
let activeChatPoller = null;

if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR_SUPABASE_URL') && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')) {
    try { supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); console.log("Supabase client initialized successfully."); }
    catch (e) { console.error("CRITICAL ERROR: Failed to create Supabase client:", e); alert("CRITICAL ERROR: Supabase client creation failed. App may not function."); supabaseClient = null; }
} else { console.error("CRITICAL ERROR: Supabase object not found or Supabase URL/KEY are placeholders."); alert("CRITICAL ERROR: Supabase not configured. Please check script.js. App will not function."); supabaseClient = null; }

function getElement(id) { return document.getElementById(id); }

// ... (All Element References as in the previous complete script.js) ...
const postItemBtnGlobal = getElement('postItemBtn');
const listingsContainer = getElement('listingsContainer');
const searchBar = getElement('searchBar');
const loadMoreBtn = getElement('loadMoreBtn');
const loadMoreContainer = document.querySelector('.load-more-container');
const toastNotification = getElement('toastNotification');
const minPriceInput = getElement('minPrice');
const maxPriceInput = getElement('maxPrice');
const filterFreeItemsCheckbox = getElement('filterFreeItems');
const sortListingsSelect = getElement('sortListings');
const applyFiltersBtn = getElement('applyFiltersBtn');
const postItemModal = getElement('postItemModal');
const closePostModalBtn = document.querySelector('#postItemModal .close-button');
const postItemForm = getElement('postItemForm');
const postItemNameField = getElement('post_itemName');
const postItemDescriptionField = getElement('post_itemDescription');
const postItemPriceField = getElement('postItemPriceField');
const postItemFreeCheckbox = getElement('postItemFreeCheckbox');
const postImageSourceFileRadio = getElement('postImageSourceFile');
const postImageSourceUrlRadio = getElement('postImageSourceUrl');
const postImageFileUploadContainer = getElement('postImageFileUploadContainer');
const postItemImageFileField = getElement('post_itemImageFile');
const postItemImagePreview = getElement('postItemImagePreview');
const postItemImageUrlContainer = getElement('postItemImageUrlContainer');
const postItemImageUrlField = getElement('post_itemImageUrlField');
const postItemContactField = getElement('post_itemContact');
const editItemModal = getElement('editItemModal');
const closeEditModalBtn = document.querySelector('#editItemModal .close-button');
const editItemForm = getElement('editItemForm');
const editItemIdField = getElement('editItemId');
const editItemOwnerIdField = getElement('editItemOwnerId');
const editItemOriginalImageUrlField = getElement('editItemOriginalImageUrl');
const editModalItemNameField = getElement('edit_itemName');
const editModalItemDescriptionField = getElement('edit_itemDescription');
const editModalItemPriceField = getElement('editItemPriceField');
const editModalItemFreeCheckbox = getElement('editItemFreeCheckbox');
const editModalItemContactField = getElement('edit_itemContact');
const editItemCurrentImage = getElement('editItemCurrentImage');
const editImageSourceNoneRadio = getElement('editImageSourceNone');
const editImageSourceFileRadio_Edit = getElement('editImageSourceFile_Edit');
const editImageSourceUrlRadio_Edit = getElement('editImageSourceUrl_Edit');
const editImageFileUploadContainer_Edit = getElement('editImageFileUploadContainer_Edit');
const editNewImageFileField = getElement('edit_newImageFile');
const editItemNewImagePreview = getElement('editItemNewImagePreview');
const editItemImageUrlContainer_Edit = getElement('editItemImageUrlContainer_Edit');
const editNewImageUrlField = getElement('edit_newImageUrlField');
const loginBtn = getElement('loginBtn');
const signupBtn = getElement('signupBtn');
const logoutBtn = getElement('logoutBtn');
const userEmailDisplay = getElement('userEmail');
const editProfileBtn = getElement('editProfileBtn'); // This is your "My Profile" button
const signupModal = getElement('signupModal');
const closeSignupModalBtn = document.querySelector('#signupModal .close-button');
const signupForm = getElement('signupForm');
const signupDisplayNameField = getElement('signupDisplayName');
const signupMessage = getElement('signupMessage');
const loginModal = getElement('loginModal');
const closeLoginModalBtn = document.querySelector('#loginModal .close-button');
const loginForm = getElement('loginForm');
const loginMessage = getElement('loginMessage');
const switchToSignupLink = getElement('switchToSignupLink');
const switchToLoginLink = getElement('switchToLoginLink');
const forgotPasswordLink = getElement('forgotPasswordLink');
const mainListingsView = getElement('mainListingsView');
const itemDetailView = getElement('itemDetailView');
const backToListingsBtnFromDetail = getElement('backToListingsBtnFromDetail');
const detailItemImage = getElement('detailItemImage');
const detailItemName = getElement('detailItemName');
const detailItemPrice = getElement('detailItemPrice');
const detailItemDescription = getElement('detailItemDescription');
const detailItemContact = getElement('detailItemContact');
const detailItemSellerInfo = getElement('detailItemSellerInfo');
const sellerNameDisplay = getElement('sellerNameDisplay');
const detailItemPostedDate = getElement('detailItemPostedDate');
const commentsSection = getElement('itemCommentsSection');
const commentsList = getElement('commentsList');
const addCommentForm = getElement('addCommentForm');
const commentContentField = getElement('commentContent');
const editProfileModal = getElement('editProfileModal');
const closeEditProfileModalBtn = document.querySelector('#editProfileModal .close-button');
const editProfileForm = getElement('editProfileForm');
const profileUsernameField = getElement('profileUsername');
const profileEmailField = getElement('profileEmail');
const viewMyMessagesFromProfileBtn = getElement('viewMyMessagesFromProfileBtn'); // For the button inside profile modal (if you add it to HTML)
const messageSellerBtn = getElement('messageSellerBtn');
const myMessagesBtn = getElement('myMessagesBtn'); // Kept as per your JS, for header button
const messagesView = getElement('messagesView');
const backToListingsFromMessagesBtn = getElement('backToListingsFromMessagesBtn');
const conversationsListPanel = getElement('conversationsListPanel');
const conversationsListInner = getElement('conversationsListInner');
const messageChatPanel = getElement('messageChatPanel');
const chatWithInfo = getElement('chatWithInfo');
const messagesContainer = getElement('messagesContainer');
const sendMessageForm = getElement('sendMessageForm');
const newMessageContentField = getElement('newMessageContent');
const adminMessagesView = getElement('adminMessagesView');
const backToListingsFromAdminMessagesViewBtn = getElement('backToListingsFromAdminMessagesViewBtn');
const adminConversationsList = getElement('adminConversationsListInner');
const adminViewMessagesBtn = getElement('adminViewMessagesBtn');
const adminMessageChatPanel = getElement('adminMessageChatPanel');
const adminChatWithInfo = getElement('adminChatWithInfo');
const adminMessagesContainer = getElement('adminMessagesContainer');
const supportChatBtn = getElement('supportChatBtn');
const startNewConversationBtn = getElement('startNewConversationBtn');


function trackGAEvent(eventName, eventParams = {}) { if (typeof gtag === 'function' && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') { gtag('event', eventName, eventParams); console.log(`GA Event: ${eventName}`, eventParams); } }
function trackPageView(path, title) { trackGAEvent('page_view', { page_path: path, page_title: title, page_location: window.location.origin + path }); }
let toastTimeout; function showToast(message, type = 'info', duration = 3000) { if (!toastNotification) return; clearTimeout(toastTimeout); toastNotification.textContent = message; toastNotification.className = 'toast-notification ' + type + ' show'; toastTimeout = setTimeout(() => { toastNotification.classList.remove('show'); }, duration); }

function updateAuthUI(user) {
    currentUser = user;
    isSuperAdmin = user && SUPERADMIN_USER_ID && user.id === SUPERADMIN_USER_ID; 
    const isLoggedIn = !!user;

    if(userEmailDisplay){userEmailDisplay.textContent = isLoggedIn ? user.email : ''; userEmailDisplay.style.display = isLoggedIn ? 'inline' : 'none';}
    if(loginBtn)loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
    if(signupBtn)signupBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
    if(logoutBtn)logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    if(editProfileBtn) editProfileBtn.style.display = isLoggedIn ? 'inline-block' : 'none'; // Your "My Profile" button
    if(myMessagesBtn) myMessagesBtn.style.display = isLoggedIn ? 'inline-block' : 'none'; // Kept for your current HTML
    if(adminViewMessagesBtn) adminViewMessagesBtn.style.display = isSuperAdmin ? 'inline-block' : 'none';
    if(supportChatBtn) supportChatBtn.style.display = 'block'; 

    if(!isLoggedIn){
        [postItemModal, editItemModal, editProfileModal, messagesView, itemDetailView, adminMessagesView].forEach(el => {
            if (el && typeof hideModal === "function") hideModal(el);
            else if (el && el.style) el.style.display = 'none';
        });
        if(mainListingsView) mainListingsView.style.display = 'block';
    }
    fetchListings(true);
}

function showModal(modalElement) { if (modalElement) { modalElement.style.display = 'flex'; requestAnimationFrame(() => { modalElement.classList.add('modal-visible'); }); } }
function hideModal(modalElement) { if (modalElement) { modalElement.classList.remove('modal-visible'); setTimeout(() => { if (!modalElement.classList.contains('modal-visible')) { modalElement.style.display = 'none'; } }, 300); } }

// Using your existing showButtonLoadingState function
function showButtonLoadingState(button, isLoading, defaultText = "Submit", loadingText = "Processing...") { 
    if (!button) return; 
    const btnTxt = button.querySelector('.button-text'); 
    const btnSpin = button.querySelector('.button-spinner'); 
    button.disabled = isLoading; 
    button.classList.toggle('loading', isLoading); 
    if (btnTxt) btnTxt.style.opacity = isLoading ? 0 : 1; 
    if (btnSpin) btnSpin.style.display = isLoading ? 'inline-block' : 'none'; 
}


async function handleSignup(event) { event.preventDefault(); if (!signupForm || !signupMessage) return; signupMessage.textContent = ''; signupMessage.className = 'form-message'; const email = signupForm.signupEmail.value; const password = signupForm.signupPassword.value; const displayName = signupDisplayNameField.value.trim(); const submitButton = signupForm.querySelector('button[type="submit"]'); showButtonLoadingState(submitButton, true, "Sign Up", "Signing up..."); const signupOptions = { data: {} }; if (displayName) signupOptions.data.username = displayName; const { error } = await supabaseClient.auth.signUp({ email, password }, { data: signupOptions.data } ); if (error) { signupMessage.textContent = "Signup failed: " + error.message; signupMessage.classList.add('error'); showToast("Signup failed.", "error"); trackGAEvent('signup_failure', {error_message: error.message}); } else { showToast("Signup successful! Check email.", "success"); trackGAEvent('sign_up', {method: "Email"}); setTimeout(() => { hideModal(signupModal); signupForm.reset(); }, 1500); } showButtonLoadingState(submitButton, false, "Sign Up"); }
async function handleLogin(event) { event.preventDefault(); if (!loginForm || !loginMessage) return; loginMessage.textContent = ''; loginMessage.className = 'form-message'; const email = loginForm.loginEmail.value; const password = loginForm.loginPassword.value; const submitButton = loginForm.querySelector('button[type="submit"]'); showButtonLoadingState(submitButton, true, "Login", "Logging in..."); const { error } = await supabaseClient.auth.signInWithPassword({ email, password }); if (error) { loginMessage.textContent = "Login failed: " + error.message; loginMessage.classList.add('error'); showToast("Login failed.", "error"); trackGAEvent('login_failure', {error_message: error.message}); } else { showToast("Login successful!", "success"); trackGAEvent('login', {method: "Email"}); setTimeout(() => { hideModal(loginModal); loginForm.reset();}, 500); } showButtonLoadingState(submitButton, false, "Login"); }
async function handleLogout() { const { error } = await supabaseClient.auth.signOut(); if (error) showToast("Logout failed: " + error.message, "error"); else { showToast("Logged out.", "info"); trackGAEvent('logout'); }}
async function handleForgotPassword() { const email = prompt("Please enter your email address to reset your password:"); if (!email) { showToast("Password reset cancelled.", "info"); return; } showToast("Sending password reset instructions...", "info", 5000); try { const { error } = await supabaseClient.auth.resetPasswordForEmail(email); if (error) throw error; showToast("Password reset instructions sent to " + email, "success", 5000); trackGAEvent('password_reset_request'); } catch (error) { showToast("Error sending password reset: " + error.message, "error", 5000); } }

async function handleEditProfile(event) { 
    event.preventDefault(); 
    if (!currentUser || !editProfileForm) return; 
    const newUsername = profileUsernameField.value.trim() || null; 
    const submitButton = editProfileForm.querySelector('button[type="submit"]'); 
    const processingOverlay = editProfileModal.querySelector('.modal-processing-overlay'); 
    showButtonLoadingState(submitButton, true, "Save Profile Details", "Saving..."); // Updated default text
    if (processingOverlay) {processingOverlay.style.display = 'flex'; processingOverlay.classList.add('visible');} 
    try { 
        const profileData = { id: currentUser.id, username: newUsername, email: currentUser.email, updated_at: new Date().toISOString() }; 
        const { data, error } = await supabaseClient.from('profiles').upsert(profileData, { onConflict: 'id' }).select().single(); 
        if (error) throw error; 
        showToast("Profile updated!", "success"); 
        trackGAEvent('profile_update'); 
        // **MODIFICATION**: Do NOT hide modal automatically. User might want to click "View My Messages" next.
        // If you add viewMyMessagesFromProfileBtn to your HTML, this allows it to be clicked.
        // hideModal(editProfileModal); // Original line from your script, now commented for this feature
        fetchListings(true); 
        if (currentOpenListingId && itemDetailView.style.display === 'block') showItemDetailPage(currentOpenListingId); 
    } catch (error) { 
        showToast("Error: " + error.message, "error"); 
    } finally { 
        showButtonLoadingState(submitButton, false, "Save Profile Details"); // Updated default text
        if (processingOverlay) {processingOverlay.style.display = 'none'; processingOverlay.classList.remove('visible');} 
    } 
}


function setupAuthListeners() { 
    if (signupBtn) signupBtn.addEventListener('click', () => { showModal(signupModal); if (signupMessage) {signupMessage.textContent='';signupMessage.className='form-message';} if (signupForm) signupForm.reset(); });
    if (loginBtn) loginBtn.addEventListener('click', () => { showModal(loginModal); if (loginMessage) {loginMessage.textContent='';loginMessage.className='form-message';} if (loginForm) loginForm.reset(); });
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (editProfileBtn) { editProfileBtn.addEventListener('click', async () => { if (!currentUser) { showToast("Please log in.", "info"); return; } try { const { data: profile, error } = await supabaseClient.from('profiles').select('username, email').eq('id', currentUser.id).single(); if (error && error.code !== 'PGRST116') throw error; if (profileUsernameField) profileUsernameField.value = profile?.username || ''; if (profileEmailField) profileEmailField.value = currentUser.email || ''; showModal(editProfileModal); } catch (error) { showToast("Could not load profile.", "error"); if (profileEmailField) profileEmailField.value = currentUser.email || ''; showModal(editProfileModal); } }); }
    
    // Listener for your existing header "My Messages" button
    if (myMessagesBtn) myMessagesBtn.addEventListener('click', () => { if(currentUser) showMessagesView(); else showToast("Please log in to see messages.", "info");});
    
    // **NEW**: Listener for the "View My Messages" button if you add it inside the Edit Profile modal
    if (viewMyMessagesFromProfileBtn) {
        viewMyMessagesFromProfileBtn.addEventListener('click', () => {
            if (currentUser) {
                hideModal(editProfileModal); // Hide profile modal first
                showMessagesView();         // Then show messages view
            } else {
                showToast("Please log in to see messages.", "info");
            }
        });
    }

    if (adminViewMessagesBtn) adminViewMessagesBtn.addEventListener('click', () => { if(isSuperAdmin) showAdminMessagesView(); else showToast("Admin access required.", "error");});
    if (supportChatBtn) supportChatBtn.addEventListener('click', handleSupportChatClick);
    if (startNewConversationBtn) startNewConversationBtn.addEventListener('click', handleStartNewGeneralConversation);
    if (closeSignupModalBtn) closeSignupModalBtn.addEventListener('click', () => hideModal(signupModal) );
    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', () => hideModal(loginModal) );
    if (closeEditProfileModalBtn) closeEditProfileModalBtn.addEventListener('click', () => hideModal(editProfileModal) );
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (editProfileForm) editProfileForm.addEventListener('submit', handleEditProfile);
    if (switchToSignupLink) switchToSignupLink.addEventListener('click', (e) => { e.preventDefault(); hideModal(loginModal); showModal(signupModal); if (signupMessage) {signupMessage.textContent='';signupMessage.className='form-message';} if (signupForm) signupForm.reset(); });
    if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => { e.preventDefault(); hideModal(signupModal); showModal(loginModal); if (loginMessage) {loginMessage.textContent='';loginMessage.className='form-message';} if (loginForm) loginForm.reset(); });
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); handleForgotPassword(); });
    if (supabaseClient) supabaseClient.auth.onAuthStateChange((_event, session) => updateAuthUI(session ? session.user : null));
}

function resetPostItemModal() { if (postItemForm) postItemForm.reset(); if (postItemPriceField) { postItemPriceField.disabled = false; postItemPriceField.required = true; } if (postImageFileUploadContainer) postImageFileUploadContainer.style.display = 'block'; if (postItemImageUrlContainer) postItemImageUrlContainer.style.display = 'none'; if (postItemImageFileField) postItemImageFileField.required = true; if (postItemImageUrlField) postItemImageUrlField.required = false; if (postItemImagePreview) { postItemImagePreview.style.display = 'none'; postItemImagePreview.src = '#'; } const btn = postItemForm.querySelector('button[type="submit"]'); if (btn) showButtonLoadingState(btn, false, "Post Item"); const ol = postItemModal.querySelector('.modal-processing-overlay'); if (ol) {ol.style.display = 'none'; ol.classList.remove('visible');} }
function resetEditItemModal() { if (editItemForm) editItemForm.reset(); if (editModalItemPriceField) { editModalItemPriceField.disabled = false; editModalItemPriceField.required = true; } if (editModalItemFreeCheckbox) editModalItemFreeCheckbox.checked = false; if (editImageSourceNoneRadio) editImageSourceNoneRadio.checked = true; if (editImageFileUploadContainer_Edit) editImageFileUploadContainer_Edit.style.display = 'none'; if (editItemImageUrlContainer_Edit) editItemImageUrlContainer_Edit.style.display = 'none'; if (editNewImageFileField) { editNewImageFileField.value = ''; editNewImageFileField.required = false; } if (editNewImageUrlField) { editNewImageUrlField.value = ''; editNewImageUrlField.required = false; } if (editItemNewImagePreview) { editItemNewImagePreview.style.display = 'none'; editItemNewImagePreview.src = '#'; } if (editItemCurrentImage) { editItemCurrentImage.src = ""; editItemCurrentImage.style.display = 'none'; } const btn = editItemForm.querySelector('button[type="submit"]'); if (btn) showButtonLoadingState(btn, false, "Save Changes"); const ol = editItemModal.querySelector('.modal-processing-overlay'); if (ol) {ol.style.display = 'none'; ol.classList.remove('visible');} }

if (postItemBtnGlobal) { postItemBtnGlobal.addEventListener('click', () => { if (currentUser) { resetPostItemModal(); showModal(postItemModal); } else { showToast("Please sign in to post an item.", "info"); showModal(loginModal); if (loginMessage) {loginMessage.textContent='';loginMessage.className='form-message';} if (loginForm) loginForm.reset(); } }); }
if (closePostModalBtn) closePostModalBtn.addEventListener('click', () => { hideModal(postItemModal); resetPostItemModal(); });
if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', () => { hideModal(editItemModal); resetEditItemModal(); });
window.addEventListener('click', (event) => { if (event.target === postItemModal) { hideModal(postItemModal); resetPostItemModal(); } if (event.target === editItemModal) { hideModal(editItemModal); resetEditItemModal(); } if (event.target === loginModal) hideModal(loginModal); if (event.target === signupModal) hideModal(signupModal); if(editProfileModal && event.target === editProfileModal) hideModal(editProfileModal); if(messagesView && event.target === messagesView && !event.target.closest('.messages-layout')) { hideModal(messagesView); currentOpenConversationId = null; if(activeChatPoller) clearInterval(activeChatPoller);} if(adminMessagesView && event.target === adminMessagesView && !event.target.closest('.messages-layout')) { hideModal(adminMessagesView); currentOpenConversationId = null; if(activeChatPoller) clearInterval(activeChatPoller); } });
if (postItemForm) { postItemForm.addEventListener('submit', async (event) => { event.preventDefault(); if (!currentUser) { showToast("You must be logged in.", "error"); return; } const submitButton = postItemForm.querySelector('button[type="submit"]'); const processingOverlay = postItemModal.querySelector('.modal-processing-overlay'); showButtonLoadingState(submitButton, true, "Post Item", "Posting..."); if (processingOverlay) {processingOverlay.style.display = 'flex'; processingOverlay.classList.add('visible');} const itemName = postItemNameField.value; const itemDescription = postItemDescriptionField.value; const itemContact = postItemContactField.value; let itemPriceValue; let finalImageUrl = null; if (postItemFreeCheckbox.checked) itemPriceValue = 0; else { itemPriceValue = parseFloat(postItemPriceField.value); if (isNaN(itemPriceValue) || itemPriceValue < 0) { showToast('Valid price or "Free" required.','error'); showButtonLoadingState(submitButton, false, "Post Item"); if (processingOverlay) {processingOverlay.style.display = 'none';processingOverlay.classList.remove('visible');} return; } } const imageSource = postImageSourceFileRadio.checked ? 'file' : 'url'; const imageFile = postItemImageFileField.files[0]; const imageUrlInput = postItemImageUrlField.value.trim(); if (!itemName || !itemDescription || !itemContact) { showToast('Name, Description, and Contact are required.','error'); showButtonLoadingState(submitButton, false, "Post Item"); if (processingOverlay) {processingOverlay.style.display = 'none';processingOverlay.classList.remove('visible');} return; } if (imageSource === 'file' && !imageFile && !postItemImageUrlField.value) { finalImageUrl = null; /* Allow posting without image if neither chosen or if file is chosen but not provided */ } else if (imageSource === 'url' && !imageUrlInput && !postItemImageFileField.files[0]) { finalImageUrl = null; /* Allow posting without image if URL chosen but not provided */ } try { if (imageSource === 'file' && imageFile) { const fileExt = imageFile.name.split('.').pop(); const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`; const { error: uploadError } = await supabaseClient.storage.from('listing-images').upload(filePath, imageFile, { metadata: { owner: currentUser.id } }); if (uploadError) throw new Error(`Image Upload: ${uploadError.message}`); const { data: urlData } = supabaseClient.storage.from('listing-images').getPublicUrl(filePath); if (!urlData || !urlData.publicUrl) throw new Error('Could not get public URL for image.'); finalImageUrl = urlData.publicUrl; } else if (imageSource === 'url' && imageUrlInput) { try { new URL(imageUrlInput); finalImageUrl = imageUrlInput; } catch (_) { throw new Error('Invalid Image URL.'); } } const { error: insertError } = await supabaseClient.from('listings').insert([{ name: itemName, description: itemDescription, price: itemPriceValue.toString(), contact_info: itemContact, image_url: finalImageUrl, user_id: currentUser.id }]); if (insertError) throw new Error(`Save Failed: ${insertError.message}`); showToast('Item posted successfully!', 'success'); trackGAEvent('post_item_success', {item_name: itemName, item_price: itemPriceValue}); resetPostItemModal(); hideModal(postItemModal); fetchListings(true); } catch (error) { console.error('Post item error:', error); showToast(`Error: ${error.message}`, 'error'); trackGAEvent('post_item_failure', {error_message: error.message}); } finally { showButtonLoadingState(submitButton, false, "Post Item"); if (processingOverlay) {processingOverlay.style.display = 'none';processingOverlay.classList.remove('visible');} } }); }
if (editItemForm) { editItemForm.addEventListener('submit', async (event) => { event.preventDefault(); if (!currentUser) { showToast("You must be logged in.", "error"); return; } const listingId = editItemIdField.value; const itemOwnerId = editItemOwnerIdField.value; const originalImageUrl = editItemOriginalImageUrlField.value; if (SUPERADMIN_USER_ID === 'YOUR_SUPERADMIN_UUID_HERE' && currentUser.id !== itemOwnerId) { showToast("Edit permission error (Admin ID not set).", "error"); return; } else if (!isSuperAdmin && currentUser.id !== itemOwnerId) { showToast("You do not have permission to edit this item.", "error"); return; } const submitButton = editItemForm.querySelector('button[type="submit"]'); const processingOverlay = editItemModal.querySelector('.modal-processing-overlay'); showButtonLoadingState(submitButton, true, "Save Changes", "Saving..."); if (processingOverlay) {processingOverlay.style.display = 'flex'; processingOverlay.classList.add('visible');} let itemPriceValue; if (editModalItemFreeCheckbox.checked) itemPriceValue = 0; else { itemPriceValue = parseFloat(editModalItemPriceField.value); if (isNaN(itemPriceValue) || itemPriceValue < 0) { showToast('Valid price or "Free" required for edit.', "error"); showButtonLoadingState(submitButton, false, "Save Changes"); if (processingOverlay) {processingOverlay.style.display = 'none';processingOverlay.classList.remove('visible');} return; } } const updatedItemData = { name: editModalItemNameField.value, description: editModalItemDescriptionField.value, price: itemPriceValue.toString(), contact_info: editModalItemContactField.value }; const imageChangeOption = document.querySelector('input[name="editImageSource"]:checked').value; const newImageFile = editNewImageFileField.files[0]; const newImageUrlInput = editNewImageUrlField.value.trim(); let newPublicUrl = null; let updatedImageWasProcessed = false; try { if (imageChangeOption === 'file' && newImageFile) { updatedImageWasProcessed = true; const fileExt = newImageFile.name.split('.').pop(); const newFilePath = `${itemOwnerId}/${listingId}-${Date.now()}-edit.${fileExt}`; const { error: uploadError } = await supabaseClient.storage.from('listing-images').upload(newFilePath, newImageFile, { metadata: { owner: itemOwnerId } }); if (uploadError) throw new Error(`New image upload failed: ${uploadError.message}`); const { data: urlData } = supabaseClient.storage.from('listing-images').getPublicUrl(newFilePath); if (!urlData || !urlData.publicUrl) throw new Error('Could not get public URL for new image.'); newPublicUrl = urlData.publicUrl; updatedItemData.image_url = newPublicUrl; } else if (imageChangeOption === 'url' && newImageUrlInput) { updatedImageWasProcessed = true; try { new URL(newImageUrlInput); } catch (_) { throw new Error('Invalid new image URL.'); } newPublicUrl = newImageUrlInput; updatedItemData.image_url = newPublicUrl; } else if (imageChangeOption === 'none'){ updatedItemData.image_url = originalImageUrl; } const { error: updateDbError } = await supabaseClient.from('listings').update(updatedItemData).eq('id', listingId); if (updateDbError) throw new Error(`Database update failed: ${updateDbError.message}`); if (updatedImageWasProcessed && originalImageUrl && newPublicUrl !== originalImageUrl && !originalImageUrl.startsWith('http')) { try { const oldImageKey = originalImageUrl.substring(originalImageUrl.indexOf(itemOwnerId + '/')); if (oldImageKey && oldImageKey.includes('/')) { await supabaseClient.storage.from('listing-images').remove([oldImageKey]); } } catch (storageDeleteError) { console.warn("Could not delete old image:", storageDeleteError.message); } } showToast('Item updated successfully!', 'success'); trackGAEvent('edit_item_success', {item_id: listingId}); resetEditItemModal(); hideModal(editItemModal); fetchListings(true); if (currentOpenListingId === listingId && itemDetailView.style.display === 'block') { showItemDetailPage(listingId); } } catch (error) { console.error('Update item error:', error); showToast(`Error: ${error.message}`, 'error'); trackGAEvent('edit_item_failure', {item_id: listingId, error_message: error.message}); } finally { showButtonLoadingState(submitButton, false, "Save Changes"); if (processingOverlay) {processingOverlay.style.display = 'none';processingOverlay.classList.remove('visible');} } }); }

async function showItemDetailPage(itemId) {
    if (!itemId || !supabaseClient) { console.error("Item ID or Supabase client missing for detail page."); return; }
    if (mainListingsView) mainListingsView.style.display = 'none';
    if (messagesView) messagesView.style.display = 'none'; 
    if (adminMessagesView) adminMessagesView.style.display = 'none';
    if (itemDetailView) { itemDetailView.style.display = 'block'; itemDetailView.scrollTo(0, 0); }
    
    const detailContentParent = getElement('itemDetailContent');
    if (detailContentParent) {
        const elementsToReset = ['detailItemImage', 'detailItemName', 'detailItemPrice', 'detailItemDescription', 'detailItemContact', 'sellerNameDisplay', 'detailItemPostedDate'];
        elementsToReset.forEach(id => { const el = getElement(id); if(el) { if(el.tagName === 'IMG') {el.src = '#'; el.style.display = 'none';} else {el.textContent = '';}}});
        let existingPlaceholder = detailContentParent.querySelector('.no-image-placeholder-detail');
        if(existingPlaceholder) existingPlaceholder.remove();
        if(getElement('detailItemSellerInfo')) getElement('detailItemSellerInfo').style.display = 'none';
        if (messageSellerBtn) messageSellerBtn.style.display = 'none';
        detailContentParent.insertAdjacentHTML('afterbegin', '<p class="loading-text">Loading item details...</p>');
        if (commentsList) commentsList.innerHTML = '<p>Loading comments...</p>';
        if (commentsSection) commentsSection.style.display = 'none';
    } else { console.error("#itemDetailContent parent not found!"); return; }

    try {
        const { data: item, error } = await supabaseClient.from('listings_with_author_info').select('*').eq('id', itemId).single();
        const loadingP = detailContentParent.querySelector('p.loading-text'); if(loadingP) loadingP.remove();

        if (error) { console.error("[showItemDetailPage] Supabase error fetching item:", error.message); throw error; }
        if (!item) { if (detailContentParent) { detailContentParent.innerHTML = '<p class="loading-text" style="color:red;">Item not found.</p>';} showToast("Item not found.", "error"); return; }
        
        const imgEl = getElement('detailItemImage'); const nameEl = getElement('detailItemName'); const priceEl = getElement('detailItemPrice'); const descEl = getElement('detailItemDescription'); const contactEl = getElement('detailItemContact'); const sellerInfoDiv = getElement('detailItemSellerInfo'); const sellerDisplayEl = getElement('sellerNameDisplay'); const dateEl = getElement('detailItemPostedDate');
        
        let noImgPlaceholder = detailContentParent.querySelector('.no-image-placeholder-detail');
        if(noImgPlaceholder) noImgPlaceholder.remove(); 

        if (imgEl) { 
            if (item.image_url) {
                imgEl.src = item.image_url; imgEl.alt = item.name || 'Listing image'; imgEl.style.display = 'block';
                imgEl.onerror = () => { 
                    imgEl.style.display='none'; 
                    noImgPlaceholder = document.createElement('div'); noImgPlaceholder.className = 'no-image-placeholder-detail';
                    noImgPlaceholder.textContent = 'Image not available';
                    imgEl.parentNode.insertBefore(noImgPlaceholder, imgEl); 
                };
            } else {
                imgEl.style.display = 'none';
                noImgPlaceholder = document.createElement('div'); noImgPlaceholder.className = 'no-image-placeholder-detail';
                noImgPlaceholder.textContent = 'No Image Provided';
                const imageWrapper = detailContentParent.querySelector('.image-detail-wrapper') || detailContentParent;
                imageWrapper.prepend(noImgPlaceholder); 
            }
        }
        if (nameEl) nameEl.textContent = item.name || 'N/A';
        let displayPrice = 'N/A'; if (item.price) { const priceNum = parseFloat(item.price); if (item.price.toString().toLowerCase() === 'free' || priceNum === 0) displayPrice = 'Free'; else if (!isNaN(priceNum)) displayPrice = `$${priceNum.toFixed(2)}`; else displayPrice = item.price; }
        if (priceEl) priceEl.textContent = displayPrice;
        if (descEl) descEl.innerHTML = (item.description || 'No description.').replace(/\n/g, '<br>');
        if (contactEl) contactEl.textContent = item.contact_info || 'N/A';
        if (dateEl) dateEl.textContent = `Posted: ${item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}`;
        if (sellerInfoDiv && sellerDisplayEl) { const sellerName = item.author_username || item.author_email; if (sellerName && sellerName.trim() !== '' && sellerName.trim().toLowerCase() !== 'n/a') { sellerDisplayEl.textContent = sellerName; sellerInfoDiv.style.display = 'block'; } else { sellerInfoDiv.style.display = 'none'; } }
        
        currentOpenListingId = itemId;
        if(messageSellerBtn) { messageSellerBtn.style.display = (currentUser && item.user_id && currentUser.id !== item.user_id) ? 'block' : 'none'; messageSellerBtn.dataset.sellerId = item.user_id; messageSellerBtn.dataset.listingId = item.id; messageSellerBtn.dataset.listingName = item.name || "this item"; messageSellerBtn.dataset.sellerName = item.author_username || item.author_email || "Seller"; }
        if (addCommentForm) { addCommentForm.style.display = currentUser ? 'block' : 'none'; if (currentUser) addCommentForm.reset(); }
        if (commentsSection) commentsSection.style.display = 'block';
        fetchComments(itemId);
        trackPageView(`/item/${item.id}`, `Item - ${item.name || 'Details'}`);
    } catch (error) { console.error("Error processing item details in showItemDetailPage:", error); const detailContentForError = getElement('itemDetailContent'); if (detailContentForError) detailContentForError.innerHTML = `<p class="loading-text" style="color:red;">Error loading item. Check console.</p>`; showToast("Could not load item details.", "error"); }
}
if (backToListingsBtnFromDetail) { backToListingsBtnFromDetail.addEventListener('click', () => { if (itemDetailView) itemDetailView.style.display = 'none'; if (mainListingsView) mainListingsView.style.display = 'block'; currentOpenListingId = null; trackPageView('/listings', 'Cleveland Marketplace - All Listings'); if(searchBar) searchBar.focus(); window.scrollTo(0, 0); }); }
if (backToListingsFromMessagesBtn) { backToListingsFromMessagesBtn.addEventListener('click', () => { if (messagesView) messagesView.style.display = 'none'; if(mainListingsView) mainListingsView.style.display = 'block'; currentOpenConversationId = null; if(activeChatPoller) clearInterval(activeChatPoller); trackPageView('/listings', 'Cleveland Marketplace - All Listings'); }); }
if (backToListingsFromAdminMessagesViewBtn) { backToListingsFromAdminMessagesViewBtn.addEventListener('click', () => { if (adminMessagesView) adminMessagesView.style.display = 'none'; if(mainListingsView) mainListingsView.style.display = 'block'; currentOpenConversationId = null; if(activeChatPoller) clearInterval(activeChatPoller); trackPageView('/listings', 'Cleveland Marketplace - All Listings'); });}

async function fetchComments(listingId) { if (!commentsList || !listingId) return; commentsList.innerHTML = '<p>Loading comments...</p>'; try { const { data: comments, error } = await supabaseClient.from('comments_with_commenter_info').select('*').eq('listing_id', listingId).order('created_at', { ascending: true }); if (error) throw error; commentsList.innerHTML = ''; if (comments && comments.length > 0) { comments.forEach(comment => { const commentDiv = document.createElement('div'); commentDiv.classList.add('comment'); const authorName = comment.commenter_username || comment.commenter_email || (comment.user_id ? 'User ' + comment.user_id.substring(0,6) : 'Anonymous'); const commentDate = new Date(comment.created_at).toLocaleString(); commentDiv.innerHTML = ` <p class="comment-author">${document.createTextNode(authorName).textContent}</p> <p class="comment-date">${commentDate}</p> <p class="comment-content">${document.createTextNode(comment.content).textContent.replace(/\n/g, '<br>')}</p> `; if (currentUser && (currentUser.id === comment.user_id || isSuperAdmin)) { const deleteBtn = document.createElement('button'); deleteBtn.textContent = 'Delete'; deleteBtn.classList.add('button-danger', 'delete-comment-btn'); deleteBtn.dataset.commentId = comment.id; deleteBtn.onclick = () => deleteComment(comment.id); const dateP = commentDiv.querySelector('.comment-date'); if(dateP && dateP.parentNode === commentDiv) dateP.insertAdjacentElement('beforeend', deleteBtn); else commentDiv.appendChild(deleteBtn); } commentsList.appendChild(commentDiv); }); } else { if (currentUser) { commentsList.innerHTML = '<p>No comments yet. Be the first!</p>'; } else { commentsList.innerHTML = '<p>No comments yet. <a href="#" id="loginToCommentLink">Sign in</a> to post a comment.</p>'; } } } catch (error) { console.error("Error fetching comments:", error); commentsList.innerHTML = '<p style="color:red;">Could not load comments.</p>'; showToast("Error loading comments.", "error"); } }
async function deleteComment(commentId) { if (!currentUser || !commentId) { showToast("Cannot delete comment.", "error"); return; } if (!confirm("Delete this comment?")) return; try { const { error } = await supabaseClient.from('comments').delete().eq('id', commentId); if (error) throw error; showToast("Comment deleted.", "success"); trackGAEvent('delete_comment', {comment_id: commentId}); fetchComments(currentOpenListingId); } catch (error) { console.error("Error deleting comment:", error); showToast(`Error: ${error.message}`, "error"); } }
async function fetchListings(isNewSearchOrFilter = false) { if (!listingsContainer) return; if (isFetchingListings && !isNewSearchOrFilter) return; isFetchingListings = true; if (isNewSearchOrFilter) { currentLoadedCount = 0; listingsContainer.innerHTML = '<p class="loading-text">Loading listings...</p>'; } else if (currentLoadedCount === 0 && listingsContainer.innerHTML.trim() === '') { listingsContainer.innerHTML = '<p class="loading-text">Loading listings...</p>'; } if (loadMoreBtn) loadMoreBtn.disabled = true; 
    let query = supabaseClient.from('listings_with_author_info').select('*').range(currentLoadedCount, currentLoadedCount + ITEMS_PER_PAGE - 1); 
    if (currentSearchTerm) query = query.or(`name.ilike.%${currentSearchTerm}%,description.ilike.%${currentSearchTerm}%`); if (currentFilterFreeOnly) { query = query.or('price.eq.0,price.ilike.free'); } else { if (currentMinPrice !== null && currentMinPrice !== '' && !isNaN(parseFloat(currentMinPrice))) query = query.gte('price', parseFloat(currentMinPrice)); if (currentMaxPrice !== null && currentMaxPrice !== '' && !isNaN(parseFloat(currentMaxPrice))) query = query.lte('price', parseFloat(currentMaxPrice)); } let sortCol = 'created_at'; let sortDir = false; if (currentSortOption) { const parts = currentSortOption.split('_'); if (parts.length >= 2) { sortDir = parts.pop() === 'asc'; sortCol = parts.join('_'); } } query = query.order(sortCol, { ascending: sortDir }); const { data: listings, error } = await query; isFetchingListings = false; if (error) { if (currentLoadedCount === 0 || isNewSearchOrFilter) listingsContainer.innerHTML = `<p class="loading-text" style="color:red;">Error: ${error.message}</p>`; else showToast(`Error fetching more: ${error.message}`, "error"); if (loadMoreContainer) loadMoreContainer.style.display = 'none'; return; } if (isNewSearchOrFilter) listingsContainer.innerHTML = ''; if (currentLoadedCount === 0 && (!listings || listings.length === 0)) { listingsContainer.innerHTML = `<p class="loading-text">${(currentSearchTerm || currentMinPrice !== null || currentMaxPrice !== null || currentFilterFreeOnly) ? 'No items match your criteria.' : 'No items posted yet.'}</p>`; if (loadMoreContainer) loadMoreContainer.style.display = 'none'; return; } listings.forEach(listing => { if (isNewSearchOrFilter === false && document.querySelector(`.listing-card[data-id="${listing.id}"]`)) return; const card = document.createElement('div'); card.className = 'listing-card'; card.dataset.itemId = listing.id; Object.assign(card.dataset, { id: listing.id, name: listing.name, description: listing.description, price: listing.price, contact: listing.contact_info, imageUrl: listing.image_url || '', ownerId: listing.user_id }); const safeName = document.createTextNode(listing.name || 'N/A').textContent; let displayPrice = 'N/A'; if (listing.price) { const priceNum = parseFloat(listing.price); if (listing.price.toLowerCase() === 'free' || priceNum === 0) displayPrice = 'Free'; else if (!isNaN(priceNum)) displayPrice = `$${priceNum.toFixed(2)}`; else displayPrice = listing.price; } const safeDesc = document.createTextNode(listing.description || '').textContent; const safeContact = document.createTextNode(listing.contact_info || '').textContent; const imgUrl = listing.image_url || ''; const date = listing.created_at ? new Date(listing.created_at).toLocaleString() : 'N/A'; let imgFilename = ''; if (imgUrl) { try { const u=new URL(imgUrl); const p=u.pathname.split('/'); const bIdx=p.indexOf('listing-images'); if(bIdx!=-1 && bIdx+1 < p.length) imgFilename=p.slice(bIdx+1).join('/'); } catch(e){} } const sellerDisplayName = listing.author_username || listing.author_email || 'User'; card.innerHTML = ` <div class="no-image-placeholder" style="display:${imgUrl ? 'none' : 'flex'};">No Image</div> ${imgUrl ? `<img src="${imgUrl}" alt="${safeName}" loading="lazy" onerror="this.style.display='none'; this.previousElementSibling.style.display='flex';">` : ''} <h3>${safeName}</h3> <p class="price-display"><strong>Price:</strong> ${displayPrice}</p> <p>${safeDesc.replace(/\n/g, '<br>')}</p> <p><strong>Contact:</strong> ${safeContact}</p> <small>Posted by ${document.createTextNode(sellerDisplayName).textContent} on ${date}</small> `; let showControls = false; if (currentUser) { if ((SUPERADMIN_USER_ID !== 'YOUR_SUPERADMIN_UUID_HERE' && isSuperAdmin) || currentUser.id === listing.user_id) showControls = true; } if (showControls) { const actionsDiv = document.createElement('div'); actionsDiv.className = 'action-buttons'; const editBtn = document.createElement('button'); editBtn.className = 'edit-button'; editBtn.textContent = 'Edit'; const delBtn = document.createElement('button'); delBtn.className = 'delete-button'; delBtn.textContent = 'Delete'; Object.assign(delBtn.dataset, { id: listing.id, ownerId: listing.user_id, imageFilename: imgFilename }); actionsDiv.append(editBtn, delBtn); card.appendChild(actionsDiv); } listingsContainer.appendChild(card); }); const initialLoadingText = listingsContainer.querySelector('p.loading-text'); if (initialLoadingText && listings.length > 0 && currentLoadedCount === 0) initialLoadingText.remove(); currentLoadedCount += listings.length; if (listings.length < ITEMS_PER_PAGE) { if (loadMoreContainer) loadMoreContainer.style.display = 'none'; } else { if (loadMoreContainer) loadMoreContainer.style.display = 'block'; if (loadMoreBtn) loadMoreBtn.disabled = false; } }
if (listingsContainer) { listingsContainer.addEventListener('click', async (event) => { const card = event.target.closest('.listing-card'); if (!card) return; if (event.target.closest('.action-buttons')) { if (event.target.classList.contains('edit-button')) { if (!currentUser) { showToast("Please log in.", "info"); return; } const ownerId = card.dataset.ownerId; if (!isSuperAdmin && currentUser.id !== ownerId && SUPERADMIN_USER_ID !== 'YOUR_SUPERADMIN_UUID_HERE') { showToast("Permission denied.", "error"); return; } resetEditItemModal(); editItemIdField.value = card.dataset.id; editItemOwnerIdField.value = ownerId; editItemOriginalImageUrlField.value = card.dataset.imageUrl || ''; editModalItemNameField.value = card.dataset.name || ''; editModalItemDescriptionField.value = card.dataset.description || ''; const currentPrice = parseFloat(card.dataset.price); if (card.dataset.price && (card.dataset.price.toLowerCase() === 'free' || currentPrice === 0)) { editModalItemPriceField.value = '0.00'; editModalItemPriceField.disabled = true; editModalItemPriceField.required = false; editModalItemFreeCheckbox.checked = true; } else if (!isNaN(currentPrice)) { editModalItemPriceField.value = currentPrice.toFixed(2); editModalItemPriceField.disabled = false; editModalItemPriceField.required = true; editModalItemFreeCheckbox.checked = false; } else { editModalItemPriceField.value = card.dataset.price || ''; editModalItemPriceField.disabled = false; editModalItemPriceField.required = true; editModalItemFreeCheckbox.checked = false; } editModalItemContactField.value = card.dataset.contact || ''; if (editItemCurrentImage) { editItemCurrentImage.src = card.dataset.imageUrl || ""; editItemCurrentImage.style.display = card.dataset.imageUrl ? 'block' : 'none'; editItemCurrentImage.onerror = () => { editItemCurrentImage.style.display = 'none'; }; } showModal(editItemModal); } else if (event.target.classList.contains('delete-button')) { if (!currentUser) { showToast("Please log in.", "info"); return; } const btn = event.target; const listId = btn.dataset.id; const ownerId = btn.dataset.ownerId; const imgFile = btn.dataset.imageFilename; if (!isSuperAdmin && currentUser.id !== ownerId && SUPERADMIN_USER_ID !== 'YOUR_SUPERADMIN_UUID_HERE') { showToast("Permission denied.", "error"); return; } if (confirm("Delete this listing?")) { btn.disabled = true; btn.textContent = "Deleting..."; await handleDeleteListing(listId, imgFile, ownerId); } } } else { const itemId = card.dataset.itemId || card.dataset.id; if (itemId) showItemDetailPage(itemId); } }); }
async function handleDeleteListing(id, imageFileNameWithPath, itemOwnerId) { if (!currentUser) { showToast("Login required.", "error"); return; } if (!isSuperAdmin && currentUser.id !== itemOwnerId && SUPERADMIN_USER_ID !== 'YOUR_SUPERADMIN_UUID_HERE') { showToast("Permission denied.", "error"); return; } try { const { error: dbErr } = await supabaseClient.from('listings').delete().eq('id', id); if (dbErr) throw new Error(`DB Delete: ${dbErr.message}`); if (imageFileNameWithPath && !imageFileNameWithPath.startsWith('http')) { const { error: storErr } = await supabaseClient.storage.from('listing-images').remove([imageFileNameWithPath]); if (storErr) console.warn('Storage Delete Warning:', storErr.message, "Path attempted:", imageFileNameWithPath); } showToast('Listing deleted!', 'success'); trackGAEvent('delete_item_success', {item_id: id}); fetchListings(true); } catch (error) { showToast(`Delete Failed: ${error.message}`, 'error'); trackGAEvent('delete_item_failure', {item_id: id, error_message: error.message}); const btn = listingsContainer?.querySelector(`.delete-button[data-id="${id}"]`); if (btn) { btn.disabled = false; btn.textContent = "Delete"; } } }

async function showMessagesView() { if (!currentUser) { showToast("Please log in to view messages.", "info"); showModal(loginModal); return; } if (mainListingsView) mainListingsView.style.display = 'none'; if (itemDetailView) itemDetailView.style.display = 'none'; if(adminMessagesView) adminMessagesView.style.display = 'none'; if (messagesView) messagesView.style.display = 'block'; if (messageChatPanel) messageChatPanel.style.display = 'none'; if (chatWithInfo) chatWithInfo.textContent = 'Select a conversation.'; trackPageView('/messages', 'My Messages'); fetchUserConversations(); }
async function fetchUserConversations() { if (!currentUser || !conversationsListInner) return; conversationsListInner.innerHTML = '<p class="loading-text">Loading conversations...</p>'; try { const { data: rpcData, error: rpcError } = await supabaseClient.rpc('get_user_conversations'); if (rpcError) throw rpcError; conversationsListInner.innerHTML = ''; if (rpcData && rpcData.length > 0) { rpcData.forEach(convo => { const otherParticipantUserId = convo.participants.find(p => p.user_id !== currentUser.id)?.user_id; const otherUserName = convo.participants.find(p => p.user_id !== currentUser.id)?.username || convo.participants.find(p => p.user_id !== currentUser.id)?.email || 'User'; const listingName = convo.listing_name || 'General Chat'; let lastMsgPreview = convo.last_message_content || 'No messages yet...'; if (lastMsgPreview.length > 25) lastMsgPreview = lastMsgPreview.substring(0, 22) + "..."; if (convo.last_message_sender_id === currentUser.id) lastMsgPreview = "You: " + lastMsgPreview; const convoItem = document.createElement('div'); convoItem.className = 'conversation-item'; convoItem.dataset.conversationId = convo.conversation_id; convoItem.dataset.otherUserId = otherParticipantUserId; convoItem.dataset.otherUserName = otherUserName; convoItem.dataset.listingId = convo.listing_id || ''; convoItem.innerHTML = `<p class="convo-user">${document.createTextNode(otherUserName).textContent}</p><p class="convo-listing">Re: ${document.createTextNode(listingName).textContent}</p><p class="convo-last-message">${document.createTextNode(lastMsgPreview).textContent}</p>`; convoItem.addEventListener('click', () => openConversation(convo.conversation_id, otherUserName, convo.listing_id)); conversationsListInner.appendChild(convoItem); }); } else { conversationsListInner.innerHTML = '<p>No conversations yet.</p>'; } } catch (error) { console.error("Error fetching conversations via RPC:", error); conversationsListInner.innerHTML = '<p style="color:red;">Could not load conversations.</p>'; showToast("Error loading convos.", "error"); } }
async function openConversation(conversationId, otherUserName, listingIdContext) { if (!conversationId) return; currentOpenConversationId = conversationId; if(messageChatPanel) messageChatPanel.style.display = 'flex'; if(chatWithInfo) chatWithInfo.textContent = `Chat with ${otherUserName || 'User'}`; if(sendMessageForm) sendMessageForm.dataset.conversationId = conversationId; document.querySelectorAll('#conversationsListInner .conversation-item, #adminConversationsListInner .conversation-item').forEach(item => { item.classList.toggle('active-conversation', item.dataset.conversationId === conversationId); }); fetchMessagesForConversation(conversationId); trackPageView(`/messages/${conversationId}`, `Conversation`); if (activeChatPoller) clearInterval(activeChatPoller); activeChatPoller = setInterval(() => { if (currentOpenConversationId === conversationId) { fetchMessagesForConversation(conversationId, false); } else { clearInterval(activeChatPoller); } }, 7000); }
async function fetchMessagesForConversation(conversationId, showLoading = true) { if (!messagesContainer || !conversationId) return; if (showLoading) messagesContainer.innerHTML = '<p class="loading-text">Loading...</p>'; try { const { data: messages, error } = await supabaseClient.from('messages_with_sender_info').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }); if (error) throw error; if (showLoading || messagesContainer.querySelector('.loading-text')) messagesContainer.innerHTML = ''; const existingMessageIds = new Set([...messagesContainer.querySelectorAll('.message-bubble')].map(el => el.dataset.messageId)); messages.forEach(msg => { if (existingMessageIds.has(msg.id)) return; const msgBubble = document.createElement('div'); msgBubble.classList.add('message-bubble'); msgBubble.dataset.messageId = msg.id; const senderName = msg.sender_username || msg.sender_email || (msg.sender_id ? 'User ' + msg.sender_id.substring(0,6) : 'Unknown'); const msgTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); if (msg.sender_id === currentUser.id) { msgBubble.classList.add('sent'); msgBubble.innerHTML = `<p>${document.createTextNode(msg.content).textContent.replace(/\n/g, '<br>')}</p><span class="msg-time">${msgTime}</span>`; } else { msgBubble.classList.add('received'); msgBubble.innerHTML = `<span class="msg-sender">${document.createTextNode(senderName).textContent}</span><p>${document.createTextNode(msg.content).textContent.replace(/\n/g, '<br>')}</p><span class="msg-time">${msgTime}</span>`; } messagesContainer.appendChild(msgBubble); }); messagesContainer.scrollTop = messagesContainer.scrollHeight; } catch (error) { console.error("Error fetching messages:", error); if (showLoading) messagesContainer.innerHTML = '<p style="color:red;">Could not load.</p>'; showToast("Error loading messages.", "error"); } }

if (sendMessageForm) { 
    sendMessageForm.addEventListener('submit', async (event) => { 
        event.preventDefault(); 
        if (!currentUser || !currentOpenConversationId || !newMessageContentField) return; 
        const content = newMessageContentField.value.trim(); 
        if (!content) return; 
        const submitButton = sendMessageForm.querySelector('button[type="submit"]'); 
        const originalButtonText = "Send"; // Using text directly as this button does not have spinner spans
        submitButton.disabled = true; 
        submitButton.textContent = 'Sending...'; 
        try { 
            const { error } = await supabaseClient.from('messages').insert({ conversation_id: currentOpenConversationId, sender_id: currentUser.id, content: content }); 
            if (error) throw error; 
            newMessageContentField.value = ''; 
            fetchMessagesForConversation(currentOpenConversationId, false); 
            fetchUserConversations(); // Refresh conversation list for last message update
            trackGAEvent('send_message', { conversation_id: currentOpenConversationId }); 
        } catch (error) { 
            showToast(`Error: ${error.message}`, "error"); 
        } finally { 
            submitButton.disabled = false; 
            submitButton.textContent = originalButtonText; 
        } 
    }); 
}

if (messageSellerBtn) { messageSellerBtn.addEventListener('click', async () => { if (!currentUser) { showToast("Please log in to message.", "info"); showModal(loginModal); return; } const sellerId = messageSellerBtn.dataset.sellerId; const listingId = messageSellerBtn.dataset.listingId; const sellerName = messageSellerBtn.dataset.sellerName || "Seller"; if (currentUser.id === sellerId) { showToast("You cannot message yourself.", "info"); return; } if (!sellerId) { showToast("Seller information is missing for this item.", "error"); return; } showToast("Initiating conversation...", "info"); try { const { data: convoData, error: rpcError } = await supabaseClient.rpc('get_or_create_conversation', { user1_id: currentUser.id, user2_id: sellerId, p_listing_id: listingId }); if (rpcError) throw rpcError; if (convoData && convoData.length > 0 && convoData[0].id) { showMessagesView(); openConversation(convoData[0].id, sellerName, listingId); trackGAEvent('start_conversation', {listing_id: listingId, seller_id: sellerId}); } else { showToast("Could not start or find conversation. Ensure RPC is set up correctly.", "error"); console.log("RPC get_or_create_conversation returned:", convoData); } } catch (error) { showToast("Error initiating message: " + error.message, "error"); trackGAEvent('start_conversation_failure', {listing_id: listingId, seller_id: sellerId, error_message: error.message}); } }); }
async function showAdminMessagesView() { if (!isSuperAdmin) { showToast("Access denied.", "error"); return; } if (mainListingsView) mainListingsView.style.display = 'none'; if (itemDetailView) itemDetailView.style.display = 'none'; if (messagesView) messagesView.style.display = 'none'; if (adminMessagesView) adminMessagesView.style.display = 'block'; if (adminMessageChatPanel) adminMessageChatPanel.style.display = 'none'; trackPageView('/admin/all-messages', 'Admin - All Conversations'); fetchAllConversationsForAdmin(); }
async function fetchAllConversationsForAdmin() { if (!isSuperAdmin || !adminConversationsList) return; adminConversationsList.innerHTML = '<p class="loading-text">Loading all site conversations...</p>'; try { const { data: conversations, error } = await supabaseClient.from('admin_conversations_overview').select('*'); if (error) throw error; adminConversationsList.innerHTML = ''; if (conversations && conversations.length > 0) { conversations.forEach(convo => { const convoItem = document.createElement('div'); convoItem.className = 'conversation-item admin-convo-item'; convoItem.dataset.conversationId = convo.conversation_id; let participantsText = "Unknown Participants"; if(convo.participants_profiles && Array.isArray(convo.participants_profiles)) { participantsText = convo.participants_profiles.map(p => p.username || p.email || `User ${p.user_id?.substring(0,6)}`).join(' & '); } const listingName = convo.listing_name || 'General Chat'; let lastMsgPreview = convo.last_message_content || 'No messages yet...'; if (lastMsgPreview.length > 30) lastMsgPreview = lastMsgPreview.substring(0,27) + "..."; convoItem.innerHTML = `<p class="convo-user"><strong>Participants:</strong> ${document.createTextNode(participantsText).textContent}</p><p class="convo-listing">Re: ${document.createTextNode(listingName).textContent}</p><p class="convo-last-message"><em>${document.createTextNode(lastMsgPreview).textContent}</em></p><small>Last Activity: ${new Date(convo.conversation_updated_at).toLocaleString()}</small>`; convoItem.addEventListener('click', () => { if(adminMessageChatPanel) adminMessageChatPanel.style.display = 'flex'; if(adminChatWithInfo) adminChatWithInfo.textContent = `Viewing: ${participantsText}`; currentOpenConversationId = convo.conversation_id; fetchMessagesForAdminChat(convo.conversation_id); document.querySelectorAll('#adminConversationsListInner .conversation-item').forEach(item => { item.classList.toggle('active-conversation', item.dataset.conversationId === convo.conversation_id); }); }); adminConversationsList.appendChild(convoItem); }); } else { adminConversationsList.innerHTML = '<p>No conversations found on the site.</p>'; } } catch (error) { console.error("Error fetching all conversations for admin:", error); adminConversationsList.innerHTML = '<p style="color:red;">Could not load conversations.</p>'; } }

async function fetchMessagesForAdminChat(conversationId) { 
    if (!adminMessagesContainer || !conversationId) return; 
    adminMessagesContainer.innerHTML = '<p class="loading-text">Loading messages...</p>'; 
    try { 
        const { data: messages, error } = await supabaseClient.from('messages_with_sender_info').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }); 
        if (error) throw error; 
        adminMessagesContainer.innerHTML = ''; 
        messages.forEach(msg => { 
            const msgBubble = document.createElement('div'); 
            msgBubble.classList.add('message-bubble'); 
            const senderName = msg.sender_username || msg.sender_email || 'User'; 
            const msgTime = new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}); 
            msgBubble.innerHTML = `<span class="msg-sender">${document.createTextNode(senderName).textContent}</span><p>${document.createTextNode(msg.content).textContent.replace(/\n/g, '<br>')}</p><span class="msg-time">${msgTime}</span>`; 
            msgBubble.classList.add(msg.sender_id === SUPERADMIN_USER_ID ? 'sent' : 'received'); 
            
            // **NEW**: Add delete button for admin
            if (isSuperAdmin) { 
                const deleteMsgBtn = document.createElement('button');
                deleteMsgBtn.innerHTML = '×'; // Using a multiplication sign for 'x'
                deleteMsgBtn.title = 'Delete this message';
                deleteMsgBtn.classList.add('admin-delete-message-btn');
                deleteMsgBtn.dataset.messageId = msg.id;
                deleteMsgBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent chat opening if somehow bubble click is triggered
                    handleDeleteMessageByAdmin(msg.id);
                });
                msgBubble.appendChild(deleteMsgBtn);
            }
            adminMessagesContainer.appendChild(msgBubble); 
        }); 
        adminMessagesContainer.scrollTop = adminMessagesContainer.scrollHeight; 
    } catch (error) { 
        adminMessagesContainer.innerHTML = '<p style="color:red;">Could not load messages.</p>'; 
    } 
}

// **NEW FUNCTION**: For admin to delete a specific message
async function handleDeleteMessageByAdmin(messageId) {
    if (!isSuperAdmin) {
        showToast("Access denied. Only admins can delete messages.", "error");
        return;
    }
    if (!messageId) {
        showToast("Message ID missing.", "error");
        return;
    }

    if (!confirm("Are you sure you want to permanently delete this message? This cannot be undone.")) {
        return;
    }

    showToast("Deleting message...", "info");
    try {
        const { error } = await supabaseClient
            .from('messages')
            .delete()
            .eq('id', messageId);

        if (error) throw error;

        showToast("Message deleted successfully.", "success");
        trackGAEvent('admin_delete_message', { message_id: messageId, conversation_id: currentOpenConversationId });
        
        // Refresh the current admin chat view if it's open for this conversation
        if (currentOpenConversationId && adminMessagesContainer.closest('#adminMessagesView') && adminMessagesContainer.closest('#adminMessagesView').style.display === 'block') {
            fetchMessagesForAdminChat(currentOpenConversationId);
        }
        // Refresh the admin conversation list (as last message might change or convo might appear empty)
        if (typeof fetchAllConversationsForAdmin === 'function' && adminMessagesView && adminMessagesView.style.display === 'block') {
            fetchAllConversationsForAdmin();
        }
        // Also refresh user's own conversation list if applicable
        if (typeof fetchUserConversations === 'function' && messagesView && messagesView.style.display === 'block') {
            fetchUserConversations();
        }

    } catch (error) {
        console.error("Error deleting message by admin:", error);
        showToast(`Error deleting message: ${error.message}`, "error");
    }
}


async function handleStartNewGeneralConversation() { if (!currentUser) { showToast("Please log in to start a conversation.", "info"); showModal(loginModal); return; } const targetUserIdentifier = prompt("Enter the email or username of the user you want to message:"); if (!targetUserIdentifier || targetUserIdentifier.trim() === '') { showToast("No user specified.", "info"); return; } try { const { data: targetProfile, error: profileError } = await supabaseClient.from('profiles').select('id, username, email').or(`email.eq.${targetUserIdentifier.trim()},username.eq.${targetUserIdentifier.trim()}`).maybeSingle(); if (profileError) throw profileError; if (!targetProfile) { showToast("User not found.", "error"); return; } if (targetProfile.id === currentUser.id) { showToast("You cannot start a conversation with yourself.", "info"); return; } showToast("Looking for or creating conversation...", "info"); const { data: convoData, error: rpcError } = await supabaseClient.rpc('get_or_create_conversation', { user1_id: currentUser.id, user2_id: targetProfile.id, p_listing_id: null }); if (rpcError) throw rpcError; if (convoData && convoData.length > 0 && convoData[0].id) { showMessagesView(); openConversation(convoData[0].id, targetProfile.username || targetProfile.email, "General Chat"); trackGAEvent('start_general_conversation', { to_user_id: targetProfile.id }); } else { showToast("Could not start or find conversation.", "error"); } } catch (error) { console.error("Error starting general conversation:", error); showToast(`Error: ${error.message}`, "error"); } }
async function handleSupportChatClick() { if (!currentUser) { showToast("Please log in to chat with support.", "info"); showModal(loginModal); return; } if (!SUPERADMIN_USER_ID || SUPERADMIN_USER_ID === 'YOUR_SUPERADMIN_UUID_HERE') { showToast("Support chat is currently unavailable.", "error"); console.error("SUPERADMIN_USER_ID (acting as SUPPORT_USER_ID) is not configured."); return; } if (currentUser.id === SUPERADMIN_USER_ID) { showToast("This is the support account. You cannot initiate a chat with yourself.", "info"); return; } showToast("Connecting to support...", "info"); try { const { data: convoData, error: rpcError } = await supabaseClient.rpc('get_or_create_conversation', { user1_id: currentUser.id, user2_id: SUPERADMIN_USER_ID, p_listing_id: null }); if (rpcError) throw rpcError; if (convoData && convoData.length > 0 && convoData[0].id) { showMessagesView(); openConversation(convoData[0].id, "Support Team", "Support Chat"); trackGAEvent('start_support_chat'); } else { showToast("Could not connect to support chat.", "error"); } } catch (error) { console.error("Error initiating support chat:", error); showToast(`Error connecting to support: ${error.message}`, "error"); } }

document.addEventListener('DOMContentLoaded', async () => { if (!supabaseClient) { if (listingsContainer) listingsContainer.innerHTML = "<p class='loading-text' style='color:red; font-weight:bold;'>App Error: Backend connection failed.</p>"; return; } if (SUPERADMIN_USER_ID === 'YOUR_SUPERADMIN_UUID_HERE') console.warn("WARN: SUPERADMIN_USER_ID is placeholder."); else if (SUPERADMIN_USER_ID && SUPERADMIN_USER_ID.length !== 36) console.error("CRIT: SUPERADMIN_USER_ID invalid format."); setupAuthListeners(); if (postItemFreeCheckbox && postItemPriceField) { postItemFreeCheckbox.addEventListener('change', () => { postItemPriceField.disabled = postItemFreeCheckbox.checked; postItemPriceField.required = !postItemFreeCheckbox.checked; if (postItemFreeCheckbox.checked) postItemPriceField.value = '0.00'; else postItemPriceField.value = ''; }); } if (postImageSourceFileRadio && postImageSourceUrlRadio) { const hdl=()=>{ const iF=postImageSourceFileRadio.checked; if(postImageFileUploadContainer)postImageFileUploadContainer.style.display=iF?'block':'none'; if(postItemImageUrlContainer)postItemImageUrlContainer.style.display=iF?'none':'block'; if(postItemImageFileField)postItemImageFileField.required=iF; if(postItemImageUrlField)postItemImageUrlField.required=!iF; if(iF && postItemImageUrlField)postItemImageUrlField.value='';else if (postItemImageFileField) postItemImageFileField.value=''; if(postItemImagePreview)postItemImagePreview.style.display=(iF&&postItemImageFileField.files.length>0)?'block':'none';}; postImageSourceFileRadio.addEventListener('change',hdl); postImageSourceUrlRadio.addEventListener('change',hdl); hdl(); } if (postItemImageFileField && postItemImagePreview) { postItemImageFileField.addEventListener('change', function(){const f=this.files[0];if(f){const r=new FileReader();r.onload=(e)=>{postItemImagePreview.src=e.target.result;postItemImagePreview.style.display='block';};r.readAsDataURL(f);}else{postItemImagePreview.src='#';postItemImagePreview.style.display='none';}}); } if (editModalItemFreeCheckbox && editModalItemPriceField) { editModalItemFreeCheckbox.addEventListener('change', () => { editModalItemPriceField.disabled = editModalItemFreeCheckbox.checked; editModalItemPriceField.required = !editModalItemFreeCheckbox.checked; if (editModalItemFreeCheckbox.checked) editModalItemPriceField.value = '0.00'; else editModalItemPriceField.value = ''; }); } if (editImageSourceNoneRadio && editImageSourceFileRadio_Edit && editImageSourceUrlRadio_Edit) { const hdl=()=>{ if(editImageFileUploadContainer_Edit)editImageFileUploadContainer_Edit.style.display=editImageSourceFileRadio_Edit.checked?'block':'none'; if(editItemImageUrlContainer_Edit)editItemImageUrlContainer_Edit.style.display=editImageSourceUrlRadio_Edit.checked?'block':'none'; if(editNewImageFileField)editNewImageFileField.required=editImageSourceFileRadio_Edit.checked; if(editNewImageUrlField)editNewImageUrlField.required=editImageSourceUrlRadio_Edit.checked; if(!editImageSourceFileRadio_Edit.checked&&editNewImageFileField)editNewImageFileField.value=''; if(!editImageSourceUrlRadio_Edit.checked&&editNewImageUrlField)editNewImageUrlField.value=''; if(editItemNewImagePreview)editItemNewImagePreview.style.display=(editImageSourceFileRadio_Edit.checked&&editNewImageFileField.files.length > 0)?'block':'none';}; [editImageSourceNoneRadio,editImageSourceFileRadio_Edit,editImageSourceUrlRadio_Edit].forEach(r=>{if(r)r.addEventListener('change',hdl);}); hdl(); } if (editNewImageFileField && editItemNewImagePreview) { editNewImageFileField.addEventListener('change', function(){const f=this.files[0];if(f){const r=new FileReader();r.onload=(e)=>{editItemNewImagePreview.src=e.target.result;editItemNewImagePreview.style.display='block';};r.readAsDataURL(f);}else{editItemNewImagePreview.src='#';editItemNewImagePreview.style.display='none';}}); } 
    
    if (addCommentForm) { 
        addCommentForm.addEventListener('submit', async (event) => { 
            event.preventDefault(); 
            if (!currentUser || !currentOpenListingId || !commentContentField) { showToast("Login to comment.", "error"); return; } 
            const content = commentContentField.value.trim(); 
            if (!content) { showToast("Comment cannot be empty.", "error"); return; } 
            const submitButton = addCommentForm.querySelector('button[type="submit"]'); 
            const originalButtonText = "Post Comment"; // This button doesn't use spinner spans
            submitButton.disabled = true;
            submitButton.textContent = "Posting...";
            try { 
                const { error } = await supabaseClient.from('comments').insert({ listing_id: currentOpenListingId, user_id: currentUser.id, content: content }); 
                if (error) throw error; 
                showToast("Comment posted!", "success"); 
                trackGAEvent('post_comment_success', {listing_id: currentOpenListingId}); 
                addCommentForm.reset(); 
                fetchComments(currentOpenListingId); 
            } catch (error) { 
                console.error("Error posting comment:", error); 
                showToast(`Error: ${error.message}`, "error"); 
                trackGAEvent('post_comment_failure', {listing_id: currentOpenListingId, error_message: error.message}); 
            } finally { 
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            } 
        }); 
    } 

    if (itemDetailView) { itemDetailView.addEventListener('click', function(event) { if (event.target && event.target.id === 'loginToCommentLink') { event.preventDefault(); showModal(loginModal); if (loginMessage) { loginMessage.textContent = ''; loginMessage.className = 'form-message'; } if (loginForm) loginForm.reset(); } if (event.target && event.target.classList.contains('delete-comment-btn')) { const commentId = event.target.dataset.commentId; if (commentId) deleteComment(commentId); } }); }
    if (searchBar) { searchBar.addEventListener('input', (e) => { clearTimeout(searchBar.searchTimeout); searchBar.searchTimeout = setTimeout(() => { currentSearchTerm = e.target.value.trim(); if(currentSearchTerm) trackGAEvent('search', {search_term: currentSearchTerm}); fetchListings(true); }, 500); }); } if (applyFiltersBtn) { applyFiltersBtn.addEventListener('click', () => { currentMinPrice = minPriceInput.value !== '' ? parseFloat(minPriceInput.value) : null; currentMaxPrice = maxPriceInput.value !== '' ? parseFloat(maxPriceInput.value) : null; currentFilterFreeOnly = filterFreeItemsCheckbox.checked; currentSortOption = sortListingsSelect.value; trackGAEvent('filter_sort_apply', {min_price: currentMinPrice, max_price: currentMaxPrice, free_only: currentFilterFreeOnly, sort_by: currentSortOption }); fetchListings(true); }); } if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => { trackGAEvent('load_more_listings'); fetchListings(false);});
    try { const { data: { session } } = await supabaseClient.auth.getSession(); updateAuthUI(session ? session.user : null); } catch (e) { updateAuthUI(null); }
    trackPageView(window.location.pathname === '/' || window.location.pathname === '' ? '/listings' : window.location.pathname, document.title); 
    const listingsSub = supabaseClient.channel('public-listings-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, (payload) => { console.log('Realtime listings change:', payload); fetchListings(true); }).subscribe((s, err) => { if(s==='SUBSCRIBED')console.log('RT Listings ON'); if(err)console.error('RT Listings Error:', err);});
    const commentsSub = supabaseClient.channel('public-comments-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => { if (currentOpenListingId && payload.new && payload.new.listing_id === currentOpenListingId) { fetchComments(currentOpenListingId); } else if (currentOpenListingId && payload.eventType === 'DELETE' && payload.old && payload.old.listing_id === currentOpenListingId) { fetchComments(currentOpenListingId); } }).subscribe((s, err) => { if(s==='SUBSCRIBED')console.log('RT Comments ON'); if(err)console.error('RT Comments Error:', err);});
    
    const messagesSub = supabaseClient.channel('public-messages-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => { 
            if (currentOpenConversationId && payload.new.conversation_id === currentOpenConversationId) { 
                const targetView = adminMessagesView.style.display === 'block' ? 'admin' : (messagesView.style.display === 'block' ? 'user' : null); 
                if (targetView === 'admin') fetchMessagesForAdminChat(currentOpenConversationId); 
                else if (targetView === 'user') fetchMessagesForConversation(currentOpenConversationId, false); 
            } 
            if (adminMessagesView.style.display === 'block') fetchAllConversationsForAdmin(); 
            if (messagesView.style.display === 'block') fetchUserConversations(); 
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => { // **NEW**: Handle DELETES
            if (currentOpenConversationId && payload.old.conversation_id === currentOpenConversationId) { 
                const targetView = adminMessagesView.style.display === 'block' ? 'admin' : (messagesView.style.display === 'block' ? 'user' : null); 
                if (targetView === 'admin') fetchMessagesForAdminChat(currentOpenConversationId); 
                // User view doesn't usually show deleted messages disappearing unless specifically designed.
                // else if (targetView === 'user') fetchMessagesForConversation(currentOpenConversationId, false); 
            } 
            if (adminMessagesView.style.display === 'block') fetchAllConversationsForAdmin(); // Refresh admin list in case last message changed
            if (messagesView.style.display === 'block') fetchUserConversations(); // Refresh user list
        })
        .on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'conversations'}, () => {
            if (messagesView.style.display === 'block') fetchUserConversations(); 
            if (adminMessagesView.style.display === 'block') fetchAllConversationsForAdmin(); 
        })
        .on('postgres_changes', {event: 'UPDATE', schema: 'public', table: 'conversations'}, (payload) => { 
            if (payload.new && payload.new.id) { 
                const pCheck = async () => { 
                    if(!currentUser) return; 
                    const {data} = await supabaseClient.from('conversation_participants').select('user_id').eq('conversation_id', payload.new.id).eq('user_id', currentUser.id).maybeSingle(); 
                    if(data && messagesView.style.display === 'block') fetchUserConversations(); 
                    if (adminMessagesView.style.display === 'block') fetchAllConversationsForAdmin(); 
                }; 
                pCheck();
            }
        })
        .subscribe((s, err) => { 
            if(s==='SUBSCRIBED')console.log('RT Messages/Convos ON'); 
            if(err)console.error('RT Messages/Convos Error:', err);
        });
    
    window.addEventListener('beforeunload', () => { if (listingsSub) supabaseClient.removeChannel(listingsSub); if (commentsSub) supabaseClient.removeChannel(commentsSub); if (messagesSub) supabaseClient.removeChannel(messagesSub); });
});