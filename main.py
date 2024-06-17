import os
import json
import psutil
import eel
import threading
import time
import shutil
import tempfile
import base64

eel.init('templates')

COMMENTS_FILE = 'comments.json'
CUSTOM_LANGUAGES_FILE = 'custom_languages.json'

def load_comments():
    if os.path.exists(COMMENTS_FILE):
        with open(COMMENTS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_comments(comments):
    with open(COMMENTS_FILE, 'w') as f:
        json.dump(comments, f, indent=4)

comments = load_comments()

def get_drive_info():
    drives = []
    partitions = psutil.disk_partitions()
    for partition in partitions:
        drives.append(partition.device)
    return drives

def scan_directories(drive, language):
    directories = []
    try:
        with os.scandir(drive) as entries:
            for entry in entries:
                if entry.is_dir() and entry.name.lower().startswith(language.lower()):
                    directories.append(entry.path)
    except PermissionError:
        print("Permission denied to access the drive.")
    return directories

@eel.expose
def browse_drives():
    drives = get_drive_info()
    eel.updateDriveCombobox(drives)

@eel.expose
def list_directories(drive, language):
    directories = scan_directories(drive, language)
    eel.updateDirectoryList(directories)

@eel.expose
def get_comment(directory):
    return comments.get(directory, "")

@eel.expose
def save_comment(directory, comment):
    comments[directory] = comment
    save_comments(comments)

def load_custom_languages():
    if os.path.exists(CUSTOM_LANGUAGES_FILE):
        with open(CUSTOM_LANGUAGES_FILE, 'r') as f:
            return json.load(f)
    return {}

custom_languages = load_custom_languages()

def save_custom_languages(custom_languages):
    with open(CUSTOM_LANGUAGES_FILE, 'w') as f:
        json.dump(custom_languages, f, indent=4)



@eel.expose
def delete_directory(directory):
    shutil.rmtree(directory)

@eel.expose
def add_custom_language(language, image_data):
    if image_data is None:
        raise ValueError("Error: No image data provided.")

    # Create a temporary directory
    temp_dir = tempfile.mkdtemp()

    try:
        # Define the destination filename
        filename = f"{language}-logo.png"

        # Construct the destination path
        destination_path = os.path.join('templates/assets', filename)

        # Write the image data to a temporary file
        temp_file_path = os.path.join(temp_dir, filename)
        with open(temp_file_path, 'wb') as f:
            f.write(base64.b64decode(image_data))

        # Move the temporary file to the destination path
        shutil.move(temp_file_path, destination_path)

        # Store the destination path instead of the original image path
        custom_languages[language] = destination_path
        save_custom_languages(custom_languages)
    finally:
        # Cleanup: Remove the temporary directory
        shutil.rmtree(temp_dir)
@eel.expose
def delete_custom_language(language):
    if language in custom_languages:
        # Remove the language from the custom_languages dictionary
        del custom_languages[language]

        # Save the updated custom_languages dictionary
        save_custom_languages(custom_languages)

        # Delete the image file associated with the language
        os.remove('templates/assets/' + language + '-logo.png')
def monitor_drives():
    previous_drives = get_drive_info()
    while True:
        time.sleep(5)  # Check for changes every 5 seconds
        current_drives = get_drive_info()
        if current_drives != previous_drives:
            eel.updateDriveCombobox(current_drives)
            previous_drives = current_drives

# Start the drive monitoring thread
drive_monitor_thread = threading.Thread(target=monitor_drives, daemon=True)
drive_monitor_thread.start()

eel.start('index.html', size=(800, 600))
