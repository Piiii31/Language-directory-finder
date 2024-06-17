# Language Directory Finder

## Overview

Language Directory Finder is a desktop application that allows users to browse directories, add comments, mark favorites, and manage custom languages with associated images.

## Features

- Browse and manage directories.
- Add, edit, and view comments for directories.
- Mark directories as favorites.
- Add custom languages with associated images.
- Responsive user interface with periodic updates.

## Requirements

- Python 3.8+
- Eel
- Bottle
- PyInstaller (for building the desktop application)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Piiii31/Language-directory-finder.git
    cd Language-directory-finder
    ```

2. **Create and activate a virtual environment:**

    ```bash
    python -m venv .venv
    source .venv/bin/activate   # On Windows, use: .venv\Scripts\activate
    ```

3. **Install the dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

## Running the Application

1. **Activate the virtual environment:**

    ```bash
    source .venv/bin/activate   # On Windows, use: .venv\Scripts\activate
    ```

2. **Run the application:**

    ```bash
    python main.py
    ```

## Building the Desktop Application

To build the desktop application as an executable, follow these steps:

1. **Install PyInstaller:**

    ```bash
    pip install pyinstaller
    ```

2. **Create a PyInstaller spec file (if not already created):**

    ```bash
    pyinstaller --noconfirm --onefile --windowed main.py
    ```

3. **Build the executable:**

    ```bash
    pyinstaller main.spec
    ```

    This will generate the executable in the `dist` directory.

4. **Run the executable:**

    Navigate to the `dist` directory and run the generated `.exe` file.

## Notes

- Ensure that all the paths used in your code are relative paths, especially when dealing with resources like HTML, CSS, and image files. This will help in packaging everything correctly.
- The `--onefile` option in PyInstaller bundles everything into a single executable, making it easier to distribute.
- The `--windowed` option suppresses the console window on Windows.

## Troubleshooting

- If you encounter issues related to missing files or paths, make sure all resource files are correctly specified in the `main.spec` file.
- Refer to the PyInstaller documentation for more detailed configuration options: [PyInstaller Documentation](https://pyinstaller.readthedocs.io/)
