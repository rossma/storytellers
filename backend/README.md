# Storytellers backend javascript functions to run within Firebase

## Firebase tools login from command line
firebase login --reauth --no-localhost 

## Firebase tools login from command line behind proxy
firebase login --reauth --no-localhost 

## Deploy all functions
firebase deploy --only functions:generateThumbnail

### generate-thumbnail
> This function is triggered every time an image is uploaded to the Firebase storage in the 'original' folder.
> It creates a thumbnail of the original image and stores it in a seperate folder.
> It also updates the database containing the Signed URL of the images.

#### Deploy function
firebase deploy --only functions:generateThumbnail  

### delete-story
> This function is triggered every time a record is deleted from the stories collection.
> Data cleanup is performed in this function by removing rows from other referenced documents
> Uploaded files to storage related to this story are also removed

#### Deploy function
firebase deploy --only functions:onDeleteStory

### delete-image
> This function is triggered every time a record is deleted from the images collection probably when an old image is 
replaced with a new one.
> Uploaded files to storage related to this image are removed from storage

#### Deploy function
firebase deploy --only functions:onDeleteImage
