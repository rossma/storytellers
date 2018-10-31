'use strict';

const generateThumbnailFunction = require('./generate-thumbnail');
const onDeleteStoryFunction = require('./delete-story');
const onDeleteChapterFunction = require('./delete-chapter');
const onDeletePageFunction = require('./delete-page');
const onDeleteImageFunction = require('./delete-image');
const onDeleteBookFunction = require('./delete-book');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const bucketName = 'storytellers2-13997.appspot.com';

var serviceAccount = require('./service-account-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://storytellers2-13997.firebaseio.com'
});

const storage = admin.storage();

const firestoreDatabase = admin.firestore();
firestoreDatabase.settings({ timestampsInSnapshots: true });

/*
 * Examples:
 * exports.httpsFunction = functions.https.onRequest((req, res) => {
 * exports.firebaseDBFunction = functions.database.ref('/logs/{logid}').onWrite(event => {
 * exports.firestoreDBFunction = functions.firestore.document('stories/{storyId}').onDelete(event => {
 * exports.storageFunction = functions.storage.object().onChange(event => {
 * exports.analyticsFunction = functions.analytics.event('in_app_purchase').onLog(event => {
 */

exports.generateThumbnail = functions.storage.object().onFinalize(async (object) => {
  return generateThumbnailFunction.handler(object, firestoreDatabase, storage);
});

exports.onDeleteStory = functions.firestore.document('stories/{storyId}').onDelete((snap, context) => {
  return onDeleteStoryFunction.handler(snap, context, firestoreDatabase);
});

exports.onDeleteChapter = functions.firestore.document('chapters/{chapterId}').onDelete((snap, context) => {
  return onDeleteChapterFunction.handler(snap, context, firestoreDatabase);
});

exports.onDeletePage = functions.firestore.document('pages/{pageId}').onDelete((snap, context) => {
  return onDeletePageFunction.handler(snap, context, firestoreDatabase);
});

exports.onDeleteImage = functions.firestore.document('images/{imageId}').onDelete((snap, context) => {
  return onDeleteImageFunction.handler(snap, context, firestoreDatabase, storage, bucketName);
});

exports.onDeleteBook = functions.firestore.document('book/{bookId}').onDelete((snap, context) => {
  return onDeleteBookFunction.handler(snap, context, firestoreDatabase, storage, bucketName);
});
