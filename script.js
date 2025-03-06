document.addEventListener("DOMContentLoaded", function () {
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("book-list");
    const searchInput = document.getElementById("search");
    const filterGenre = document.getElementById("filter-genre");
    const filterStatus = document.getElementById("filter-status");
    const sortBy = document.getElementById("sort-by");
    const groupBy = document.getElementById("group-by");
    const celebrationSound = document.getElementById("celebration-sound");

    let books = [];

    // Add book
    bookForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const title = document.getElementById("title")?.value.trim() || "";
        const author = document.getElementById("author")?.value.trim() || "";
        const series = document.getElementById("series")?.value.trim() || "";
        const genre = document.getElementById("genre")?.value.trim() || "";
        const status = document.getElementById("status")?.value || "To Read";
        const rating = parseFloat(document.getElementById("rating")?.value) || 0;

        if (!title || !author || !genre) {
            alert("Title, Author, and Genre are required!");
            return;
        }

        const coverImage = await fetchBookCover(title, author);

        const book = { title, author, series, genre, status, rating, coverImage };
        books.push(book);
        updateBookList();

        bookForm.reset();
        const modalElement = document.getElementById('addBookModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    });

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

    function updateBookList() {
        bookList.innerHTML = "";
        const searchTerm = searchInput?.value.toLowerCase() || "";
        const genreFilter = filterGenre?.value.toLowerCase() || "";
        const statusFilter = filterStatus?.value || "";
        const sortCriteria = sortBy?.value || "";
        const groupCriteria = groupBy?.value || "";

        let filteredBooks = books.filter((book) => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm);
            const matchesGenre = genreFilter === "" || book.genre.toLowerCase().includes(genreFilter);
            const matchesStatus = statusFilter === "" || book.status === statusFilter;
            return matchesSearch && matchesGenre && matchesStatus;
        });

        if (sortCriteria) {
            filteredBooks.sort((a, b) => {
                switch (sortCriteria) {
                    case "title":
                        return a.title.localeCompare(b.title);
                    case "author":
                        return a.author.localeCompare(b.author);
                    case "genre":
                        return a.genre.localeCompare(b.genre);
                    case "status":
                        return a.status.localeCompare(b.status);
                    case "rating":
                        return b.rating - a.rating;
                    default:
                        return 0;
                }
            });
        }

        if (groupCriteria) {
            const groups = {};
            filteredBooks.forEach((book) => {
                const key = groupCriteria === "series" ? book.series || "No Series" : book.author;
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(book);
            });

            Object.entries(groups).forEach(([groupName, groupBooks]) => {
                const averageRating = (
                    groupBooks.reduce((sum, book) => sum + parseFloat(book.rating), 0) / groupBooks.length
                ).toFixed(2);

                bookList.innerHTML += `
                    <div class="group-header">
                        <span>${groupName}</span>
                        <span class="average-rating">Average Rating: ${averageRating} ★</span>
                    </div>
                `;

                groupBooks.forEach((book, index) => createBookCard(book, index));
            });
        } else {
            filteredBooks.forEach((book, index) => createBookCard(book, index));
        }
    }

    function createBookCard(book, index) {
        const card = document.createElement("div");
        card.className = "col card mb-3 p-2";
        card.innerHTML = `
            <div class="card h-100">
                <img src="${book.coverImage}" class="card-img-top book-cover" alt="Cover">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">Author: ${book.author}</p>
                    <p class="card-text">Series: ${book.series || "-"}</p>
                    <p class="card-text">Genre: ${book.genre}</p>
                    <p class="card-text">Rating: ${book.rating} ★</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-outline-danger btn-sm delete" data-index="${index}">Delete</button>
                </div>
            </div>
        `;
        bookList.appendChild(card);
    }

    bookList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete")) {
            const index = parseInt(e.target.dataset.index, 10);
            if (!isNaN(index)) {
                books.splice(index, 1);
                updateBookList();
            }
        }
    });

    function playCelebrationSound() {
        celebrationSound.play();
    }

    searchInput?.addEventListener("input", updateBookList);
    filterGenre?.addEventListener("change", updateBookList);
    filterStatus?.addEventListener("change", updateBookList);
    sortBy?.addEventListener("change", updateBookList);
    groupBy?.addEventListener("change", updateBookList);
});
