      
#!/bin/bash

# Directory to process
DIRECTORY="$1"

# Check if the directory exists
if [ ! -d "$DIRECTORY" ]; then
  echo "Error: Directory '$DIRECTORY' does not exist."
  exit 1
fi

# Function to convert CamelCase to kebab-case
camel_to_kebab() {
  echo "$1" | sed -E 's/([a-z])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]'
}

# Loop through each file in the directory
for filename in "$DIRECTORY"/*; do
  # Skip if it's not a file
  if [ ! -f "$filename" ]; then
    continue
  fi

  # Get the filename without the directory path
  basefilename=$(basename "$filename")

  # Separate name and extension
  name="${basefilename%.*}"
  extension="${basefilename##*.}"

  # Convert the name to kebab-case
  new_name=$(camel_to_kebab "$name")

  # Construct the new filename
  new_filename="${new_name}.${extension}"

  # Check if the file needs renaming (avoid rename to the same name)
  if [ "$basefilename" != "$new_filename" ]; then
      # Rename the file
      mv "$filename" "$DIRECTORY/$new_filename"

      # Print a message
      echo "Renamed '$basefilename' to '$new_filename'"
  else
      echo "Skipping '$basefilename': Already in kebab-case"
  fi
done

echo "Finished processing files."

    