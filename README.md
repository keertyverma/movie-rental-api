# Movie Rental API 🎞️

This API is used for movie rental management with user authentication and authorization.

### Features

- <b>📝 CRUD Operations:</b> Users can Create, Read, Update, and Delete genres, movies, rentals, and customers.
- <b>🔐 Authentication and Authorization:</b> JWT-based authentication ensures that only authenticated users can perform certain operations.
- <b>🗝️ Role based access :</b> Role-based authentication grants administrative privileges for delete operations.
- <b>🎬 Rental Management:</b> Users can create rental entries for customers and movies, updating the stock of movies when a rental is created. Upon returning a rental, the rental fee is calculated, and the movie stock is updated accordingly.
- <b>💼 Transaction Management:</b> Rental creation and rental return operations are performed within transactions to ensure data integrity and consistency.
- <b>🧪 Testing:</b> Comprehensive unit and integration tests are implemented for all routes to ensure reliability and functionality.

### Tech Stack

- NodeJS
- Express
- Typescript
- Mongo DB

### API Endpoints

The API endpoints are accessible at `http://localhost:3000/movie-rental-dev/api/v1`. Below is a summary of available routes:

#### User

| HTTP method | Route           | Description       |
| ----------- | --------------- | ----------------- |
| post        | /users/register | create new user   |
| post        | /auth           | authenticate user |

#### Rental

| HTTP method | Route        | Description                |
| ----------- | ------------ | -------------------------- |
| get         | /rentals     | get all rentals            |
| get         | /rentals/:id | get specific rentals by id |
| post        | /rentals     | add new rentals            |
| post        | /returns     | return rentals             |

#### Customer

| HTTP method | Route          | Description                 |
| ----------- | -------------- | --------------------------- |
| get         | /customers     | get all customers           |
| get         | /customers/:id | get specific customer by id |
| post        | /customers     | add new customer            |
| put         | /customers/:id | update customer by id       |
| delete      | /customers/:id | delete a customer by id     |

#### Movie

| HTTP method | Route       | Description              |
| ----------- | ----------- | ------------------------ |
| get         | /movies     | get all movies           |
| get         | /movies/:id | get specific movie by id |
| post        | /movies     | add new movie            |
| put         | /movies/:id | update movie by id       |
| delete      | /movies/:id | delete a movie by id     |

#### Genre

| HTTP method | Route       | Description              |
| ----------- | ----------- | ------------------------ |
| get         | /genres     | get all genres           |
| get         | /genres/:id | get specific genre by id |
| post        | /genres     | add new genre            |
| patch       | /genres/:id | update genre by id       |
| delete      | /genres/:id | delete a genre by id     |

## Setup

Make sure to follow all the steps mentioned below to run the application

<b>Install MongoDB</b>
To run this project, you need to install the latest version of MongoDB Community Edition first.
https://docs.mongodb.com/manual/installation/

Once you install MongoDB, make sure it's running.

<b>Note:</b> We need to setup replica set in MongoDB in order to work with <b>Transaction</b>.
Follow this to setup replica set in DB - https://blog.tericcabrel.com/mongodb-replica-set-docker-compose/

### Installation

1. Clone the repository
   `git clone <repository-url>`
2. Install Dependencies `npm install`
3. Create `.env` file and setup environment variables.
   ```
   NODE_ENV=development
   PORT=3000
   JWT_PRIVATE_KEY=<your-secret-key>
   ```
4. Set `mongodbURI` variable in `config\development.json` file

   ```json
   {
     "mongodbURI": "mongodb://localhost:27021,localhost:27022,localhost:27023/movierental?replicaSet=dbrs"
   }
   ```

5. Populate the Database `npm run seed`
6. Run the application `npm run dev`.

   This will launch the Node server on port 3000. If that port is busy, you can set a different port in `.env` file.

   Open up your browser and head over to: http://localhost:3000/movie-rental-dev/api/v1/genres

   You should see the list of genres. That confirms that you have set up everything successfully.

7. To run unit tests -> `npm run test:unit`
8. To run integration tests -> `npm run test:integration`

### Contribution

Contributions are welcome! Please open an issue or submit a pull request with any enhancements or fixes.
