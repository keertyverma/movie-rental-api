import express, { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Movie Rental API.");
});

app.listen(PORT, () => {
  console.log(console.log(`Listening on port ${PORT}`));
});
