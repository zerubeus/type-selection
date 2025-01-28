.PHONY: build clean

# Files needed for the extension
EXTENSION_FILES = manifest.json background.js content.js styles.css typeselection.png

# Output directories and files
BUILD_DIR = chrome-extension
ZIP_FILE = type-selection.zip

build: clean
	@echo "Creating extension package..."
	@mkdir -p $(BUILD_DIR)
	@cp $(EXTENSION_FILES) $(BUILD_DIR)
	@cd $(BUILD_DIR) && zip -r ../$(ZIP_FILE) *
	@echo "Package created: $(ZIP_FILE)"
	@echo "Ready to upload to Chrome Web Store!"

clean:
	@echo "Cleaning up..."
	@rm -rf $(BUILD_DIR)
	@rm -f $(ZIP_FILE)
	@echo "Cleanup complete" 