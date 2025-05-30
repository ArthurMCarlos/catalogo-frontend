
const API_URL = "https://catalogo-backend-97xq.onrender.com/api/produtos";

let produtos = [];

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

async function carregarProdutos() {
  try {
    const res = await fetch(API_URL);
    produtos = await res.json();
    renderCatalog();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

async function salvarProduto(produto) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produto),
    });
    await carregarProdutos();
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
  }
}

async function removerProduto(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    await carregarProdutos();
  } catch (error) {
    console.error("Erro ao remover produto:", error);
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
      renderCatalog();
    };
    pagination.appendChild(btn);
  }
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
  linksContainer.innerHTML = "";
  adicionarCampoLink();
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

window.onload = () => {
  const savedTheme = localStorage.getItem("modoEscuro");
  if (savedTheme === "sim") {
    document.body.classList.add("dark-mode");
    document.querySelector(".toggle-theme").textContent = "Modo Claro";
  }
  adicionarCampoLink();
  carregarProdutos();
};
