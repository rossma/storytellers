'use strict';

const mkdirp = require('mkdirp-promise');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

/**
 * When an image is uploaded in the Storage bucket We generate a thumbnail automatically using
 * ImageMagick.
 * After the thumbnail has been generated and uploaded to Cloud Storage,
 * we write the public URL to the images table in the Firestore Database.
 */
exports.handler = function(object, database, storage) {
  /* Note: Cloud Functions has a read-only filesystem except for the /tmp directory. */

  // File and directory paths.
  // const filePath = event.data.name;
  const filePath = object.name; // Path of the File
  console.log('FilePath:', filePath);

  const contentType = object.contentType; // Mime type of the file
  console.log('contentType:', contentType);

  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return Promise.resolve();
  }

  if (filePath.indexOf('images/original') < 0) {
    console.log('image not uploaded to original directory therefore not creating a thumbnail');
    return Promise.resolve();
  }

  // Exit if this is a move or deletion event.
  if (object.resourceState === 'not_exists') {
    console.log('This is a deletion event.');
    return Promise.resolve();
  }
  const fileName = path.basename(filePath);
  const filenameDBKey = path.parse(fileName).name
  console.log('filename:', fileName);

  const local236xDir = path.dirname(filePath.replace('/original','/236x'));
  console.log('local236xDir:', local236xDir);

  const thumb236xFilePath = path.normalize(path.join(local236xDir, `${fileName}`));
  console.log('thumb236xFilePath:', thumb236xFilePath);

  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);

  const tempLocalThumb236xFile = path.join(os.tmpdir(), thumb236xFilePath);
  const tempLocalThumb236xDir = path.dirname(tempLocalThumb236xFile);

  // Cloud Storage files.
  const bucket = storage.bucket(object.bucket);
  const originalFile = bucket.file(filePath);
  const thumb236xFile = bucket.file(thumb236xFilePath);

  // Create the temp directory where the storage file will be downloaded.
  return mkdirp(tempLocalDir).then(() => {
    // Download file from bucket.
    return originalFile.download({destination: tempLocalFile});
  }).then(() => {
    console.log('Local file deleted');
    return mkdirp(tempLocalThumb236xDir);
  }).then(() => {
    console.log('tempLocalThumb236xFile created', tempLocalThumb236xFile);
    // Generate a thumbnail using ImageMagick.
    return spawn('convert', [tempLocalFile, '-thumbnail', '236x>', tempLocalThumb236xFile]);
  }).then(() => {
    console.log('Thumbnail created at', tempLocalThumb236xFile);
    // Uploading the Thumbnail.
    return bucket.upload(tempLocalThumb236xFile, {destination: thumb236xFilePath});
  }).then(() => {
    console.log('Thumbnail uploaded to Storage at', thumb236xFilePath);
    // Once the image has been uploaded delete the local files to free up disk space.
    fs.unlinkSync(tempLocalThumb236xFile);

    fs.unlinkSync(tempLocalFile);

    // Get the Signed URLs for the thumbnail and original image.
    const config = {
      action: 'read',
      expires: '03-01-2500'
    };
    return Promise.all([
      thumb236xFile.getSignedUrl(config),
      originalFile.getSignedUrl(config)
    ]);
  }).then(results => {
    console.log('Got Signed URLs');
    const thumb236xResult = results[0]; // signed URL array
    const originalResult = results[1]; // signed URL array
    const thumb236xFileUrl = thumb236xResult[0];
    const originalFileUrl = originalResult[0];
    // Add the URLs to the Database
    return database.collection('images').doc(filenameDBKey).set({
      filename: fileName,
      originalUrl: originalFileUrl,
      previewUrl: thumb236xFileUrl
    }).then(() => {
      console.log('Thumbnail URLs saved to database.');
      /* Update Preview Record if it exists */
      return database.collection('previews').where('imageFilenameOid', '==', filenameDBKey).limit(1).get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            console.log('Preview record exists for file');
            querySnapshot.docs[0].ref.update({
              previewImageUrl: thumb236xFileUrl
            });
          }
          return true;
        })
        .catch((error) => {
          console.log('Error getting preview documents:', error);
        });
    });
  }).then(() => console.log('Generate Thumbnail Function Completed'));
}
