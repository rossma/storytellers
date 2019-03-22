# Storytellers backend javascript functions to run within Firebase

## Firebase tools login from command line
firebase login --reauth --no-localhost 

## Firebase tools login from command line behind proxy
firebase login --reauth --no-localhost 

## Deploy all functions
firebase deploy --only functions

### generate-thumbnail
> This function is triggered every time an image is uploaded to the Firebase storage in the 'original' folder.
> It creates a thumbnail of the original image and stores it in a seperate folder.
> It also updates the database containing the Signed URL of the images.

#### Deploy function
firebase deploy --only functions:generateThumbnail  

### delete-story
> This function is triggered every time a record is deleted from the stories collection.

#### Deploy function
firebase deploy --only functions:onDeleteStory

### delete-chapter
> This function is triggered every time a record is deleted from the chapters collection.

#### Deploy function
firebase deploy --only functions:onDeleteChapter

### update-page
> This function is triggered every time a document is updated from the pages collection.

### delete-page
> This function is triggered every time a record is deleted from the pages collection.

### delete-image
> This function is triggered every time a record is deleted from the images collection.

#### Deploy individual functions
firebase deploy --only functions:onDeleteImage
firebase deploy --only functions:onDeletePage
