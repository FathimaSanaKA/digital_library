import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const fetchBooks = () => {
    axios
      .get("http://localhost:5000/api/books")
      .then((res) => setBooks(res.data))
      .catch((err) => console.log(err));
  };
  const deleteBook = async (id) => {
  await axios.delete(`http://localhost:5000/api/books/${id}`);
  fetchBooks();
};

const editBook = (book) => {
  setEditId(book._id);
  setTitle(book.title);
  setAuthor(book.author);
  setDescription(book.description);
};

  useEffect(() => {
    fetchBooks();
  }, []);

  const addBook = async (e) => {
  e.preventDefault();

  try {
    if (editId) {
      // Update existing book
      await axios.put(`http://localhost:5000/api/books/${editId}`, {
        title,
        author,
        description,
      });

      setEditId(null);
    } else {
      // Add new book
      await axios.post("http://localhost:5000/api/books", {
        title,
        author,
        description,
      });
    }

    setTitle("");
    setAuthor("");
    setDescription("");

    fetchBooks();
  } catch (error) {
    console.log(error);
  }
};
  return (
    <div style={{ padding: "20px" }}>
      <h1>Digital Library</h1>

      <form onSubmit={addBook}>
        <input
          type="text"
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <br /><br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br /><br />
       
      <button type="submit">
  {editId ? "Update Book" : "Add Book"}
</button>

</form>


    
      <hr />
    
      {books.map((book) => (
        <div key={book._id}>
          <h3>{book.title}</h3>
          <p>Author: {book.author}</p>
          <p>{book.description}</p>
          <button onClick={() => editBook(book)}>
  Edit
</button>

<button onClick={() => deleteBook(book._id)}>
  Delete
</button>
          <hr />
        </div>
      ))}
      
    </div>
    
  );
}

export default App;