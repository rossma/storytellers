# Generate Thumbnail Firebase Function

> This function is triggered everytime an image is uploaded to the Firebase storage in the 'original' folder.
> It creates a thumbnail of the original image and stores it in a seperate folder.
> It also updates the database containing the Signed URL of the images.  

## Firebase tools login from command line
firebase login --reauth --no-localhost 

## Firebase tools login from command line behind proxy
firebase login --reauth --no-localhost 

## Deploy function
firebase deploy --only functions:generateThumbnail
