# BookBrew

An Obsidian plugin for creating beautiful books from your notes using LaTeX.

## Features

- Convert your Markdown notes into professionally typeset books
- Multiple layout templates for different book formats (currently only Brsnob A5 available, more coming soon)
- Support for various imposition schemes (signatures, spreads)
- Cover generator with spine width calculation
- Dynamic fields for customizing your book's metadata
- Multiple language support (English, French, Spanish, German)

## Requirements

The plugin requires the following external tools to be installed on your system:

### XeLaTeX

XeLaTeX is used for typesetting your book. You can install it by:
- Windows: Install [MiKTeX](https://miktex.org/download) or [TeX Live](https://tug.org/texlive/)
- macOS: Install [MacTeX](https://www.tug.org/mactex/) (compatibility not tested yet)
- Linux: Install TeX Live using your package manager (compatibility not tested yet)
  ```bash
  # Ubuntu/Debian
  sudo apt install texlive-xetex
  ```

### Pandoc

Pandoc is used for converting Markdown to LaTeX. Install it from:
- Windows: [Pandoc installer](https://pandoc.org/installing.html)
- macOS: `brew install pandoc` (compatibility not tested yet)
- Linux: (compatibility not tested yet)
  ```bash
  # Ubuntu/Debian
  sudo apt install pandoc
  ```

### PDFtk

PDFtk is used for PDF manipulation (imposition, cover generation). Install it from:
- Windows: [PDFtk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/) (version 2.02 or later)
- macOS: `brew install pdftk-java` (compatibility not tested yet)
- Linux: (compatibility not tested yet)
  ```bash
  # Ubuntu/Debian
  sudo apt install pdftk-java
  ```

## Installation

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "BookBrew"
4. Install the plugin
5. Enable the plugin in your list of installed plugins

## Configuration

1. Open the plugin settings
2. Set the paths to your LaTeX, Pandoc, and PDFtk installations if they're not in your system PATH
3. Choose your preferred language
4. Configure default paper thickness for spine width calculation
5. Choose whether to keep temporary files for debugging

## Usage

1. Click the beer icon in the ribbon to open the BookBrew panel
2. Select a layout template for your book
3. Fill in the dynamic fields (title, author, etc.)
4. Choose an imposition scheme if needed
5. Set paper thickness for spine calculation
6. Click Export to generate your book
7. Optionally, generate a cover with the correct spine width

## Templates

The plugin currently comes with one built-in template:
- Brsnob A5 format with Garamond font

More templates will be added in future updates.

Templates are located in `.obsidian/plugins/bookbrew/typeset/layout/`

## Imposition Schemes

Available imposition schemes:
- Brsnob A5 on A4 (4 pages per signature or spread)

Imposition files are in `.obsidian/plugins/bookbrew/typeset/impose/`

## Cover Templates

Cover templates are available for:
- Brsnob A5 format on A3

Cover templates are in `.obsidian/plugins/bookbrew/typeset/cover/`

## File Naming Convention

LaTeX files follow a specific naming convention for each type:

### Layout Files
Format: `[name]-[format]-layout.tex`
- `[name]`: Layout style identifier (can be a font or other identifier)
- `[format]`: Book format (e.g., A5, brsnob)
- Example: `Garamond-brsnoba5-layout.tex`

### Imposition Files
Format: `[format]-[output_format]-[page_count][type].tex`
- `[format]`: Book format accepted by the layout
- `[output_format]`: Printing paper format (e.g., A4, A3)
- `[page_count]`: Number of pages per signature/spread
- `[type]`: 
  - `signature`: Standard imposition without thickness compensation
  - `spread`: Saddle-stitched imposition with thickness compensation
- Example: `brsnoba5-A4-4spread.tex`

### Cover Files
Format: `[name]-[format]-cover-[output_format].tex`
- `[name]`: Cover style identifier
- `[format]`: Book format
- `[output_format]`: Printing paper format
- Example: `Garamond-A5-cover-A3.tex`

## Contributing

Feel free to submit issues and enhancement requests!
