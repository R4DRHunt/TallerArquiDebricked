const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const app = express();

const username = "santiago";
const pass = "taller1";
const cluster = "csqr";

const port = 8080

//Build the uri to connect to the client
const mongoUri = `mongodb+srv://${username}:${pass}@${cluster}.etmozzm.mongodb.net/test`;

//Create a mongoDB client
const client = new MongoClient(mongoUri);

// Define the schema for the GraphQL API
const schema = buildSchema(`
  type User {
    _id: String!
    name: String!
    email: String!
  }

  input UserInput {
    name: String!
    email: String!
  }

  type Mutation {
    createUser(input: UserInput!): User!
    updateUser(id: String!, input: UserInput!): User!
    deleteUser(id: String!): Boolean
  }
  `);

// Define the resolvers for the GraphQL API

const resolvers = {
  createUser: async ({ input }) => {
    console.log("Got a request to CreateUser");
    try{
      const db = client.db('commandDB');
      const result = await db.collection('users').insertOne(input);
      if (!result) {
        throw new Error(`Error creating user`);
      }
      return user;
    }
    catch(error)
    {
      console.error("Error: " + error);
      throw new Error("An error ocurred while processing the query");
    }
  },
  updateUser: async ({ id, input }) => {
    console.log("Got a request to UpdateUser");
    try{
      const db = client.db('commandDB');
      const result = await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: input });
      if (!result) {
        throw new Error(`Error updating user`);
      }
      return result;
    }
    catch(error)
    {
      console.error("Error: " + error);
      throw new Error("An error ocurred while processing the query");
    }
  },
  deleteUser: async ({ id }) => {
    console.log("Got a request to DeleteUser");
    try {
      const db = client.db('commandDB');
      const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    }
    catch(error)
    {
      console.error("Error: " + error);
      throw new Error("An error ocurred while processing the query");
    }
  },
};

// Define the GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolvers,
  graphiql: true,
}));


// Start the server
// Connect to MongoDB and start the server
client.connect().then(() => {
  app.listen(port, () => {
    console.log(`Command server started on localHost port ${port}`);
  });
});