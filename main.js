// Do your work here...
console.log('Hello, world!');

document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('bookForm');
    const searchForm = document.getElementById('searchBook');
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    const searchBookTitle = document.getElementById('searchBookTitle');
    const bookFormIsComplete = document.getElementById('bookFormIsComplete');
    const bookFormSubmitSpan = document.querySelector('#bookFormSubmit span');

    // Mengubah teks tombol submit berdasarkan status checkbox
    bookFormIsComplete.addEventListener('change', function() {
        bookFormSubmitSpan.textContent = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    });

    // Menyimpan daftar buku ke localStorage
    function saveBooks(books) {
        localStorage.setItem('books', JSON.stringify(books));
    }


    // Memuat daftar buku dari localStorage
    function loadBooks() {
        return JSON.parse(localStorage.getItem('books')) || [];
    }

    function renderBooks(books = loadBooks(), highlightId = null) {
        incompleteBookList.innerHTML = '';
        completeBookList.innerHTML = '';

        // Jika tidak ada buku, tampilkan pesan
        if (books.length === 0) {
            const noDataMsg = document.createElement('div');
            noDataMsg.className = 'no-books-message';
            noDataMsg.textContent = 'Tidak ada buku yang tersedia';
            
            incompleteBookList.appendChild(noDataMsg.cloneNode(true));
            completeBookList.appendChild(noDataMsg.cloneNode(true));
        }

        // Menambahkan setiap buku ke dalam daftar
        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book-item';
            bookElement.dataset.bookid = book.id;
            bookElement.dataset.testid = 'bookItem';
            
             // Efek highlight jika buku merupakan hasil pencarian
            if (highlightId && book.id === highlightId) {
                bookElement.classList.add('highlight');
                
                setTimeout(() => {
                    bookElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }

            // Menampilkan informasi buku
            bookElement.innerHTML = `
                <h3 data-testid="bookItemTitle">${book.title}</h3>
                <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
                <p data-testid="bookItemYear">Tahun: ${book.year}</p>
                <div class="book-buttons">
                    <button class="btn ${book.isComplete ? 'btn-incomplete' : 'btn-complete'}" data-testid="bookItemIsCompleteButton">
                        ${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
                    </button>
                    <button class="btn btn-delete" data-testid="bookItemDeleteButton">Hapus Buku</button>
                    <button class="btn btn-edit" data-testid="bookItemEditButton">Edit Buku</button>
                </div>
            `;

            // untuk tombol pindah rak (Selesai/Belum Selesai)
            const completeButton = bookElement.querySelector('[data-testid="bookItemIsCompleteButton"]');
            completeButton.addEventListener('click', () => {
                const books = loadBooks();
                const bookIndex = books.findIndex(b => b.id === book.id);
                books[bookIndex].isComplete = !books[bookIndex].isComplete;
                saveBooks(books);
                renderBooks();
                
                // Menampilkan notifikasi perubahan status buku
                showNotification(`Buku "${book.title}" telah dipindahkan ke rak ${books[bookIndex].isComplete ? 'Selesai' : 'Belum Selesai'} dibaca`);
            });

            // untuk tombol hapus buku
            const deleteButton = bookElement.querySelector('[data-testid="bookItemDeleteButton"]');
            deleteButton.addEventListener('click', () => {
                if (confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}"?`)) {
                    const books = loadBooks();
                    const filteredBooks = books.filter(b => b.id !== book.id);
                    saveBooks(filteredBooks);
                    renderBooks();
                    
                    // Menampilkan notifikasi penghapusan
                    showNotification(`Buku "${book.title}" telah dihapus`);
                }
            });

            // untuk tombol edit buku
            const editButton = bookElement.querySelector('[data-testid="bookItemEditButton"]');
            editButton.addEventListener('click', () => {
                openEditModal(book);
            });

            // Menambahkan buku ke dalam rak yang sesuai
            if (book.isComplete) {
                completeBookList.appendChild(bookElement);
            } else {
                incompleteBookList.appendChild(bookElement);
            }
        });
    }

    function openEditModal(book) {

        // Create modal container
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        modalContent.innerHTML = `
            <h3>Edit Buku</h3>
            <form id="editBookForm">
                <div class="form-group">
                    <label for="editBookTitle">Judul</label>
                    <input id="editBookTitle" type="text" value="${book.title}" required>
                </div>
                <div class="form-group">
                    <label for="editBookAuthor">Penulis</label>
                    <input id="editBookAuthor" type="text" value="${book.author}" required>
                </div>
                <div class="form-group">
                    <label for="editBookYear">Tahun</label>
                    <input id="editBookYear" type="number" value="${book.year}" required>
                </div>
                <div class="form-group checkbox-group">
                    <label for="editBookIsComplete">Selesai dibaca</label>
                    <input id="editBookIsComplete" type="checkbox" ${book.isComplete ? 'checked' : ''}>
                </div>
                <div class="modal-buttons">
                    <button type="submit" class="btn btn-primary">Simpan</button>
                    <button type="button" class="btn btn-cancel">Batal</button>
                </div>
            </form>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });
        
        // untuk tombol batal
        const cancelButton = modalContent.querySelector('.btn-cancel');
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        
        // untuk menyimpan perubahan buku
        const editForm = modalContent.querySelector('#editBookForm');
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Mengambil nilai input baru
            const editedTitle = document.getElementById('editBookTitle').value;
            const editedAuthor = document.getElementById('editBookAuthor').value;
            const editedYear = parseInt(document.getElementById('editBookYear').value);
            const editedIsComplete = document.getElementById('editBookIsComplete').checked;
            
            const books = loadBooks();
            const bookIndex = books.findIndex(b => b.id === book.id);
            
            // Memperbarui buku dalam daftar
            books[bookIndex].title = editedTitle;
            books[bookIndex].author = editedAuthor;
            books[bookIndex].year = editedYear;
            books[bookIndex].isComplete = editedIsComplete;
            
            saveBooks(books);
            renderBooks();
            
            // Menampilkan notifikasi
            showNotification(`Buku "${editedTitle}" telah diperbarui`);
            
            document.body.removeChild(modalOverlay);
        });
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Menghapus notifikasi setelah 3 detik
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    // Event listener untuk menambahkan buku baru
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Mengambil nilai input dari form
        const title = document.getElementById('bookFormTitle').value;
        const author = document.getElementById('bookFormAuthor').value;
        const year = parseInt(document.getElementById('bookFormYear').value);
        const isComplete = document.getElementById('bookFormIsComplete').checked;

        const books = loadBooks();
        const newBook = {
            id: Date.now().toString(),
            title,
            author,
            year,
            isComplete
        };
        
        // Menambahkan buku baru ke dalam daftar
        books.push(newBook);
        saveBooks(books);
        renderBooks();
        
        // Menampilkan notifikasi bahwa buku telah ditambahkan
        showNotification(`Buku "${title}" telah ditambahkan ke rak ${isComplete ? 'Selesai' : 'Belum Selesai'} dibaca`);
        
        // Mereset form setelah submit
        bookForm.reset();
        bookFormSubmitSpan.textContent = 'Belum selesai dibaca'; // Reset button text
    });

    // untuk pencarian buku
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchBookTitle.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            renderBooks();
            return;
        }
        
        const books = loadBooks();
        const foundBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm)
        );
        
        if (foundBooks.length > 0) {

            // Jika buku ditemukan, tandai hasil pertama yang cocok
            const firstMatch = foundBooks[0];
            renderBooks(books, firstMatch.id);
            showNotification(`Ditemukan ${foundBooks.length} buku yang cocok`);
        } else {
            showNotification('Maaf, tidak ada buku yang cocok dengan pencarian Anda');
            renderBooks(books);
        }
    });

    
    renderBooks();
});