# Example PDF APP

This project was created for generate PDF example, for implement main app foxit [FOXIT-FRONT-END](https://github.com/Halo-Lab/foxit-front-end).

The app only generate and display pdf examples in the iframe. Here use snippets, scenes, routes.

The application was built with Node 14.16.0.

## Available Scripts

In the project directory, you can run:

```
npm start
```

Runs the app in the development mode.\
Open [http://0.0.0.0:8082](http://0.0.0.0:8082/#/hello) to view it in the browser.

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
* [http://0.0.0.0:8082/#/hello](http://0.0.0.0:8082/#/hello)

Example 2
* [http://0.0.0.0:8082/#/annotation](http://0.0.0.0:8082/#/annotation)

Example 3
* [http://0.0.0.0:8082/#/forms](http://0.0.0.0:8082/#/forms)

Example 4
* [http://0.0.0.0:8082/#/redaction](http://0.0.0.0:8082/#/redaction)

Example 5
* [http://0.0.0.0:8082/#/edit_pdfs](http://0.0.0.0:8082/#/edit_pdfs)

Example 6
* [http://0.0.0.0:8082/#/digital_signature](http://0.0.0.0:8082/#/digital_signature)

Example 7
* [http://0.0.0.0:8082/#/search](http://0.0.0.0:8082/#/search)

