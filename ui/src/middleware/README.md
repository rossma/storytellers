# MIDDLEWARE

This directory contains the Application Middleware.
The middleware lets you define custom function to be ran before rendering a page or a group of pages (layouts).

More information about the usage of this directory in the documentation:
https://nuxtjs.org/guide/routing#middleware

## check-auth.js - _[deprecated]_
The check-auth.js middleware will be called for every route change. We define this by adding the following router config to the nuxt.config.js configuration file:

```javascript
  router: {
    middleware: 'check-auth'
  }
```
The check-auth.js file takes a function with the <a href="https://nuxtjs.org/api/context">context</a> as its first argument:
```javascript
  export default function (context) {
    ...
  }
```
The check-auth.js does not get used but kept as reference. This was replaced with the authenticated middleware function mentioned below.

## authenticated.js
The authenticated.js is not configured in the nuxt.config.js file as we don't want it to be called for every route change (example like signin, signup). We configure it only on pages that require a user to be authenticated, for example pages/index.vue. We do this in the component itself:

```javascript
 export default {
    middleware: 'authenticated'
  }
```
The authenticated.js file takes a function with the following parameters:

```javascript
  export default function ({ req, error, isServer, isClient, store, route, redirect }) {
    ...
  }
```

For more information on 'pages middleware' please refer to this link: 
https://nuxtjs.org/api/pages-middleware/
