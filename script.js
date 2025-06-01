
let produtos = [];
const API_URL = "https://catalogo-backend-97xq.onrender.com/api/produtos";
let editandoProdutoId = null;

async function fetchProdutos() {
  try {
    const res = await fetch(API_URL);
    produtos = await res.json();
    renderCatalog();
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
  }
}

const catalog = document.getElementById("catalog");
const categoryButtons = document.querySelectorAll("#categoryButtons button");
const mainPage = document.getElementById("mainPage");
const detailsPage = document.getElementById("detailsPage");
const detailsContent = document.getElementById("detailsContent");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const productForm = document.getElementById("productForm");
const linksContainer = document.getElementById("linksContainer");

let categoriaAtual = "todos";
let paginaAtual = 1;
const itensPorPagina = 20;

async function salvarProduto(produto) {
  try {
    const method = editandoProdutoId ? "PUT" : "POST";
    const url = editandoProdutoId ? `${API_URL}/${editandoProdutoId}` : API_URL;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produto)
    });
    editandoProdutoId = null;
  } catch (err) {
    console.error("Erro ao salvar produto:", err);
  }
}

function renderCatalog() {
  catalog.innerHTML = "";
  pagination.innerHTML = "";

  const termo = searchInput.value.toLowerCase();
  const filtrados = produtos.filter(p =>
    (categoriaAtual === "todos" || p.categoria === categoriaAtual) &&
    p.nome.toLowerCase().includes(termo)
  );

  const totalPaginas = Math.ceil(filtrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  filtrados.slice(inicio, fim).forEach((p) => {
    const item = document.createElement("div");
    item.classList.add("item");
    item.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}">
      <div class="item-info">
        <h3>${p.nome}</h3>
        <p>${p.descricao}</p>
        <button class="remove-btn" onclick="event.stopPropagation(); removerProduto('${p._id}')">🗑️</button>
        <button class="remove-btn" style="top: 2.2rem; background: #3498db;" onclick="event.stopPropagation(); editarProduto('${p._id}')">✏️</button>
        <span class="price">${p.preco}</span>
        <div class="links-preview">
          ${p.link.map((l, i) => `<a href="${l}" target="_blank">Link ${i + 1}</a>`).join("")}
        </div>
      </div>
    `;
    item.onclick = (e) => {
      if (!e.target.classList.contains('remove-btn')) abrirDetalhes(p);
    };
    catalog.appendChild(item);
  });

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    if (i === paginaAtual) btn.classList.add("active");
    btn.onclick = () => {
      paginaAtual = i;
      fetchProdutos();
    };
    pagination.appendChild(btn);
  }
}

async function removerProduto(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchProdutos();
  } catch (err) {
    console.error("Erro ao remover produto:", err);
  }
}

function editarProduto(id) {
  const produto = produtos.find(p => p._id === id);
  if (!produto) return alert("Produto não encontrado");

  document.getElementById("nome").value = produto.nome;
  document.getElementById("descricao").value = produto.descricao;
  document.getElementById("preco").value = produto.preco;
  document.getElementById("imagem").value = produto.imagem;
  document.getElementById("categoria").value = produto.categoria;

  linksContainer.innerHTML = '';
  produto.link.forEach(link => adicionarCampoLink(link));

  productForm.classList.remove("hidden");
  document.getElementById("toggleFormBtn").textContent = "✖️ Fechar Formulário";
  editandoProdutoId = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

productForm.onsubmit = async (e) => {
  e.preventDefault();
  const novo = {
    nome: document.getElementById("nome").value,
    descricao: document.getElementById("descricao").value,
    preco: document.getElementById("preco").value,
    imagem: document.getElementById("imagem").value,
    categoria: document.getElementById("categoria").value,
    link: Array.from(document.querySelectorAll(".link-input"))
      .map(input => input.value.trim())
      .filter(val => val !== "")
  };
  await salvarProduto(novo);
  productForm.reset();
  linksContainer.innerHTML = '';
  adicionarCampoLink();
  productForm.classList.add("hidden");
  document.getElementById("toggleFormBtn").textContent = "➕ Adicionar Produto";
  fetchProdutos();
};

function abrirDetalhes(produto) {
  mainPage.style.display = "none";
  detailsPage.style.display = "block";
  detailsContent.innerHTML = `
    <img src="${produto.imagem}" alt="${produto.nome}">
    <div class="details-info">
      <h2>${produto.nome}</h2>
      <p>${produto.descricao}</p>
      <span class="price">${produto.preco}</span>
      <div class="links-compra">
        ${produto.link.map((l, i) => `<a href="${l}" target="_blank">Comprar - Link ${i + 1}</a>`).join("")}
      </div>
    </div>
  `;
}

function voltarCatalogo() {
  detailsPage.style.display = "none";
  mainPage.style.display = "block";
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("modoEscuro", isDark ? "sim" : "nao");
  document.querySelector(".toggle-theme").textContent = isDark ? "Modo Claro" : "Modo Escuro";
}

function adicionarCampoLink(valor = "") {
  const grupo = document.createElement("div");
  grupo.className = "link-group";
  grupo.innerHTML = `
    <input type="text" name="links[]" class="link-input" placeholder="https://exemplo.com/produto" value="${valor}" required />
    <button type="button" class="remove-link-btn">✖</button>
  `;
  grupo.querySelector(".remove-link-btn").onclick = () => grupo.remove();
  linksContainer.appendChild(grupo);
}

document.getElementById("addLinkBtn").addEventListener("click", () => {
  adicionarCampoLink();
});

window.onload = () => {
  fetchProdutos();
  const savedTheme = localStorage.getItem("modoEscuro");
  if (savedTheme === "sim") {
    document.body.classList.add("dark-mode");
    document.querySelector(".toggle-theme").textContent = "Modo Claro";
  }
  adicionarCampoLink();
};

document.getElementById("toggleFormBtn").addEventListener("click", () => {
  const isHidden = productForm.classList.toggle("hidden");
  if (isHidden) {
    editandoProdutoId = null;
    productForm.reset();
    linksContainer.innerHTML = '';
    adicionarCampoLink();
  }
  document.getElementById("toggleFormBtn").textContent = isHidden
    ? "➕ Adicionar Produto"
    : "✖️ Fechar Formulário";
});

categoryButtons.forEach(btn => {
  btn.onclick = () => {
    categoryButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    categoriaAtual = btn.dataset.category;
    paginaAtual = 1;
    fetchProdutos();
  };
});

searchInput.addEventListener("input", () => {
  paginaAtual = 1;
  fetchProdutos();
});

setInterval(fetchProdutos, 5000);
