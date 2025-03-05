document.addEventListener("DOMContentLoaded", function () {
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("book-list");
    const searchInput = document.getElementById("search");
    const filterGenre = document.getElementById("filter-genre");
    const filterStatus = document.getElementById("filter-status");
    const sortTitle = document.getElementById("sort-title");
    const sortAuthor = document.getElementById("sort-author");
    
    let books = [];

    // Add book
    bookForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const series = document.getElementById("series").value;
        const genre = document.getElementById("genre").value;
        const status = document.getElementById("status").value;
        const rating = document.getElementById("rating").value || 0;
        
        const coverImage = await fetchBookCover(title, author);
        
        const book = { title, author, series, genre, status, rating, coverImage };
        books.push(book);
        updateBookList();
        
        bookForm.reset();
    });

    // Fetch book cover from Google Books API or Open Library
    async function fetchBookCover(title, author) {
        const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
        
        try {
            const response = await fetch(googleApiUrl);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                return data.items[0].volumeInfo.imageLinks?.thumbnail || "default-cover.jpg";
            } else {
                return "default-cover.jpg";
            }
        } catch (error) {
            console.error("Error fetching book cover:", error);
            return "default-cover.jpg";
        }
    }

    // Update book list dynamically
    function updateBookList() {
        bookList.innerHTML = "";
        books.forEach((book, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><img src="${book.coverImage}" alt="Cover" class="book-cover"></td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.series || "-"}</td>
                <td>${book.genre}</td>
                <td>${book.status}</td>
                <td>${book.rating} ★</td>
                <td>
                    <button class="btn btn-danger btn-sm delete" data-index="${index}">Delete</button>
                </td>
            `;

            bookList.appendChild(row);
        });
    }

    // Delete book
    bookList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete")) {
            const index = e.target.dataset.index;
            books.splice(index, 1);
            updateBookList();
        }
    });
});


