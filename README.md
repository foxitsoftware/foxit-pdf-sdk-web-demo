# Example PDF APP

This project was created for generating PDF example, for implementing the main app Foxit [FOXIT-FRONT-END](https://github.com/foxitsoftware/foxit-pdf-sdk-web-demo-frontend).

The app only generates and displays pdf examples in the iframe. Here use snippets, scenes, and routes.

The application was built with Node 14.16.0.

**NOTE:**
The collaboration example requires version 8.5.1 of the Foxit PDF SDK for Web.

## Available Scripts

In the project directory, you can run:

```
npm install
npm start
```

Runs the app in the development mode.\
Open [http://0.0.0.0:8083](http://0.0.0.0:8083/#/hello) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

```
npm run build
```

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Snippets 

The snippet is used for control and interaction with the PDF Viewer. They are in the folder `src/snippets`.

## Scenes 

Scenes are needed to show the order in which tooltips appear. There are objects with a configuration of tips.
They are in the folder `src/scenes`.

## Routes

Paths through url are implemented in the application, below is the route list.

Example 1 
* [http://0.0.0.0:8083/#/hello](http://0.0.0.0:8083/#/hello)

Example 2
* [http://0.0.0.0:8083/#/annotation](http://0.0.0.0:8083/#/annotation)

Example 3
* [http://0.0.0.0:8083/#/forms](http://0.0.0.0:8083/#/forms)

Example 4
* [http://0.0.0.0:8083/#/redaction](http://0.0.0.0:8083/#/redaction)

Example 5
* [http://0.0.0.0:8083/#/edit_pdfs](http://0.0.0.0:8083/#/edit_pdfs)

Example 6
* [http://0.0.0.0:8083/#/digital_signature](http://0.0.0.0:8083/#/digital_signature)

Example 7
* [http://0.0.0.0:8083/#/search](http://0.0.0.0:8083/#/search)

Example 8
* [http://0.0.0.0:8083/#/measurement](http://0.0.0.0:8083/#/measurement)

Example 9
* [http://0.0.0.0:8083/#/collaboration](http://0.0.0.0:8083/#/collaboration)

Example 10

* [http://0.0.0.0:8083/#/conversion](http://0.0.0.0:8083/#/conversion)
