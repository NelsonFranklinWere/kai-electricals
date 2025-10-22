#!/bin/bash

# Script to rename all screenshot files to remove spaces and parentheses
# This will rename files like "Screenshot_20251008_134500 (1).jpg" to "Screenshot_20251008_134500_1.jpg"

cd "/home/frank/Documents/VS Code/Sparky_Lights254"

# Create a backup of the original collection.html
cp collection.html collection.html.backup

echo "Starting to rename screenshot files..."

# Counter for tracking progress
count=0
total=$(ls -la | grep "Screenshot.*(" | wc -l)

echo "Found $total screenshot files to rename"

# Process each screenshot file
for file in Screenshot_*"("*")"*.jpg; do
    if [ -f "$file" ]; then
        # Extract the base name and number
        # Example: Screenshot_20251008_134500 (1).jpg -> Screenshot_20251008_134500_1.jpg
        base_name=$(echo "$file" | sed 's/ (.*)\.jpg$//')
        number=$(echo "$file" | sed 's/.*(\([0-9]*\)).*/\1/')
        new_name="${base_name}_${number}.jpg"
        
        echo "Renaming: $file -> $new_name"
        mv "$file" "$new_name"
        
        count=$((count + 1))
        echo "Progress: $count/$total"
    fi
done

echo "Renaming completed! Renamed $count files."
echo "Backup of original collection.html saved as collection.html.backup"
