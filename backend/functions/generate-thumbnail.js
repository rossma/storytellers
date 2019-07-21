'use strict'

const path = require('path')
const os = require('os')
const fs = require('fs')
const mkdirp = require('mkdirp-promise')
const spawn = require('child-process-promise').spawn

/**
 * When an image is uploaded in the Storage bucket We generate a thumbnail automatically using
 * ImageMagick.
 * After the thumbnail has been generated and uploaded to Cloud Storage,
 * we write the public URL to the images table in the Firestore Database.
 */
exports.handler = async (object, database, storage) => {
  /* Note: Cloud Functions has a read-only filesystem except for the /tmp directory. */

  // File and directory paths.
  // const filePath = event.data.name;
  const filePath = object.name // Path of the File
  console.log('FilePath:', filePath)

  const contentType = object.contentType // Mime type of the file
  console.log('contentType:', contentType)

  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith('image/')) {
    return console.log('This is not an image.')
  }

  if (filePath.indexOf('images/original') < 0) {
    return console.log(
      'image not uploaded to original directory therefore not meant to create a thumbnail'
    )
  }

  // Exit if this is a move or deletion event.
  if (object.resourceState === 'not_exists') {
    return console.log('This is a deletion event.')
  }
  const fileName = path.basename(filePath)
  const filenameDBKey = path.parse(fileName).name
  console.log('filename:', fileName)

  const local236xDir = path.dirname(filePath.replace('/original', '/236x'))
  console.log('local236xDir:', local236xDir)

  const thumb236xFilePath = path.normalize(
    path.join(local236xDir, `${fileName}`)
  )
  console.log('thumb236xFilePath:', thumb236xFilePath)

  const tempLocalFile = path.join(os.tmpdir(), filePath)
  const tempLocalDir = path.dirname(tempLocalFile)

  const tempLocalThumb236xFile = path.join(os.tmpdir(), thumb236xFilePath)
  const tempLocalThumb236xDir = path.dirname(tempLocalThumb236xFile)

  const metadata = {
    contentType: contentType
    // To enable Client-side caching you can set the Cache-Control headers here. Uncomment below.
    // 'Cache-Control': 'public,max-age=3600',
  }

  // Cloud Storage files.
  const bucket = storage.bucket(object.bucket)
  const originalFile = bucket.file(filePath)
  const thumb236xFile = bucket.file(thumb236xFilePath)

  // Create the temp directory where the storage file will be downloaded.
  await mkdirp(tempLocalDir)

  await originalFile.download({ destination: tempLocalFile })
  console.log('The file has been downloaded to', tempLocalFile)

  await mkdirp(tempLocalThumb236xDir)

  // Generate a thumbnail using ImageMagick.
  await spawn(
    'convert',
    [tempLocalFile, '-thumbnail', '236x>', tempLocalThumb236xFile],
    { capture: ['stdout', 'stderr'] }
  )
  console.log('Thumbnail created at', tempLocalThumb236xFile)

  // Uploading the Thumbnail.
  await bucket.upload(tempLocalThumb236xFile, {
    destination: thumb236xFilePath,
    metadata: metadata
  })
  console.log('Thumbnail uploaded to Storage at', thumb236xFilePath)

  // Once the image has been uploaded delete the local files to free up disk space.
  fs.unlinkSync(tempLocalThumb236xFile)
  fs.unlinkSync(tempLocalFile)

  // Get the Signed URLs for the thumbnail and original image.
  const config = {
    action: 'read',
    expires: '03-01-2500'
  }

  const results = await Promise.all([
    thumb236xFile.getSignedUrl(config),
    originalFile.getSignedUrl(config)
  ])
  console.log('Got Signed URLs.')

  const thumb236xResult = results[0] // signed URL array
  const originalResult = results[1] // signed URL array
  const thumb236xFileUrl = thumb236xResult[0]
  const originalFileUrl = originalResult[0]

  // Add the URLs to the Database
  await database
    .collection('images')
    .doc(filenameDBKey)
    .set({
      filename: fileName,
      originalUrl: originalFileUrl,
      previewUrl: thumb236xFileUrl
    })

  console.log('Thumbnail URLs saved to database', originalFileUrl)

  return console.log('Thumbnail URLs saved to database.')
}
