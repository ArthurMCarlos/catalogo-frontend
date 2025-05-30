let produtos = [];
const API_URL = "https://catalogo-backend-97xq.onrender.com/api/produtos";

// Exemplo básico para carregar produtos
async function carregarProdutos() {
  try {
    const res = await fetch(API_URL);
    produtos = await res.json();
    console.log(produtos); // Aqui você renderizaria o catálogo
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
  }
}

window.onload = carregarProdutos;