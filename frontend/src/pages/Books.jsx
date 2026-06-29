import { Link } from "react-router-dom";

import BookCard from "../components/BookCard";

const books = [
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    image: "https://via.placeholder.com/300x400",
    available: true,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Help",
    image: "https://via.placeholder.com/300x400",
    available: false,
  },
];

function Books() {
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Digital Library</h1>

      <div className="card p-4 shadow-sm">
        <h3>Available Books</h3>

        <table className="table table-bordered table-hover mt-3">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Book Name</th>
              <th>Author</th>
              <th>Category</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Clean Code</td>
              <td>Robert C. Martin</td>
              <td>Programming</td>
            </tr>

            <tr>
              <td>2</td>
              <td>The Alchemist</td>
              <td>Paulo Coelho</td>
              <td>Novel</td>
            </tr>

            <tr>
              <td>3</td>
              <td>Atomic Habits</td>
              <td>James Clear</td>
              <td>Self Help</td>
            </tr>
          </tbody>
        </table>

        <Link to="/" className="btn btn-primary mt-3">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Books;