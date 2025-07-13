document.getElementById('searchButton').addEventListener('click', searchStudent);

const UNMASK_TOKEN = 'admin@123'; // <-- Set your token here

function searchStudent() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    if (query === '') {
        return;  // Exit if the search query is empty
    }

    fetch('students_cleaned.csv')
        .then(response => response.text())
        .then(data => {
            const students = parseCSV(data);
            const results = searchInData(students, query);
            displayResults(results);
        })
        .catch(error => console.error('Error fetching the CSV file:', error));
}

function parseCSV(data) {
    const rows = data.split('\n');
    const students = [];
    for (let i = 1; i < rows.length; i++) {  // Skip the header row
        const line = rows[i].trim();
        if (!line) continue; // skip empty lines
        const cols = line.split(',').map(col => col.trim());
        if (cols.length === 5) {
            students.push({
                enrollment: cols[0],
                branch: cols[1],
                name: cols[2],
                phone: cols[3],
                email: cols[4]
            });
        }
    }
    return students;
}

function searchInData(students, query) {
    return students.filter(student => {
        return (
            student.name.toLowerCase().includes(query) ||
            student.enrollment.toLowerCase().includes(query) ||
            student.phone.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query)
        );
    });
}

function maskPhone(phone) {
    if (phone.length <= 4) return phone;
    if (phone.length <= 6) return phone[0] + 'X'.repeat(phone.length - 2) + phone[phone.length - 1];
    // Show first 2 and last 2 digits, mask the rest
    return phone.slice(0, 2) + 'X'.repeat(phone.length - 4) + phone.slice(-2);
}

function displayResults(results) {
    const tableBody = document.getElementById('resultsTable').querySelector('tbody');
    const noResultsMessage = document.getElementById('noResults');
    const resultsContainer = document.getElementById('resultsContainer');
    const isMobile = window.innerWidth <= 600;

    // Clear previous results
    tableBody.innerHTML = '';
    noResultsMessage.style.display = results.length === 0 ? 'block' : 'none';
    document.querySelectorAll('.student-card').forEach(card => card.remove());

    if (results.length > 0) {
        results.forEach((student, idx) => {
            const phoneDisplay = maskPhone(student.phone);

            if (isMobile) {
                // Render as cards
                const card = document.createElement('div');
                card.className = 'student-card';
                card.innerHTML = `
                    <div class="field"><span class="label">Enrollment Number:</span> ${student.enrollment}</div>
                    <div class="field"><span class="label">Branch:</span> ${student.branch}</div>
                    <div class="field"><span class="label">Name:</span> ${student.name}</div>
                    <div class="field phone-field" id="phone-field-card-${idx}">
                        <span class="label">Phone Number:</span> 
                        <span class="phone-value" id="phone-value-card-${idx}">${phoneDisplay}</span>
                        <div class="unmask-container-horizontal" id="unmask-container-card-${idx}">
                            <input type="password" maxlength="16" class="unmask-input" id="unmask-input-card-${idx}" placeholder="Unmask token">
                            <button class="unmask-btn" id="unmask-btn-card-${idx}">Unmask</button>
                        </div>
                        <p class="unmask-note"><strong>Note:</strong> The unmask token is required for privacy reasons. Please contact the site admin to obtain your token.</p>
                    </div>
                    <div class="field"><span class="label">Email:</span> ${student.email}</div>
                `;
                resultsContainer.appendChild(card);

                // Add event listener for unmask
                document.getElementById(`unmask-btn-card-${idx}`).onclick = function() {
                    const token = document.getElementById(`unmask-input-card-${idx}`).value.trim();
                    if (token === UNMASK_TOKEN) {
                        document.getElementById(`phone-value-card-${idx}`).textContent = student.phone;
                        document.getElementById(`unmask-container-card-${idx}`).style.display = 'none';
                    } else {
                        alert('Invalid unmask token!');
                    }
                };
            } else {
                // Render as table rows
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.enrollment}</td>
                    <td>${student.branch}</td>
                    <td>${student.name}</td>
                    <td>
                        <span class="phone-value" id="phone-value-table-${idx}">${phoneDisplay}</span>
                        <div class="unmask-container-horizontal" id="unmask-container-table-${idx}">
                            <input type="password" maxlength="16" class="unmask-input" id="unmask-input-table-${idx}" placeholder="Unmask token">
                            <button class="unmask-btn" id="unmask-btn-table-${idx}">Unmask</button>
                        </div>
                        <p class="unmask-note"><strong>Note:</strong> The unmask token is required for privacy reasons. Please contact the site admin to obtain your token.</p>
                    </td>
                    <td>${student.email}</td>
                `;
                tableBody.appendChild(row);

                // Add event listener for unmask
                document.getElementById(`unmask-btn-table-${idx}`).onclick = function() {
                    const token = document.getElementById(`unmask-input-table-${idx}`).value.trim();
                    if (token === UNMASK_TOKEN) {
                        document.getElementById(`phone-value-table-${idx}`).textContent = student.phone;
                        document.getElementById(`unmask-container-table-${idx}`).style.display = 'none';
                    } else {
                        alert('Invalid unmask token!');
                    }
                };
            }
        });
    }
}