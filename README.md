This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# HS-Deck-Viewer

Hearhstone Deck Viewer is a website written in reactJS to display deck images

## To run this on Heroku

* Create a new Heroku Project

* Connect this GitHub project to the Heroku Project (under Deploy)

* Make sure you have both the `heroku/python` and `heroku/nodejs` buildpacks added to the project (under Settings)

* Configure Config Vars (Environment Variables)
  * `CLIENT_ID` and `CLIENT_SECRET` should come from the Blizzard api
  * `MONGODB_URI` should be a mongoDB URI
* Any update to the repository should result in a new deployment on Heroku with the changes
