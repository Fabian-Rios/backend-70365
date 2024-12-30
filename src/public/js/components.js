const componentsList = document.getElementById("components-list");
const btnRefreshComponentsList = document.getElementById("btn-refresh-components-list");

const loadComponentsList = async () => {
    try {
        const response = await fetch("/api/components", { method: "GET" });
        if (!response.ok) {
            throw new Error("Error al cargar los componentes");
        }
        const data = await response.json();
        const components = data.payload;

        componentsList.textContent = "";

        components.forEach((component) => {
            const listItem = document.createElement("li");
            listItem.textContent = `Id: ${component.id} - Nombre: ${component.title}`;
            componentsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error al cargar la lista de componentes:", error);
        componentsList.innerHTML = "<li>Error al cargar los componentes.</li>";
    }
};

btnRefreshComponentsList.addEventListener("click", () => {
    loadComponentsList();
});

loadComponentsList();
