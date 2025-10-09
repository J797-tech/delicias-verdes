/* ------------------ Usuarios para login simulado ------------------ */
const USERS = [
  { id: 1, email: "admin@deliciasverdes.com", password: "admin123", role: "administrador" },
  { id: 2, email: "cocinero@deliciasverdes.com", password: "cocina123", role: "cocinero" },
  { id: 3, email: "mesero@deliciasverdes.com", password: "mesero123", role: "mesero" },
  { id: 4, email: "cliente@deliciasverdes.com", password: "cliente123", role: "cliente" }
];

let currentUser = null;
let redirectTarget = null;

/* ------------------ Funciones de login simulado por  ------------------ */
function login(email, password) {
  const user = USERS.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    alert(`Bienvenido, ${user.role}`);
    // Mostrar interfaz según rol
    applyRoleAccess(user.role);
    return true;
  } else {
    alert("Credenciales incorrectas");
    return false;
  }
}

function logout() {
  currentUser = null;
  alert("Sesión cerrada");
  // Restaurar interfaz a estado no autenticado
  resetRoleAccess();
  window.location.href = '/';
}

// Exponer funciones globalmente para pruebas
window.login = login;
window.logout = logout;

/* ------------------ Control de acceso por rol ------------------ */
function applyRoleAccess(role) {
  // Guardar rol en localStorage para persistencia
  localStorage.setItem("currentUserRole", role);

  // Mostrar botón logout si existe
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = "inline-block";

  // Ocultar botón login si existe
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.style.display = "none";

  // Ocultar modal login si está abierto
  const loginModalEl = document.getElementById("loginModal");
  if (loginModalEl) {
    const modal = bootstrap.Modal.getInstance(loginModalEl);
    if (modal) modal.hide();
  }

  // Adaptar visibilidad de elementos según rol
  if (role === "administrador") {
    showAdminFeatures();
  } else if (role === "cocinero") {
    showCookFeatures();
  } else if (role === "mesero" || role === "cliente") {
    showClientFeatures();
  }
}

function resetRoleAccess() {
  localStorage.removeItem("currentUserRole");

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = "none";

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.style.display = "inline-block";

  // Ocultar elementos según rol (sin recargar)
  showClientFeatures(); // Default a vista cliente/no auth
}

// Funciones para mostrar/ocultar elementos según rol (ejemplo para gestion_platos.html)
function showAdminFeatures() {
  const categoryManagement = document.getElementById("categoryManagement");
  if (categoryManagement) categoryManagement.style.display = "flex";

  const actionsHeader = document.getElementById("actionsHeader");
  if (actionsHeader) actionsHeader.style.display = "table-cell";

  document.querySelectorAll(".actions-cell").forEach(cell => {
    cell.style.display = "table-cell";
  });
}

function showCookFeatures() {
  const categoryManagement = document.getElementById("categoryManagement");
  if (categoryManagement) categoryManagement.style.display = "none";

  const actionsHeader = document.getElementById("actionsHeader");
  if (actionsHeader) actionsHeader.style.display = "table-cell";

  document.querySelectorAll(".actions-cell").forEach(cell => {
    cell.style.display = "table-cell";
  });
}

function showClientFeatures() {
  const categoryManagement = document.getElementById("categoryManagement");
  if (categoryManagement) categoryManagement.style.display = "none";

  const actionsHeader = document.getElementById("actionsHeader");
  if (actionsHeader) actionsHeader.style.display = "none";

  document.querySelectorAll(".actions-cell").forEach(cell => {
    cell.style.display = "none";
  });
}

/* ------------------ Verificación de Autenticación ------------------ */
function checkAuth(requiredRole = null) {
  const savedRole = localStorage.getItem("currentUserRole");
  if (!savedRole) {
    // No autenticado, redirigir a index y mostrar login
    window.location.href = 'index.html';
    return false;
  }
  if (requiredRole && savedRole !== requiredRole) {
    alert(`Acceso denegado. Requiere rol: ${requiredRole}`);
    logout();
    return false;
  }
  // Aplicar acceso por rol
  applyRoleAccess(savedRole);
  return true;
}

// Exponer checkAuth globalmente
window.checkAuth = checkAuth;

// Al cargar la página, aplicar rol guardado si existe
document.addEventListener("DOMContentLoaded", () => {
  const savedRole = localStorage.getItem("currentUserRole");
  if (savedRole) {
    checkAuth();
  }

  // Handle login form submit
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const pass = document.getElementById("loginPassword").value;

      const success = login(email, pass);
      if (!success) {
        return;
      }

      // Hide modal
      const loginModalEl = document.getElementById("loginModal");
      if (loginModalEl) {
        const modal = bootstrap.Modal.getInstance(loginModalEl);
        if (modal) modal.hide();
      }

      // Redirect
      if (redirectTarget) {
        window.location.href = redirectTarget;
      } else {
      // Default redirection based on role
        const user = currentUser;
        if (user) {
          if (user.role === "administrador") {
            window.location.href = "gestion_usuarios.html";
          } else if (user.role === "cocinero") {
            window.location.href = "gestion_platos.html";
          } else if (user.role === "mesero") {
            window.location.href = "gestion_pedidos.html";
          } else {
            // Cliente, stay on current page
          }
        }
      }
    });
  }

  // Modal show event to capture redirect
  const loginModalEl = document.getElementById("loginModal");
  if (loginModalEl) {
    loginModalEl.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      redirectTarget = button ? button.getAttribute('data-redirect') : null;
    });
  }
});
