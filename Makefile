.PHONY: build clean release bump-version tag push-tag publish help

# Version management
VERSION := $(shell jq -r .version manifest.json)
NEXT_VERSION ?= $(shell echo $(VERSION) | awk -F. '{$$NF = $$NF + 1;} 1' | sed 's/ /./g')

# Files needed for the extension
EXTENSION_FILES = manifest.json background.js content.js styles.css typeselection.png

# Output directories and files
BUILD_DIR = chrome-extension
ZIP_FILE = type-selection-v$(VERSION).zip

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
	@rm -f type-selection-v*.zip
	@echo "Cleanup complete"

# Version management commands
bump-version:
	@echo "Current version: $(VERSION)"
	@echo "Next version: $(NEXT_VERSION)"
	@jq '.version = "$(NEXT_VERSION)"' manifest.json > manifest.json.tmp
	@mv manifest.json.tmp manifest.json
	@echo "Version bumped to $(NEXT_VERSION)"

# Git and release management
tag:
	@echo "Creating git tag v$(VERSION)..."
	@git add manifest.json
	@git commit -m "Bump version to $(VERSION)"
	@git tag -a v$(VERSION) -m "Release version $(VERSION)"
	@echo "Tag created: v$(VERSION)"

push-tag:
	@echo "Pushing changes and tags to remote..."
	@git push origin main
	@git push origin v$(VERSION)
	@echo "Changes and tags pushed!"

# Create GitHub release
publish: build push-tag
	@echo "Creating GitHub release for v$(VERSION)..."
	@gh release create v$(VERSION) \
		--title "Type Selection v$(VERSION)" \
		--notes-file RELEASE_NOTES.md \
		$(ZIP_FILE)
	@echo "GitHub release v$(VERSION) created!"

# Full release process
release: bump-version tag build push-tag publish
	@echo "Release v$(VERSION) completed!"
	@echo "Don't forget to upload $(ZIP_FILE) to Chrome Web Store"

# Help command
help:
	@echo "Available commands:"
	@echo "  make build         - Create extension package"
	@echo "  make clean         - Clean build files"
	@echo "  make bump-version  - Bump version number"
	@echo "  make tag           - Create git tag"
	@echo "  make push-tag      - Push changes and tags to remote"
	@echo "  make publish       - Create GitHub release"
	@echo "  make release       - Full release process"
	@echo "  make help          - Show this help" 