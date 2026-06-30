import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import heroImage from "./hero.png";

function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState("home"); 

  // Catalog States
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Auth States with Safe Storage Parsing
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // Modals & Form States
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Edit States
  const [showEditBookForm, setShowEditBookForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Catalog Data Retrieval
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/books");
      setBooks(response.data);
      setFilteredBooks(response.data);
      setHasSearched(false);
      setError(null);
    } catch (err) {
      console.error("Database sync dropped:", err);
      setError("Failed to sync library collection. Ensure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Case-Insensitive Search
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
      setHasSearched(false);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const matches = books.filter(
      (book) =>
        (book.title && book.title.toLowerCase().includes(query)) ||
        (book.author && book.author.toLowerCase().includes(query)) ||
        (book.description && book.description.toLowerCase().includes(query))
    );
    setFilteredBooks(matches);
    setHasSearched(true);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setFilteredBooks(books);
      setHasSearched(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await axios.post("/api/auth/register", { name: authName, email: authEmail, password: authPassword });
      }
      const loginRes = await axios.post("/api/auth/login", { email: authEmail, password: authPassword });
      
      if (loginRes.data.token) {
        localStorage.setItem("token", loginRes.data.token);
        localStorage.setItem("user", JSON.stringify(loginRes.data.user));
        setToken(loginRes.data.token);
        setUser(loginRes.data.user);
        setShowAuthForm(false);
        setAuthName(""); setAuthEmail(""); setAuthPassword("");
        fetchBooks();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Authentication dropped.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    fetchBooks();
  };

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post("/api/books", { title: newTitle, author: newAuthor, description: newDescription }, config);
      alert("Book successfully contributed!");
      setNewTitle(""); setNewAuthor(""); setNewDescription(""); setShowAddBookForm(false);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create book entry.");
    }
  };

  // Update logic (Enforces token + updates view)
  const openEditModal = (book) => {
    setEditingBookId(book._id);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditDescription(book.description || "");
    setShowEditBookForm(true);
  };

  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/books/${editingBookId}`, { title: editTitle, author: editAuthor, description: editDescription }, config);
      alert("Book successfully updated!");
      setShowEditBookForm(false); setEditingBookId(null);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update book.");
    }
  };

  // Deletion logic
  const handleDeleteBook = async (bookId) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to remove this book from the digital library?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.delete(`/api/books/${bookId}`, config);
      alert(res.data.message || "Book deleted.");
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete book entry.");
    }
  };

  // Rental transactions logic
  const handleBorrowAction = async (book) => {
    if (!token) {
      alert("Please log in to make a borrow request.");
      setShowAuthForm(true);
      return;
    }
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const currentUserId = user?._id || user?.id;
      if (book.available) {
        const res = await axios.post(`/api/books/${book._id}/borrow`, {}, config);
        alert(res.data.message);
      } else if (book.borrowedBy && book.borrowedBy.toString() === currentUserId?.toString()) {
        await axios.post(`/api/books/${book._id}/return`, {}, config);
        alert("Book successfully unborrowed!");
      }
      fetchBooks(); 
    } catch (err) {
      alert(err.response?.data?.message || "Transaction failed.");
    }
  };

  const renderSmartBorrowButton = (book) => {
    const currentUserId = user?._id || user?.id;
    if (book.available) {
      return <button className="btn-borrow" onClick={() => handleBorrowAction(book)}>Borrow Now</button>;
    }
    if (currentUserId && book.borrowedBy && book.borrowedBy.toString() === currentUserId.toString()) {
      return <button className="btn-borrow" onClick={() => handleBorrowAction(book)} style={{ background: "#ef4444", color: "white" }}>Unborrow Title</button>;
    }
    return <button className="btn-borrow" disabled style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", cursor: "not-allowed", borderColor: "transparent" }}>Borrowed</button>;
  };

  // Helper function to dynamically check if the logged in profile owns this specific asset
  const renderManagementPanel = (book) => {
    if (!token || !user) return null;
    
    const currentUserId = user._id || user.id;
    
    // Explicit guard matching string forms of IDs. If they match, show options.
    if (book.owner && book.owner.toString() === currentUserId.toString()) {
      return (
        <div style={{ display: "flex", gap: "8px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
          <button onClick={() => openEditModal(book)} style={{ flex: 1, padding: "6px", background: "rgba(56, 189, 248, 0.1)", color: "var(--accent-primary)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>Edit</button>
          <button onClick={() => handleDeleteBook(book._id)} style={{ flex: 1, padding: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>Delete</button>
        </div>
      );
    }
    return null; // Return nothing if current account didn't create the book
  };

  return (
    <div className="app">
      {/* Navbar Layout */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setCurrentView("home")} style={{ cursor: "pointer" }}>
          <span className="emoji">📚</span> 
          <h2>Digital Library</h2>
        </div>

        <div className="nav-links">
          <a href="#home" className={currentView === "home" ? "active" : ""} onClick={(e) => { e.preventDefault(); setCurrentView("home"); }}>Home</a>
          <a href="#books" className={currentView === "books" ? "active" : ""} onClick={(e) => { e.preventDefault(); setCurrentView("books"); }}>Books</a>
          <a href="#library" className={currentView === "my-library" ? "active" : ""} onClick={(e) => { e.preventDefault(); setCurrentView("my-library"); }}>My Library Locker</a>
          
          {token && (
            <button className="btn-login" onClick={() => setShowAddBookForm(true)} style={{ borderColor: "var(--accent-primary)", color: "var(--accent-primary)" }}>
              + Add Book
            </button>
          )}

          {token ? (
            <button className="btn-login" onClick={handleLogout}>Logout ({user?.name || "User"})</button>
          ) : (
            <button className="btn-login" onClick={() => { setShowAuthForm(true); setIsRegistering(false); }}>Login</button>
          )}
        </div>
      </nav>

      {/* Pop-up Auth Modal */}
      {showAuthForm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "var(--bg-surface)", padding: "30px", borderRadius: "16px", width: "350px", border: "1px solid var(--border-subtle)", position: "relative" }}>
            <button onClick={() => setShowAuthForm(false)} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            <h2 style={{ marginBottom: "20px" }}>{isRegistering ? "Create Account" : "Sign In"}</h2>
            <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {isRegistering && <input type="text" placeholder="Full Name" required value={authName} onChange={(e) => setAuthName(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)", color: "white" }} />}
              <input type="email" placeholder="Email Address" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)", color: "white" }} />
              <input type="password" placeholder="Password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)", color: "white" }} />
              <button type="submit" className="btn-search" style={{ width: "100%", marginTop: "10px" }}>{isRegistering ? "Register" : "Login"}</button>
            </form>
            <p style={{ marginTop: "20px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              {isRegistering ? "Already have an account? " : "New to the platform? "}
              <span onClick={() => setIsRegistering(!isRegistering)} style={{ color: "var(--accent-primary)", cursor: "pointer", textDecoration: "underline" }}>{isRegistering ? "Sign In" : "Register Here"}</span>
            </p>
          </div>
        </div>
      )}

      {/* Pop-up Add Book Form Modal */}
      {showAddBookForm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "var(--bg-surface)", padding: "30px", borderRadius: "16px", width: "400px", border: "1px solid var(--border-subtle)", position: "relative" }}>
            <button onClick={() => setShowAddBookForm(false)} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            <h2 style={{ marginBottom: "20px", color: "var(--text-primary)" }}>Contribute a New Book</h2>
            <form onSubmit={handleAddBookSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input type="text" placeholder="Book Title" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)", color: "white" }} />
              <input type="text" placeholder="Author" required value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)", color: "white" }} />
              <textarea placeholder="Short Description..." rows="3" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)", color: "white", fontFamily: "inherit", resize: "none" }} />
              <button type="submit" className="btn-search" style={{ width: "100%", marginTop: "10px" }}>Add to Global Catalog</button>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up Edit Book Form Modal */}
      {showEditBookForm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "var(--bg-surface)", padding: "30px", borderRadius: "16px", width: "400px", border: "1px solid var(--border-subtle)", position: "relative" }}>
            <button onClick={() => { setShowEditBookForm(false); setEditingBookId(null); }} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            <h2 style={{ marginBottom: "20px", color: "var(--text-primary)" }}>Edit Book Details</h2>
            <form onSubmit={handleEditBookSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input type="text" placeholder="Book Title" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)", color: "white" }} />
              <input type="text" placeholder="Author" required value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)", color: "white" }} />
              <textarea placeholder="Short Description..." rows="3" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)", color: "white", fontFamily: "inherit", resize: "none" }} />
              <button type="submit" className="btn-search" style={{ width: "100%", marginTop: "10px" }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 1: HOME VIEW */}
      {currentView === "home" && (
        <>
          <header className="hero-container">
            <div className="hero-content">
              <span className="badge">Knowledge Exchange Platform</span>
              <h1>Share. Borrow. <span className="gradient-text">Learn.</span></h1>
              <p>A community-driven digital space designed for students to seamlessly exchange, track, and discover books.</p>
              <form className="search-box" onSubmit={handleSearch}>
                <input type="text" placeholder="Search title, author, or description..." value={searchQuery} onChange={handleSearchInputChange} />
                <button type="submit" className="btn-search">Search</button>
              </form>
            </div>
            <div className="hero-graphic"><div className="graphic-glow-backdrop"></div><img src={heroImage} alt="Digital Graphic" className="floating-asset" /></div>
          </header>

          <main className="featured-section">
            <div className="section-header">
              <h2>{hasSearched ? "Search Results" : "Featured Books"}</h2>
              <p>{hasSearched ? `Found ${filteredBooks.length} titles matching "${searchQuery}"` : "Explore the most requested books in your community today."}</p>
            </div>
            
            {loading && <p style={{ textAlign: 'center' }}>Syncing live library catalog...</p>}
            {error && <p style={{ textAlign: 'center', color: '#ef4444' }}>{error}</p>}

            {!loading && hasSearched && filteredBooks.length === 0 && (
              <div style={{ padding: "40px 20px", background: "var(--bg-surface)", borderRadius: "16px", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontWeight: "500" }}>
                 🔍 Book not found. Try alternative keywords.
              </div>
            )}

            <div className="book-grid">
              {!loading && filteredBooks.map((book) => (
                <article className="book-card" key={book._id}>
                  <div className="book-cover-wrapper"><img src={book.image || "https://covers.openlibrary.org/b/id/240727-M.jpg"} alt={book.title} /></div>
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p>by {book.author}</p>
                    {renderSmartBorrowButton(book)}
                    {/* Management Tray with Smart Ownership Guard */}
                    {renderManagementPanel(book)}
                  </div>
                </article>
              ))}
            </div>
          </main>
        </>
      )}

      {/* VIEW 2: ALL BOOKS CATALOG VIEW */}
      {currentView === "books" && (
        <main className="featured-section" style={{ paddingTop: "40px" }}>
          <div className="section-header">
            <h2>Complete Book Catalog</h2>
            <p>Browse every book available in the shared network database.</p>
          </div>
          <div className="book-grid">
            {books.map((book) => (
              <article className="book-card" key={book._id}>
                <div className="book-cover-wrapper"><img src={book.image || "https://covers.openlibrary.org/b/id/240727-M.jpg"} alt={book.title} /></div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p>by {book.author}</p>
                  {renderSmartBorrowButton(book)}
                  {renderManagementPanel(book)}
                </div>
              </article>
            ))}
          </div>
        </main>
      )}

      {/* VIEW 3: MY LIBRARY LOCKER PANEL */}
      {currentView === "my-library" && (
        <main className="featured-section" style={{ paddingTop: "40px" }}>
          <div className="section-header">
            <h2>My Library Locker</h2>
            <p>Your secure personal space for active loans and borrowed course materials.</p>
          </div>
          {token ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px", margin: "0 auto" }}>
              <h3 style={{ color: "var(--text-primary)", textAlign: "left", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                Active Rentals
              </h3>
              
              {(() => {
                const currentUserId = user?._id || user?.id;
                const myBorrowedBooks = books.filter(b => 
                  b.borrowedBy && currentUserId && b.borrowedBy.toString() === currentUserId.toString()
                );

                if (myBorrowedBooks.length === 0) {
                  return (
                    <div style={{ padding: "40px 20px", background: "var(--bg-surface)", borderRadius: "16px", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                      Your locker is currently empty. Head over to the catalog to find your next read!
                    </div>
                  );
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {myBorrowedBooks.map(book => (
                      <div key={book._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg-surface)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "left" }}>
                          <img src={book.image || "https://covers.openlibrary.org/b/id/240727-M.jpg"} alt={book.title} style={{ width: "45px", height: "65px", objectFit: "cover", borderRadius: "4px" }} />
                          <div>
                            <h4 style={{ color: "white", margin: 0, fontSize: "1.1rem" }}>{book.title}</h4>
                            <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.85rem" }}>by {book.author}</p>
                          </div>
                        </div>
                        
                        <button className="btn-borrow" onClick={() => handleBorrowAction(book)} style={{ width: "auto", padding: "10px 20px", background: "#ef4444", color: "white", borderColor: "transparent" }}>
                          Unborrow Title
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{ padding: "40px", background: "var(--bg-surface)", borderRadius: "12px", display: "inline-block" }}>
              <p style={{ marginBottom: "20px" }}>Please log in to open your personal library locker.</p>
              <button className="btn-search" onClick={() => { setShowAuthForm(true); setIsRegistering(false); }}>Log In Now</button>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;