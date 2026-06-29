import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container mt-5 text-center">
      <h1 className="display-4">📚 Digital Library</h1>

      <p className="lead mt-3">
        Welcome to the Digital Library Management System.
      </p>

      <p>
        Browse books, borrow your favorites, and manage your library account
        easily.
      </p>

      <div className="mt-4">
        <Link to="/books" className="btn btn-primary me-3">
          View Books
        </Link>

        <Link to="/login" className="btn btn-outline-success me-3">
          Login
        </Link>

        <Link to="/register" className="btn btn-outline-dark">
          Register
        </Link>
      </div>

      <hr className="my-5" />

      <div className="row">
        <div className="col-md-4">
          <h3>📖 Thousands of Books</h3>
          <p>Access a wide collection of books from different categories.</p>
        </div>

        <div className="col-md-4">
          <h3>⚡ Easy Borrowing</h3>
          <p>Borrow and return books with just a few clicks.</p>
        </div>

        <div className="col-md-4">
          <h3>👤 User Dashboard</h3>
          <p>Track your borrowed books and reading history.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;