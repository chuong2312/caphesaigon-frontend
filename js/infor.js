
// Link Backend:
var API_BASE_URL = "https://caphesaigon-backend-api.onrender.com";

// Logic riêng cho trang Infor
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Kiểm tra đăng nhập
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
        alert("Vui lòng đăng nhập trước!");
        window.location.href = 'index.html'; // [COMMENT]: Nếu chưa đăng nhập, đá về trang chủ
        return;
    }

    const user = JSON.parse(userStr);

    // 2. Hiển thị thông tin
    document.getElementById('pName').textContent = user.name;
    document.getElementById('pEmail').textContent = user.email;
    document.getElementById('pPhone').textContent = user.phone || '...';
    document.getElementById('pRole').textContent = user.role === 'admin' ? 'Quản Lý (Admin)' : 'Thành Viên';

    // 3. Nếu là Admin -> Hiện bảng quản lý
    if (user.role === 'admin') {
        document.getElementById('adminArea').style.display = 'block';
        loadCourses();
        loadCustomers();
    }
});

// [COMMENT]: Biến toàn cục để lưu danh sách khóa học hiện tại.
// Giúp ta lấy được thông tin chi tiết khi bấm Sửa mà không cần truyền vào HTML gây lỗi.
let currentCourses = [];

// --- CÁC HÀM ADMIN ---
async function loadCourses() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/api/courses`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include' // <--- QUAN TRỌNG: Để gửi kèm cookie nếu có
        });

        // [COMMENT]: Kiểm tra nếu token hết hạn hoặc lỗi xác thực (401)
        if (res.status === 401) {
            alert("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.");
            logoutUser(); // Gọi hàm đăng xuất bên script.js
            return;
        }

        const data = await res.json();
        
        // [COMMENT]: Lưu dữ liệu mới tải về vào biến toàn cục
        currentCourses = data.data;

        const tbody = document.getElementById('courseTableBody');
        tbody.innerHTML = '';

        currentCourses.forEach(course => {
            const tr = document.createElement('tr');
            // [COMMENT]: Ở nút Sửa, ta chỉ truyền ID vào hàm editCourse.
            // Dữ liệu chi tiết sẽ được tìm trong mảng currentCourses dựa trên ID này.
            // Cách này an toàn hơn, tránh lỗi khi tên món có dấu nháy ' hoặc "
            tr.innerHTML = `
                <td>${course.name}</td>
                <td>${course.price.toLocaleString()}đ</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editCourse('${course._id}')">Sửa</button>
                    <button class="btn-action btn-delete" onclick="deleteCourse('${course._id}')">Xóa</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Lỗi tải khóa học", err);
    }
}

async function loadCustomers() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/api/customers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include' // <--- QUAN TRỌNG
        });
        const data = await res.json();

        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = '';

        data.data.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || '...'}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">
                        ${user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Lỗi tải danh sách thành viên", err);
    }
}

const courseModal = document.getElementById('courseModal');

function openCourseModal() {
    // Reset form add
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    document.getElementById('courseModalTitle').textContent = 'Thêm Khóa Học Mới';
    courseModal.classList.add('active');
}

function closeCourseModal() {
    courseModal.classList.remove('active');
}

// Điền dữ liệu vào form để sửa
// Điền dữ liệu vào form để sửa
window.editCourse = (id) => {
    // [COMMENT]: Tìm món ăn trong danh sách đã tải bằng ID
    const course = currentCourses.find(c => c._id === id);
    
    if (!course) {
        alert("Không tìm thấy thông tin món ăn!");
        return;
    }

    // [COMMENT]: Điền dữ liệu vào form
    document.getElementById('courseId').value = course._id;
    document.getElementById('courseName').value = course.name;
    document.getElementById('coursePrice').value = course.price;
    document.getElementById('courseDesc').value = course.description || '';
    
    // Đổi tiêu đề modal
    document.getElementById('courseModalTitle').textContent = 'Cập Nhật Khóa Học';
    
    // Mở modal
    courseModal.classList.add('active');
};

// Xử lý Submit Form (Thêm hoặc Sửa)
document.getElementById('courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('courseId').value;
    const token = localStorage.getItem('token');
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/api/courses/${id}` : `${API_BASE_URL}/api/courses`;

    // 1. Khởi tạo FormData
    const formData = new FormData();
    formData.append('name', document.getElementById('courseName').value);
    formData.append('price', document.getElementById('coursePrice').value);
    formData.append('description', document.getElementById('courseDesc').value);

    // 2. Check xem có file ảnh không
    const imageInput = document.getElementById('courseImage');
    if (imageInput.files[0]) {
        // [COMMENT]: Lấy file từ input và append vào FormData.
        // Đây là cách chuẩn để gửi file lên server.
        formData.append('image', imageInput.files[0]);
    }

    try {
        // 3. Gọi Fetch API (Lưu ý: KHÔNG để header Content-Type)
        const res = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}` 
                // KHÔNG ĐƯỢC THÊM 'Content-Type': 'application/json' ở đây
                // [COMMENT]: Khi dùng FormData, browser tự động set Content-Type là multipart/form-data kèm boundary.
                // Nếu set tay 'application/json' sẽ bị lỗi server không đọc được file.
            },
            body: formData,
            credentials: 'include' // <--- QUAN TRỌNG
        });

        const data = await res.json();
        if (data.success) {
            alert('Thành công!');
            closeCourseModal();
            loadCourses(); // Tải lại bảng
        } else {
            alert('Lỗi: ' + data.message || 'Không thể thực hiện');
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi kết nối!');
    }
});

// Xóa khóa học
window.deleteCourse = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa không?")) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include' // <--- QUAN TRỌNG
        });
        const data = await res.json();
        if (data.success) {
            alert("Đã xóa!");
            loadCourses();
        } else {
            alert("Lỗi xóa: " + data.message);
        }
    } catch (err) {
        console.error(err);
    }
};
