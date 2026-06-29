import { useState } from "react";

function BookForm({ onAddBook }) {
  const [book, setBook] = useState({
    title: "",
    author: "",
    category: "",
    image: "",
    available: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setBook({
      ...book,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!book.title || !book.author || !book.category) {
      alert("Please fill all required fields");
      return;
    }

    if (onAddBook) {
      onAddBook(book);
    }

    setBook({
      title: "",
      author: "",
      category: "",
      image: "",
      available: true,
    });
  };

  return (
    <div className="card p-4 mb-4 shadow">
      <h3 className="mb-3">Add New Book</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={book.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Author</label>
          <input
            type="text"
            className="form-control"
            name="author"
            value={book.author}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            name="category"
            value={book.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Image URL</label>
          <input
            type="text"
            className="form-control"
            name="image"
            value={book.image}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            name="available"
            checked={book.available}
            onChange={handleChange}
          />

          <label className="form-check-label">
            Available
          </label>
        </div>

        <button className="btn btn-success" type="submit">
          Add Book
        </button>
      </form>
    </div>
  );
}

export default BookForm;