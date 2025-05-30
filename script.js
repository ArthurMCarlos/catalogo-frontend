
let produtos = [];
const API_URL = "https://catalogo-backend-97xq.onrender.com/api/produtos";

async function carregarProdutos() {
  try {
    const res = await fetch(API_URL);
    produtos = await res.json();
    fetchProdutos();
  } catch (e) {
    console.error("Erro ao carregar produtos da API:", e);
  }
}

async function salvarProdutos(produto) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produto)
    });
  } catch (e) {
    console.error("Erro ao salvar produto:", e);
  }
}

async async function removerProduto(nome) {
  const produto = produtos.find(p => p.nome === nome);
  if (!produto || !produto._id) return alert("Produto não encontrado");
  try {
    await fetch(`${API_URL}/${produto._id}`, { method: "DELETE" });
    await fetchProdutos();
  } catch (err) {
    console.error("Erro ao remover produto:", err);
  }

  const produto = produtos.find(p => p.nome === nome);
  if (!produto || !produto._id) return alert("Produto não encontrado");
  try {
    await fetch(`${API_URL}/${produto._id}`, {
      method: "DELETE"
    });
    await carregarProdutos();
  } catch (e) {
    console.error("Erro ao remover produto:", e);
  }
}

function renderCatalog() {
  const catalog = document.getElementById("catalog");
  catalog.innerHTML = "";
  produtos.forEach(produto => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <div class="item-info">
        <h3>${produto.nome}</h3>
        <p>${produto.descricao}</p>
        <span class="price">${produto.preco}</span>
        <div class="links-preview">
          ${(produto.link || []).map((l, i) => `<a href="${l}" target="_blank">Link ${i + 1}</a>`).join("")}
        </div>
        <button onclick="removerProduto('${produto.nome}')">Remover</button>
      </div>
    `;
    catalog.appendChild(item);
  });
}

window.onload = () => {
  fetchProdutos();
  carregarProdutos();
  document.getElementById("productForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const novo = {
      nome: document.getElementById("nome").value,
      descricao: document.getElementById("descricao").value,
      preco: document.getElementById("preco").value,
      imagem: document.getElementById("imagem").value,
      categoria: document.getElementById("categoria").value,
      link: Array.from(document.querySelectorAll(".link-input"))
        .map(input => input.value.trim())
        .filter(link => link)
    };
    await salvarProdutos(novo);
    e.target.reset();
    carregarProdutos();
  });
};
