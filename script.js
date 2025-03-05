document.addEventListener("DOMContentLoaded", function () {
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("book-list");
    const searchInput = document.getElementById("search");
    const filterGenre = document.getElementById("filter-genre");
    const filterStatus = document.getElementById("filter-status");
    const sortTitle = document.getElementById("sort-title");
    const sortAuthor = document.getElementById("sort-author");
    const groupBySelect = document.getElementById("group-by-select");

    let books = [];

    // Add book
    bookForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const author = document.getElementById("author").value.trim();
        const series = document.getElementById("series").value.trim();
        const genre = document.getElementById("genre").value.trim();
        const status = document.getElementById("status").value;
        const rating = document.getElementById("rating").value || 0;

        if (!title || !author || !genre) {
            alert("Title, Author, and Genre are required!");
            return;
        }

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

        // Get filter values
        const searchTerm = searchInput.value.toLowerCase();
        const genreFilter = filterGenre.value.toLowerCase();
        const statusFilter = filterStatus.value;

        // Group by selected category (Title or Author)
        const groupBy = groupBySelect.value;

        const filteredBooks = books
            .filter((book) => {
                // Filter by search term (title or author)
                const matchesSearch = book.title.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm);
                // Filter by genre if selected
                const matchesGenre = genreFilter === "" || book.genre.toLowerCase().includes(genreFilter);
                // Filter by status if selected
                const matchesStatus = statusFilter === "" || book.status === statusFilter;

                return matchesSearch && matchesGenre && matchesStatus;
            });

        // Group books by the selected category (title or author)
        const groupedBooks = groupBooks(filteredBooks, groupBy);

        // Display grouped books
        for (const group in groupedBooks) {
            const groupHeader = document.createElement("tr");
            groupHeader.innerHTML = `<td colspan="8" class="font-weight-bold">${group}</td>`;
            bookList.appendChild(groupHeader);

            groupedBooks[group].forEach((book, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td><img src="${book.coverImage}" alt="Cover" class="book-cover"></td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.series || "-"}</td>
                    <td>${book.genre}</td>
                    <td>
                        <select class="form-select status-select" data-index="${index}">
                            <option value="To Read" ${book.status === "To Read" ? "selected" : ""}>To Read</option>
                            <option value="Reading" ${book.status === "Reading" ? "selected" : ""}>Reading</option>
                            <option value="Completed" ${book.status === "Completed" ? "selected" : ""}>Completed</option>
                        </select>
                    </td>
                    <td>${book.rating} ★</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete" data-index="${index}">Delete</button>
                    </td>
                `;

                bookList.appendChild(row);
            });
        }
    }

    // Group books by title or author
    function groupBooks(books, groupBy) {
        const grouped = {};

        books.forEach((book) => {
            const groupKey = groupBy === "author" ? book.author : book.title;
            if (!grouped[groupKey]) {
                grouped[groupKey] = [];
            }
            grouped[groupKey].push(book);
        });

        return grouped;
    }

    // Delete book
    bookList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete")) {
            const index = parseInt(e.target.dataset.index, 10);
            if (!isNaN(index)) {
                books.splice(index, 1);
                updateBookList();
            }
        }
    });

    // Handle status updates
    bookList.addEventListener("change", function (e) {
        if (e.target.classList.contains("status-select")) {
            const index = parseInt(e.target.dataset.index, 10);
            if (!isNaN(index)) {
                const newStatus = e.target.value;
                books[index].status = newStatus;

                // Play celebration sound if status is "Completed"
                if (newStatus === "Completed") {
                    playCelebrationSound();
                }

                updateBookList();
            }
        }
    });

    // Play celebration sound
    function playCelebrationSound() {
        const audio = new Audio('celebration.mp3');  // Replace with your sound file
        audio.play();
    }

    // Search by title and author
    searchInput.addEventListener("input", updateBookList);

    // Filter by genre and status
    filterGenre.addEventListener("change", updateBookList);
    filterStatus.addEventListener("change", updateBookList);

    // Group by title or author
    groupBySelect.addEventListener("change", updateBookList);
});