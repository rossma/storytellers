'use strict';

const generateThumbnailFunction = require('./generate-thumbnail');
const onDeleteStoryFunction = require('./delete-story');
const onDeleteChapterFunction = require('./delete-chapter');
const onDeletePageFunction = require('./delete-page');
const onDeleteImageFunction = require('./delete-image');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')({keyFilename: 'service-account-credentials.json'});
const bucketName = 'storytellers2-13997.appspot.com';

admin.initializeApp(functions.config().firebase);
// const firebaseDatabase = admin.database();
const firestoreDatabase = admin.firestore();

/*
 * Examples:
 * exports.httpsFunction = functions.https.onRequest((req, res) => {
 * exports.firebaseDBFunction = functions.database.ref('/logs/{logid}').onWrite(event => {
 * exports.firestoreDBFunction = functions.firestore.document('stories/{storyId}').onDelete(event => {
 * exports.storageFunction = functions.storage.object().onChange(event => {
 * exports.analyticsFunction = functions.analytics.event('in_app_purchase').onLog(event => {
 */

exports.generateThumbnail = functions.storage.object().onChange(event => {
  return generateThumbnailFunction.handler(event, firestoreDatabase, gcs);
});

exports.onDeleteStory = functions.firestore.document('stories/{storyId}').onDelete(event => {
  return onDeleteStoryFunction.handler(event, firestoreDatabase);
});

exports.onDeleteChapter = functions.firestore.document('chapters/{chapterId}').onDelete(event => {
  return onDeleteChapterFunction.handler(event, firestoreDatabase);
});

exports.onDeletePage = functions.firestore.document('pages/{pageId}').onDelete(event => {
  return onDeletePageFunction.handler(event, firestoreDatabase, gcs, bucketName);
});

exports.onDeleteImage = functions.firestore.document('images/{imageId}').onDelete(event => {
  return onDeleteImageFunction.handler(event, firestoreDatabase, gcs, bucketName);
});