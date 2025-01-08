const productsList = document.getElementById("components-list"); 
const btnRefreshProductsList = document.getElementById("btn-refresh-components-list"); 

const loadProductsList = async () => {
    try {
        const response = await fetch("/api/products", { method: "GET" }); 
        if (!response.ok) {
            throw new Error("Error al cargar los productos");
        }
        const data = await response.json();
        const products = data.payload; 

        productsList.textContent = "";

        products.forEach((product) => {
            const listItem = document.createElement("li");
            listItem.textContent = `Id: ${product.id} - Nombre: ${product.title}`;
            productsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error al cargar la lista de productos:", error);
        productsList.innerHTML = "<li>Error al cargar los productos.</li>";
    }
};


btnRefreshProductsList.addEventListener("click", () => {
    loadProductsList();
});

loadProductsList();
