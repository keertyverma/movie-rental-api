import { disconnect } from "mongoose";
import connectDB from ".";
import { Genre } from "../models/genre.model";
import { Movie } from "../models/movie.model";

const data = [
  {
    name: "Comedy",
    movies: [
      { title: "Superbad", numberInStock: 5, dailyRentalRate: 2 },
      { title: "Anchorman", numberInStock: 10, dailyRentalRate: 2 },
      { title: "Bridesmaids", numberInStock: 15, dailyRentalRate: 2 },
    ],
  },
  {
    name: "Action",
    movies: [
      { title: "Inception", numberInStock: 5, dailyRentalRate: 2 },
      { title: "Mad Max: Fury Road", numberInStock: 10, dailyRentalRate: 2 },
      { title: "The Dark Knight", numberInStock: 15, dailyRentalRate: 2 },
    ],
  },
  {
    name: "Romance",
    movies: [
      { title: "La La Land", numberInStock: 5, dailyRentalRate: 2 },
      { title: "500 Days of Summer", numberInStock: 10, dailyRentalRate: 2 },
      {
        title: "Eternal Sunshine of the Spotless Mind",
        numberInStock: 15,
        dailyRentalRate: 2,
      },
    ],
  },
  {
    name: "Thriller",
    movies: [
      { title: "Shutter Island", numberInStock: 5, dailyRentalRate: 2 },
      { title: "Se7en", numberInStock: 10, dailyRentalRate: 2 },
      {
        title: "The Silence of the Lambs",
        numberInStock: 15,
        dailyRentalRate: 2,
      },
    ],
  },
];

async function seed() {
  connectDB();

  await Movie.deleteMany({});
  await Genre.deleteMany({});

  for (let genre of data) {
    const { _id: genreId } = await new Genre({ name: genre.name }).save();
    const movies = genre.movies.map((movie) => ({
      ...movie,
      genre: { _id: genreId, name: genre.name },
    }));
    await Movie.insertMany(movies);
  }

  disconnect();
  console.info("Done");
}

seed();
