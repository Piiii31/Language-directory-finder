// Expose the updateDirectoryList function to Python
eel.expose(updateDirectoryList);

// Define the updateDirectoryList function
function updateDirectoryList(directories) {

    var favorites = JSON.parse(localStorage.getItem('favorites')) || {};

    // Sort directories so that favorite directories come first
    directories.sort(function(a, b) {
        var aIsFavorite = a in favorites;
        var bIsFavorite = b in favorites;
        if (aIsFavorite && !bIsFavorite) {
            return -1; // a comes first
        } else if (!aIsFavorite && bIsFavorite) {
            return 1; // b comes first
        } else {
            return a.localeCompare(b); // Alphabetical order
        }
    });
    var directoryList = document.getElementById('directories');
    directoryList.innerHTML = '';
    directories.forEach(function(directory) {
        var li = document.createElement('li');

        // Create div for icons
        var iconsDiv = document.createElement('div');
        iconsDiv.className = 'directory-icons'; // Add class for styling
        iconsDiv.style.float = 'right'; // Align icons to the right
        iconsDiv.style.marginLeft = '10px'; // Add a gap between icons
        li.appendChild(iconsDiv);

        // Create icons
        var iconStyle = "width: 24px; height: 24px;"; // Set width and height of icons
        var commentIcon = document.createElement('i');
        commentIcon.className = "fas fa-comment-dots"; // Font Awesome class for comment icon
        commentIcon.style.cssText = iconStyle; // Apply style
        commentIcon.onclick = function() {
            selectedDirectory = directory;
            document.getElementById('comment-modal').style.display = 'block';
        };
        iconsDiv.appendChild(commentIcon);

        var openIcon = document.createElement('i');
        openIcon.className = "fas fa-folder-open"; // Font Awesome class for open folder icon
        openIcon.style.cssText = iconStyle; // Apply style
        openIcon.onclick = function() {
            // Add logic to open the directory
            window.open(directory);
        };
        iconsDiv.appendChild(openIcon);

        var favoriteIcon = document.createElement('i');
        favoriteIcon.className = "fas fa-star"; // Font Awesome class for favorite (star) icon
        favoriteIcon.style.cssText = iconStyle; // Apply style
        if (favorites[directory]) {
            favoriteIcon.style.color = "yellow"; // Check if directory is favorite and set color
        }
        favoriteIcon.onclick = function() {
            favorites[directory] = !favorites[directory];
            localStorage.setItem('favorites', JSON.stringify(favorites)); // Save favorite states to localStorage
            if (favorites[directory]) {
                favoriteIcon.style.color = "yellow"; // Change color to yellow if favorited
            } else {
                favoriteIcon.style.color = ""; // Reset color if unfavorited
            }
        };
        iconsDiv.appendChild(favoriteIcon);

        var deleteIcon = document.createElement('i');
        deleteIcon.className = "fas fa-trash"; // Font Awesome class for delete (trash) icon
        deleteIcon.style.cssText = iconStyle; // Apply style
        deleteIcon.onclick = function() {
            // Add logic to delete the directory
            eel.delete_directory(directory)(function() {
                // Refresh the list to remove the deleted directory
                eel.list_directories(selectedDrive, selectedLanguage)();
            });
        };
        iconsDiv.appendChild(deleteIcon);

        // Create span for directory name and comment
        var contentSpan = document.createElement('span');
        contentSpan.textContent = directory;
        contentSpan.style.marginRight = '10px'; // Add margin for separation from icons
        li.appendChild(contentSpan);

        var commentSpan = document.createElement('span');
        commentSpan.textContent = "Loading comment...";
        commentSpan.className = 'comment-span'; // Added class for styling
        commentSpan.style.display = 'none'; // Initially hide comment
        li.appendChild(commentSpan);

        // Create arrow-down icon
        var arrowDownIcon = document.createElement('i');
        arrowDownIcon.className = 'fas fa-chevron-down expand-icon';
        arrowDownIcon.onclick = function() {
            toggleComment(commentSpan);
        };
        li.appendChild(arrowDownIcon);

        directoryList.appendChild(li);

        eel.get_comment(directory)(function(comment) {
            commentSpan.textContent = comment ? comment : "No comment";
        });
    });
}
function addCustomLanguage() {
    // Get the image file and language name from the form
    var languageImage = document.getElementById('language-image').files[0];
    var languageName = document.getElementById('language-name').value;

    // Convert the image file to a data URL
    var reader = new FileReader();
    reader.onloadend = function() {
        var imageDataURL = reader.result;

        // Remove the data URL prefix
        var base64String = imageDataURL.split(',')[1];

        // Add padding to the base64 string if necessary
        while (base64String.length % 4 !== 0) {
            base64String += '=';
        }

        // Call the add_custom_language function in Python with the language name and image data
        eel.add_custom_language(languageName, base64String)(function() {
            // Refresh the list of languages
            eel.list_directories(selectedDrive, selectedLanguage)();
            // Save the custom language
            saveCustomLanguage(languageName);
        });
    };
    reader.readAsDataURL(languageImage);

    // Hide the custom language modal
    document.getElementById('custom-language-modal').style.display = 'none';
}

function saveCustomLanguage(languageName) {
    // Get the custom languages from localStorage
    var customLanguages = JSON.parse(localStorage.getItem('customLanguages')) || [];
    // Add the new language to the array
    customLanguages.push(languageName);
    // Save the updated array to localStorage
    localStorage.setItem('customLanguages', JSON.stringify(customLanguages));
}

function toggleComment(commentSpan) {
    if (commentSpan.style.display === 'none') {
        commentSpan.style.display = 'block'; // Show comment
    } else {
        commentSpan.style.display = 'none'; // Hide comment
    }
}

function saveComment() {
    const commentText = document.getElementById('comment-text').value;
    eel.save_comment(selectedDirectory, commentText)(function() {
        document.getElementById('comment-modal').style.display = 'none';
        eel.list_directories(selectedDrive, selectedLanguage)(); // Refresh the list to show the new comment
    });
}
let selectedDrive = "";
let selectedLanguage = "";
let selectedDirectory = "";

function selectDrive() {
    selectedDrive = document.getElementById('drives').value;
    document.getElementById('language-modal').style.display = 'block';
}

function selectLanguage(language) {
    if (language === 'Custom') {
        // Show the custom language modal
        document.getElementById('custom-language-modal').style.display = 'block';
    } else {
        selectedLanguage = language;
        document.getElementById('language-modal').style.display = 'none';
        eel.list_directories(selectedDrive, selectedLanguage)();
    }
}
// Get the trash icon element
var trashIcon = document.getElementById('trash-icon');

// Add a long press event listener to the language icons
var languageIcons = document.getElementsByClassName('language-option');
for (var i = 0; i < languageIcons.length; i++) {
    languageIcons[i].addEventListener('mousedown', function(e) {
        // Show the trash icon
        trashIcon.style.display = 'block';

        // Move the trash icon to the mouse position
        trashIcon.style.left = e.pageX + 'px';
        trashIcon.style.top = e.pageY + 'px';

        // Start checking for collision
        var intervalId = setInterval(function() {
            if (isColliding(trashIcon, e.target)) {
                // If the trash icon and the language icon are colliding, delete the language
                deleteLanguage(e.target.dataset.language);

                // Stop checking for collision
                clearInterval(intervalId);
            }
        }, 100);
    });
}

// Define the collision detection function
function isColliding(element1, element2) {
    var rect1 = element1.getBoundingClientRect();
    var rect2 = element2.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom);
}

// Define the delete language function
function deleteLanguage(language) {
    // Call the delete_custom_language function in Python with the language name
    eel.delete_custom_language(language)(function() {
        // Refresh the list of languages
        eel.list_directories(selectedDrive, selectedLanguage)();

        // Remove the language from the customLanguages array in localStorage
        var customLanguages = JSON.parse(localStorage.getItem('customLanguages')) || [];
        var index = customLanguages.indexOf(language);
        if (index !== -1) {
            customLanguages.splice(index, 1);
            localStorage.setItem('customLanguages', JSON.stringify(customLanguages));
        }

        // Remove the language option from the DOM
        var languageOptions = document.getElementById('language-options');
        var languageOption = document.querySelector('.language-option[data-language="' + language + '"]');
        if (languageOption) {
            languageOptions.removeChild(languageOption);
        }
    });
}

eel.expose(updateDriveCombobox);
function updateDriveCombobox(drives) {
    var driveSelect = document.getElementById('drives');
    var currentDrives = Array.from(driveSelect.options).map(option => option.value);

    // Add new drives
    drives.forEach(function(drive) {
        if (!currentDrives.includes(drive)) {
            var option = document.createElement('option');
            option.value = drive;
            option.textContent = drive;
            driveSelect.appendChild(option);
        }
    });

    // Remove old drives
    Array.from(driveSelect.options).forEach(option => {
        if (!drives.includes(option.value)) {
            option.remove();
        }
    });

    // Reset selectedDrive and clear directory list if the selected drive is not available
    if (selectedDrive && !drives.includes(selectedDrive)) {
        selectedDrive = "";
        document.getElementById('directories').innerHTML = '';
    }
}

// Initially populate drives
eel.browse_drives()();

// Periodically check for directories in the selected drive
setInterval(() => {
    if (selectedDrive && selectedLanguage) {
        eel.list_directories(selectedDrive, selectedLanguage)();
    }
}
, 5000);