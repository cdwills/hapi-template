# Articuwiki

1. Clone this repo
2. `npm install`
3. Edit your .env file based on the .env-sample (Ping Sherry for values)
3. `node start`
4. go to [http://localhost:8008](http://localhost:8008) and you should see a login screen.  Note that login implementation was a last-minute effort at the end of the hackathon and needs serious work (in other words, trashing what's here and preferably integrating of oauth with our google accounts).  Only the index is password-protected at this point.  We tried to avoid putting anything company-sensitive in the database for this reason.

### Routes:
1. / = login or view all 'live' terms
2. /add = Add a term to the wiki
3. /edit = Edit a term
4. Validation of all the data... We didn't spend a lot of time dealing with the data and database.

### Future Hopes:
1. True authentication (not the silliness that is going on here)
2. Switch to postgreSQL instead of mySQL via clearDB
3. Rearchitect the structure (not have everything in the server.js file)
4. Validate data submission


This hackathon project was created using the Hapi Template in Craig's repo [https://github.com/cdwills/hapi-template] (https://github.com/cdwills/hapi-template) as its starting foundation.

# HAPI TEMPLATE

### just clone and copy

1. `npm install`
2. `npm start`
3. go to [http://localhost:8008](http://localhost:8008) and you should see `Hello!`

### To run in docker:
`docker-compose build`

`docker-compose up`

### NOTES: 
- until you create your own .env, it'll complain. 
- you can write all your code in es2015
- testing is ready to be done with Lab
- want changes to load automagically with dev mode? `npm run dev`
- gonna deploy to heroku or someplace? `npm run start`
- run your tests? `npm run test`
