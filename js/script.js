// --- 1. SLIDER LOGIC (GIỮ NGUYÊN) ---
// const API_BASE_URL = "http://localhost:3000"; // Có thể định nghĩa ở file config riêng nếu muốn
// Nếu đang ở trang infor.html thì API_BASE_URL đã được định nghĩa bên kia, nhưng để chắc chắn ta check
if (typeof API_BASE_URL === 'undefined') {
    var API_BASE_URL = "https://caphesaigon-backend-api.onrender.com";
}

const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

function showSlide(index) {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return; // <--- Mới thêm: Kiểm tra để tránh lỗi nếu không tìm thấy slider
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    currentSlide = index;
    sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}

// Tự động chuyển slide sau 5s
setInterval(() => showSlide(currentSlide + 1), 5000);

// Click vào dot
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
});

// --- CHECK LOGIN STATE ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        const userActionArea = document.getElementById('userActionArea');
        const userInfoArea = document.getElementById('userInfoArea');
        const userNameDisplay = document.getElementById('userNameDisplay');

        if (userActionArea) userActionArea.style.display = 'none';
        if (userInfoArea) userInfoArea.style.display = 'flex';
        if (userNameDisplay) {
            userNameDisplay.textContent = user.name;
            userNameDisplay.style.cursor = 'pointer';
            userNameDisplay.onclick = () => {
                window.location.href = 'infor.html';
            };
        }
    }
});

// --- 2. SCROLL ANIMATION (GIỮ NGUYÊN) ---
window.addEventListener('scroll', () => {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;

    reveals.forEach(reveal => {
        const revealTop = reveal.getBoundingClientRect().top;
        if (revealTop < windowHeight - 100) {
            reveal.classList.add('active');
        }
    });
});

// --- 3. SHOPPING CART LOGIC (GIỮ NGUYÊN) ---
let cart = [];
const cartCountDom = document.getElementById('cartCount');
const cartItemsDom = document.getElementById('cartItems');
const cartTotalDom = document.getElementById('cartTotal');

// Hàm thêm vào giỏ
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const name = e.target.dataset.name;
        const price = parseInt(e.target.dataset.price);

        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        updateCart();

        // Hiệu ứng nút
        const originalText = e.target.textContent;
        e.target.textContent = "✔";
        e.target.style.background = "#2e7d32";
        setTimeout(() => {
            e.target.textContent = originalText;
            e.target.style.background = "";
        }, 800);
    });
});

function updateCart() {
    if (!cartCountDom) return; // <--- Mới thêm: Check lỗi null
    cartCountDom.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        cartItemsDom.innerHTML = "<p style='text-align:center; color:#888'>Giỏ hàng trống trơn...</p>";
        cartTotalDom.textContent = "0đ";
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        html += `
            <div class="cart-item-row">
                <div>
                    <strong>${item.name}</strong> <br>
                    <small>${item.price.toLocaleString()}đ x ${item.quantity}</small>
                </div>
                <div>
                    <span>${(item.price * item.quantity).toLocaleString()}đ</span>
                    <span class="remove-btn" onclick="removeItem(${index})">🗑</span>
                </div>
            </div>
        `;
    });

    cartItemsDom.innerHTML = html;
    cartTotalDom.textContent = total.toLocaleString() + "đ";
}

window.removeItem = (index) => {
    cart.splice(index, 1);
    updateCart();
};

const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) { // <--- Mới thêm: Check lỗi null
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert("Cảm ơn bạn! Đơn hàng đã được gửi đi 🚀");
            cart = [];
            updateCart();
            document.getElementById('cartModal').classList.remove('active');
        } else {
            alert("Bạn chưa chọn món nào cả!");
        }
    });
}

// --- 4. MODAL LOGIC (CÓ SỬA CHÚT ÍT ĐỂ TRÁNH LỖI) ---
const openModal = (btnId, modalId) => {
    const btn = document.getElementById(btnId);
    if (btn) { // <--- Mới thêm: Chỉ gán sự kiện nếu nút tồn tại (Tránh lỗi console)
        btn.addEventListener('click', () => {
            document.getElementById(modalId).classList.add('active');
        });
    }
};

const closeModal = (closeId, modalId) => {
    const closeBtn = document.getElementById(closeId);
    if (closeBtn) { // <--- Mới thêm: Chỉ gán sự kiện nếu nút tồn tại
        closeBtn.addEventListener('click', () => {
            document.getElementById(modalId).classList.remove('active');
        });
    }
};

openModal('cartBtn', 'cartModal');
closeModal('closeCart', 'cartModal');

// openModal('signupBtn', 'signupModal');
// closeModal('closeSignup', 'signupModal');

// Nút bấm vẫn là signupBtn, nhưng mở hộp registerModal
openModal('signupBtn', 'registerModal');
// Nút đóng bây giờ là closeRegister
closeModal('closeRegister', 'registerModal');


// --- 5. FORM SIGNUP SUBMIT (ĐÃ SỬA CHO HTML MỚI) ---
const registerForm = document.getElementById('registerForm');

if (registerForm) { // Kiểm tra nếu form tồn tại thì mới chạy
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Chặn load lại trang

        // Lấy dữ liệu từ các ô input cụ thể
        const name = e.target.querySelector('input[type="text"]').value;
        const email = e.target.querySelector('input[type="email"]').value;
        const phone = e.target.querySelector('input[type="tel"]').value;

        // Form mới có thêm mật khẩu, ta lấy thêm để xử lý
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Kiểm tra mật khẩu xác nhận trước khi gửi
        if (password !== confirmPassword) {
            alert("⚠️ Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            // Gửi dữ liệu về Server
            // Lưu ý: Đảm bảo server của bạn đã xử lý nhận field 'password' nếu cần
            const response = await fetch(`${API_BASE_URL}/api/customers/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Gửi thêm password nếu server cần, hoặc chỉ gửi name, email, phone như cũ
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await response.json();

            // Xử lý phản hồi từ Server
            if (data.success) {
                alert("🎉 " + data.message);
                document.getElementById('registerModal').classList.remove('active'); // Đóng modal mới
                e.target.reset(); // Xóa trắng form
            } else {
                alert("⚠️ " + data.message);
            }
        } catch (err) {
            console.error("Lỗi:", err);
            alert("❌ Lỗi kết nối server! Bạn đã bật backend chưa?");
        }
    });
}


// Click outside to close (GIỮ NGUYÊN)
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
};
// Trong script.js

// --- 1. KÍCH HOẠT MODAL ĐĂNG NHẬP (QUAN TRỌNG) ---
// Mở modal khi bấm nút Đăng nhập trên menu
openModal('loginBtn', 'loginModal');
// Đóng modal khi bấm nút X
closeModal('closeLogin', 'loginModal');


// --- 2. CHUYỂN ĐỔI QUA LẠI GIỮA 2 MODAL ---
const switchToLogin = document.getElementById('switchToLogin');
const switchToRegister = document.getElementById('switchToRegister');

if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerModal').classList.remove('active'); // Tắt đăng ký
        document.getElementById('loginModal').classList.add('active');       // Bật đăng nhập
    });
}

if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginModal').classList.remove('active');    // Tắt đăng nhập
        document.getElementById('registerModal').classList.add('active');    // Bật đăng ký
    });
}


// --- 3. XỬ LÝ FORM ĐĂNG NHẬP (GỌI API) ---
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customers/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert("🎉 " + data.message);

                // 1. Đóng modal
                document.getElementById('loginModal').classList.remove('active');

                // 2. Lưu token (nếu bạn dùng localStorage để lưu phiên)
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data));

                // 3. Cập nhật giao diện (Ẩn nút đăng nhập, hiện tên user)
                const userActionArea = document.getElementById('userActionArea');
                const userInfoArea = document.getElementById('userInfoArea');
                const userNameDisplay = document.getElementById('userNameDisplay');

                if (userActionArea) userActionArea.style.display = 'none';
                if (userInfoArea) userInfoArea.style.display = 'flex';
                if (userNameDisplay) {
                    userNameDisplay.textContent = data.data.name;
                    // Bấm vào tên => Chuyển sang trang infor.html
                    userNameDisplay.style.cursor = 'pointer';
                    userNameDisplay.onclick = () => {
                        window.location.href = 'infor.html';
                    };
                }

                // 4. Xóa form
                e.target.reset();
            } else {
                alert("⚠️ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi kết nối server!");
        }
    });
}

// Hàm Đăng xuất (Gắn vào nút Đăng xuất trong HTML)
// Hàm Đăng xuất (Gắn vào nút Đăng xuất trong HTML)
window.logoutUser = () => {
    // Xóa cookie hoặc token (Tùy backend xử lý, ở đây ta reload trang để reset giao diện)
    if (confirm("Bạn muốn đăng xuất?")) {
        // Ẩn vùng user, hiện lại vùng nút
        // document.getElementById('userActionArea').style.display = 'flex';
        // document.getElementById('userInfoArea').style.display = 'none';

        // Xóa cookie jwt_token (thủ thuật xóa cookie bằng JS)
        document.cookie = "jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Xóa localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        alert("Đã đăng xuất thành công!");
        window.location.href = 'index.html';
        // window.location.reload();
    }
};