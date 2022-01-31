const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

//Create a new book. Auth required
router.post(
  "/addBook",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("author", "Enter a valid author").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const book = new Book({
        user: req.user.id,
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        category: req.body.category,
      });
      let books = await book.save();
      res.send(books);
    } catch (error) {
      res.json({ error: "Internal Server Error" });
    }
  }
);

//Get all books of a user
router.get("/getBooks", fetchUser, async (req, res) => {
  try {
    let books = await Book.find({ user: req.user.id });
    if (!books) {
      return res.json({ message: "No books found" });
    }
    res.send(books);
  } catch (error) {
    res.json({ error: "Internal Server Error" });
  }
});

//Delete a book for a user
router.delete("/deleteBook/:id", fetchUser, async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) {
      return res.send("Not found");
    }
    if (book.user.toString() !== req.user.id) {
      return res.send("Not authorized");
    }
    book = await Book.findByIdAndDelete(req.params.id);
    res.json({ Success: "Book deleted successfully", book: book });
  } catch (error) {
    res.json({ error: "Internal Server Error" });
  }
});

//Updating a note for a user
router.put("/updateBook/:id", fetchUser, async (req, res) => {
  let newBook = {};
  const { title, author, description, category } = req.body;
  if (title) {
    newBook.title = title;
  }
  if (author) {
    newBook.author = author;
  }
  if (description) {
    newBook.description = description;
  }
  if (category) {
    newBook.category = category;
  }
  let book = await Book.findById(req.params.id);
  if (!book) {
    return res.send("Not found");
  }
  if (book.user.toString() !== req.user.id) {
    return res.send("Not authorized");
  }
  let updatedBook = await Book.findByIdAndUpdate(req.params.id, {$set: newBook}, {new: true});
  res.json({"Success": "Book updated successfully", book: updatedBook});
});

module.exports = router;
