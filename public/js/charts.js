// Attendance Chart Initialization
function initAttendanceChart(presentDays, absentDays) {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Present', 'Absent'],
            datasets: [{
                label: 'Days',
                data: [presentDays, absentDays],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2,
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Mark Attendance (Faculty)
function markAttendance(studentId, status) {
    fetch('/api/mark-attendance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            student_id: studentId,
            status: status
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message);
                // Update UI
                const buttons = document.querySelectorAll(`[data-student-id="${studentId}"]`);
                buttons.forEach(btn => {
                    btn.classList.remove('btn-success', 'btn-danger');
                    if (btn.dataset.status === status) {
                        btn.classList.add(status === 'present' ? 'btn-success' : 'btn-danger');
                    } else {
                        btn.classList.add('btn-outline-secondary');
                    }
                });
            }
        })
        .catch(error => {
            showAlert('danger', 'Failed to mark attendance');
            console.error(error);
        });
}

// Submit Marks (Faculty)
function submitMarks(event) {
    event.preventDefault();

    const form = event.target;
    const formData = {
        student_id: form.student_id.value,
        subject: form.subject.value,
        marks: form.marks.value
    };

    fetch('/api/submit-marks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message);
                form.reset();
            }
        })
        .catch(error => {
            showAlert('danger', 'Failed to submit marks');
            console.error(error);
        });
}

// Add User (Admin)
function addUser(event) {
    event.preventDefault();

    const form = event.target;
    const formData = {
        email: form.email.value,
        password: form.password.value,
        role: form.role.value,
        fullname: form.fullname.value
    };

    fetch('/api/add-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message);
                form.reset();
                setTimeout(() => location.reload(), 1500);
            } else {
                showAlert('danger', data.message);
            }
        })
        .catch(error => {
            showAlert('danger', 'Failed to add user');
            console.error(error);
        });
}

// Delete User (Admin)
function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
        return;
    }

    fetch('/api/delete-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message);
                setTimeout(() => location.reload(), 1000);
            } else {
                showAlert('danger', data.message);
            }
        })
        .catch(error => {
            showAlert('danger', 'Failed to delete user');
            console.error(error);
        });
}

// Alert System
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
