function BookCard({ book }) {
  return (
    <div
      className="card shadow-sm h-100"
      style={{ width: "18rem", margin: "10px" }}
    >
      <img
        src={book.image}
        className="card-img-top"
        alt={book.title}
        style={{ height: "250px", objectFit: "cover" }}
      />

      <div className="card-body">
        <h5 className="card-title">{book.title}</h5>

        <p className="card-text">
          <strong>Author:</strong> {book.author}
        </p>

        <p className="card-text">
          <strong>Category:</strong> {book.category}
        </p>

        <p className="card-text">
          <strong>Available:</strong>{" "}
          {book.available ? "Yes" : "No"}
        </p>

        <button
          className="btn btn-primary w-100"
          disabled={!book.available}
        >
          {book.available ? "Request Book" : "Not Available"}
        </button>
      </div>
    </div>
  );
}

export default BookCard;