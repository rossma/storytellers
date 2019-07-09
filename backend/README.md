# Storytellers backend javascript functions to run within Firebase

## Firebase tools login from command line
firebase login --reauth 

## Firebase tools login from command line behind proxy
firebase login --reauth --no-localhost 

## Deploy all functions
firebase deploy --only functions

## Deploy individual functions
firebase deploy --only functions:generateThumbnail  

### generate-thumbnail
> This function is triggered every time an image is uploaded to the Firebase storage in the 'original' folder.
> It creates a thumbnail of the original image and stores it in a seperate folder.
> It also updates the database containing the Signed URL of the images.

* firebase deploy --only functions:generateThumbnail  

### delete-story
> This function is triggered every time a record is deleted from the stories collection.

* firebase deploy --only functions:onDeleteStory

### delete-chapter
> This function is triggered every time a record is deleted from the chapters collection.

* firebase deploy --only functions:onDeleteChapter

### update-page
> This function is triggered every time a document is updated from the pages collection.

* firebase deploy --only functions:onUpdatePage

### delete-page
> This function is triggered every time a record is deleted from the pages collection.

* firebase deploy --only functions:onDeletePage

### delete-page-collaboration
> This function is triggered every time a record is deleted from the pages collaborations collection.

* firebase deploy --only functions:onDeletePageCollaboration

### delete-image
> This function is triggered every time a record is deleted from the images collection.

* firebase deploy --only functions:onDeleteImage

### create-preview
> This function is triggered every time a record is added to the previews collection.

* firebase deploy --only functions:onCreatePreview

### create-page-collaboration
> This function is triggered every time a record is added to the pageCollaborations collection.

* firebase deploy --only functions:onCreatePageCollaboration
